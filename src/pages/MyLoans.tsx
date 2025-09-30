import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Calendar, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Prestamo {
  id: string;
  libro_id: string;
  fecha_prestamo: string;
  fecha_devolucion: string | null;
  estado: string;
  libros: {
    titulo: string;
    autor: string;
  };
}

interface Reserva {
  id: string;
  sala_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  salas: {
    nombre_sala: string;
    campus: string;
  };
}

export default function MyLoans() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPrestamos();
      fetchReservas();
    }
  }, [user]);

  const fetchPrestamos = async () => {
    try {
      const { data, error } = await supabase
        .from("prestamos")
        .select(`
          *,
          libros (
            titulo,
            autor
          )
        `)
        .eq("usuario_id", user?.id)
        .eq("estado", "activo")
        .order("fecha_prestamo", { ascending: false });

      if (error) throw error;
      setPrestamos(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los préstamos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReservas = async () => {
    try {
      const { data, error } = await supabase
        .from("reservas")
        .select(`
          *,
          salas (
            nombre_sala,
            campus
          )
        `)
        .eq("usuario_id", user?.id)
        .eq("estado", "activa")
        .order("fecha", { ascending: false });

      if (error) throw error;
      setReservas(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las reservas",
        variant: "destructive",
      });
    }
  };

  const cancelPrestamo = async (prestamoId: string, libroId: string, titulo: string) => {
    try {
      const { error: prestamoError } = await supabase
        .from("prestamos")
        .update({ estado: "cancelado" })
        .eq("id", prestamoId);

      if (prestamoError) throw prestamoError;

      const { error: libroError } = await supabase
        .from("libros")
        .update({ estado: "disponible" })
        .eq("id", libroId);

      if (libroError) throw libroError;

      toast({
        title: "Préstamo cancelado",
        description: `Has cancelado el préstamo de "${titulo}"`,
      });

      fetchPrestamos();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo cancelar el préstamo",
        variant: "destructive",
      });
    }
  };

  const cancelReserva = async (reservaId: string, nombreSala: string) => {
    try {
      const { error } = await supabase
        .from("reservas")
        .update({ estado: "cancelada" })
        .eq("id", reservaId);

      if (error) throw error;

      toast({
        title: "Reserva cancelada",
        description: `Has cancelado la reserva de "${nombreSala}"`,
      });

      fetchReservas();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo cancelar la reserva",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Cargando información...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mis Préstamos y Reservas</h1>

      <Tabs defaultValue="books" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="books">
            <BookOpen className="h-4 w-4 mr-2" />
            Préstamos de Libros
          </TabsTrigger>
          <TabsTrigger value="rooms">
            <Calendar className="h-4 w-4 mr-2" />
            Reservas de Salas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="mt-6">
          {prestamos.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">
                  No tienes préstamos activos
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {prestamos.map((prestamo) => (
                <Card key={prestamo.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{prestamo.libros.titulo}</CardTitle>
                        <CardDescription>{prestamo.libros.autor}</CardDescription>
                      </div>
                      <Badge>Activo</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm mb-4">
                      <p>
                        <span className="font-semibold">Fecha de préstamo:</span>{" "}
                        {format(new Date(prestamo.fecha_prestamo), "dd/MM/yyyy", {
                          locale: es,
                        })}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        cancelPrestamo(
                          prestamo.id,
                          prestamo.libro_id,
                          prestamo.libros.titulo
                        )
                      }
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar Préstamo
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rooms" className="mt-6">
          {reservas.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">
                  No tienes reservas activas
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {reservas.map((reserva) => (
                <Card key={reserva.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {reserva.salas.nombre_sala}
                        </CardTitle>
                        <CardDescription>{reserva.salas.campus}</CardDescription>
                      </div>
                      <Badge>Activa</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm mb-4">
                      <p>
                        <span className="font-semibold">Fecha:</span>{" "}
                        {format(new Date(reserva.fecha), "dd/MM/yyyy", { locale: es })}
                      </p>
                      <p>
                        <span className="font-semibold">Horario:</span> {reserva.hora_inicio} -{" "}
                        {reserva.hora_fin}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        cancelReserva(reserva.id, reserva.salas.nombre_sala)
                      }
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar Reserva
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
