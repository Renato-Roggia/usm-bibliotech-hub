import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Libro {
  id: string;
  titulo: string;
  autor: string;
  categoria: string;
  isbn: string;
  estado: string;
  imagen_url: string | null;
  editorial: string | null;
  descripcion: string | null;
}

export default function Catalog() {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [filteredLibros, setFilteredLibros] = useState<Libro[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedLibro, setSelectedLibro] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
    try {
      const { error } = await supabase.from("prestamos").insert({
        usuario_id: "00000000-0000-0000-0000-000000000000",
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

      {/* Books List */}
      {filteredLibros.length === 0 ? (
        <p className="text-center text-muted-foreground">No se encontraron libros</p>
      ) : (
        <div className="space-y-2">
          {filteredLibros.map((libro) => (
            <Card key={libro.id} className="overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => setSelectedLibro(selectedLibro === libro.id ? null : libro.id)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <BookOpen className="h-10 w-10 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{libro.titulo}</h3>
                    <p className="text-sm text-muted-foreground">{libro.autor}</p>
                  </div>
                  <Badge variant={libro.estado === "disponible" ? "default" : "secondary"} className="flex-shrink-0">
                    {libro.estado === "disponible" ? "Disponible" : "Prestado"}
                  </Badge>
                  {selectedLibro === libro.id ? (
                    <ChevronUp className="h-5 w-5 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 flex-shrink-0" />
                  )}
                </div>
              </div>

              {selectedLibro === libro.id && (
                <div className="border-t bg-accent/20">
                  <CardContent className="pt-4 pb-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div>
                          <span className="font-semibold text-sm">Autor:</span>
                          <p className="text-sm">{libro.autor}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-sm">Editorial:</span>
                          <p className="text-sm">{libro.editorial || "No especificada"}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-sm">Categoría:</span>
                          <p className="text-sm">{libro.categoria}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-sm">ISBN:</span>
                          <p className="text-sm">{libro.isbn}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="font-semibold text-sm">Descripción:</span>
                          <p className="text-sm">{libro.descripcion || "No disponible"}</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-4"
                      disabled={libro.estado === "prestado"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBorrow(libro.id, libro.titulo);
                      }}
                    >
                      {libro.estado === "disponible" ? "Pedir Prestado" : "No Disponible"}
                    </Button>
                  </CardContent>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
