import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BaseDatos {
  id: string;
  titulo: string;
  enlace: string;
  descripcion: string;
  tipos: string[];
  materias: string[] | null;
  editores: string[] | null;
  modo_acceso: string;
}

export default function Scientific() {
  const [databases, setDatabases] = useState<BaseDatos[]>([]);
  const [filteredDatabases, setFilteredDatabases] = useState<BaseDatos[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [modoAccesoFilter, setModoAccesoFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDatabases();
  }, []);

  useEffect(() => {
    filterDatabases();
  }, [searchTerm, tipoFilter, modoAccesoFilter, databases]);

  const fetchDatabases = async () => {
    try {
      const { data, error } = await supabase
        .from("base_datos_cientifica")
        .select("*")
        .order("titulo");

      if (error) throw error;
      setDatabases(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las bases de datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterDatabases = () => {
    let filtered = databases;

    if (searchTerm) {
      filtered = filtered.filter(
        (db) =>
          db.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          db.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
          db.editores?.some((e) => e.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (tipoFilter !== "all") {
      filtered = filtered.filter((db) => db.tipos.includes(tipoFilter));
    }

    if (modoAccesoFilter !== "all") {
      filtered = filtered.filter((db) => db.modo_acceso === modoAccesoFilter);
    }

    setFilteredDatabases(filtered);
  };

  const allTipos = Array.from(new Set(databases.flatMap((db) => db.tipos)));
  const allModos = Array.from(new Set(databases.map((db) => db.modo_acceso)));

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Cargando bases de datos...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Base de Datos Científica Biblioteca USM</h1>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, palabra clave o editor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {allTipos.map((tipo) => (
              <SelectItem key={tipo} value={tipo}>
                {tipo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={modoAccesoFilter} onValueChange={setModoAccesoFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Modo de acceso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {allModos.map((modo) => (
              <SelectItem key={modo} value={modo}>
                {modo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {filteredDatabases.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No se encontraron bases de datos con los criterios seleccionados
        </p>
      ) : (
        <div className="space-y-6">
          {filteredDatabases.map((db) => (
            <Card key={db.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{db.titulo}</CardTitle>
                    <CardDescription className="text-base">{db.descripcion}</CardDescription>
                  </div>
                  <Button asChild>
                    <a href={db.enlace} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visitar
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold mb-1">Tipos:</p>
                    <div className="flex flex-wrap gap-2">
                      {db.tipos.map((tipo, idx) => (
                        <Badge key={idx} variant="default">
                          {tipo}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {db.materias && db.materias.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-1">Materias:</p>
                      <div className="flex flex-wrap gap-2">
                        {db.materias.map((materia, idx) => (
                          <Badge key={idx} variant="outline">
                            {materia}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {db.editores && db.editores.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-1">Editores:</p>
                      <p className="text-sm text-muted-foreground">
                        {db.editores.join(", ")}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold mb-1">Modo de acceso:</p>
                    <Badge variant="secondary">{db.modo_acceso}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
