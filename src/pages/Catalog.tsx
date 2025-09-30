import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Libro {
  id: string;
  titulo: string;
  autor: string;
  categoria: string;
  isbn: string;
  estado: string;
  imagen_url: string | null;
}

export default function Catalog() {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [filteredLibros, setFilteredLibros] = useState<Libro[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchLibros();
  }, []);

  useEffect(() => {
    filterLibros();
  }, [searchTerm, categoryFilter, libros]);

  const fetchLibros = async () => {
    try {
      const { data, error } = await supabase
        .from("libros")
        .select("*")
        .order("titulo");

      if (error) throw error;
      setLibros(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los libros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterLibros = () => {
    let filtered = libros;

    if (searchTerm) {
      filtered = filtered.filter(
        (libro) =>
          libro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          libro.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          libro.isbn.includes(searchTerm)
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((libro) => libro.categoria === categoryFilter);
    }

    setFilteredLibros(filtered);
  };

  const handleBorrow = async (libroId: string, titulo: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para solicitar un préstamo",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("prestamos").insert({
        usuario_id: user.id,
        libro_id: libroId,
        estado: "activo",
      });

      if (error) throw error;

      // Update book status
      await supabase
        .from("libros")
        .update({ estado: "prestado" })
        .eq("id", libroId);

      toast({
        title: "¡Préstamo solicitado!",
        description: `Has solicitado el préstamo de "${titulo}"`,
      });

      fetchLibros();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar el préstamo",
        variant: "destructive",
      });
    }
  };

  const categories = ["all", ...Array.from(new Set(libros.map((l) => l.categoria)))];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Cargando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Catálogo de Libros</h1>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, autor o ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.slice(1).map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Books Grid */}
      {filteredLibros.length === 0 ? (
        <p className="text-center text-muted-foreground">No se encontraron libros</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLibros.map((libro) => (
            <Card key={libro.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <BookOpen className="h-12 w-12 text-primary" />
                  <Badge variant={libro.estado === "disponible" ? "default" : "secondary"}>
                    {libro.estado === "disponible" ? "Disponible" : "Prestado"}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-2">{libro.titulo}</CardTitle>
                <CardDescription>{libro.autor}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-semibold">Categoría:</span> {libro.categoria}
                  </p>
                  <p>
                    <span className="font-semibold">ISBN:</span> {libro.isbn}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  disabled={libro.estado === "prestado"}
                  onClick={() => handleBorrow(libro.id, libro.titulo)}
                >
                  {libro.estado === "disponible" ? "Pedir Prestado" : "No Disponible"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
