import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Sala {
  id: string;
  nombre_sala: string;
  capacidad: number;
  campus: string;
  tipo: string;
  tiene_asiento_accesible: boolean;
  tiene_energia: boolean;
}

export default function Rooms() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [filteredSalas, setFilteredSalas] = useState<Sala[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState("2");
  const [campus, setCampus] = useState("all");
  const [capacity, setCapacity] = useState("all");
  const [needsAccessible, setNeedsAccessible] = useState(false);
  const [needsPower, setNeedsPower] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchSalas();
  }, []);

  useEffect(() => {
    filterSalas();
  }, [campus, capacity, needsAccessible, needsPower, salas]);

  const fetchSalas = async () => {
    try {
      const { data, error } = await supabase
        .from("salas")
        .select("*")
        .order("nombre_sala");

      if (error) throw error;
      setSalas(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las salas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterSalas = () => {
    let filtered = salas;

    if (campus !== "all") {
      filtered = filtered.filter((sala) => sala.campus === campus);
    }

    if (capacity !== "all") {
      filtered = filtered.filter((sala) => sala.capacidad >= parseInt(capacity));
    }

    if (needsAccessible) {
      filtered = filtered.filter((sala) => sala.tiene_asiento_accesible);
    }

    if (needsPower) {
      filtered = filtered.filter((sala) => sala.tiene_energia);
    }

    setFilteredSalas(filtered);
  };

  const handleReserve = async (salaId: string, nombreSala: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para reservar una sala",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast({
        title: "Error",
        description: "Debes seleccionar fecha y hora",
        variant: "destructive",
      });
      return;
    }

    try {
      const [hours, minutes] = selectedTime.split(":");
      const startTime = `${hours}:${minutes}:00`;
      const endHours = parseInt(hours) + parseInt(duration);
      const endTime = `${endHours.toString().padStart(2, "0")}:${minutes}:00`;

      const { error } = await supabase.from("reservas").insert({
        usuario_id: user.id,
        sala_id: salaId,
        fecha: format(selectedDate, "yyyy-MM-dd"),
        hora_inicio: startTime,
        hora_fin: endTime,
        estado: "activa",
      });

      if (error) throw error;

      toast({
        title: "¡Reserva confirmada!",
        description: `Has reservado ${nombreSala} para el ${format(selectedDate, "dd/MM/yyyy", { locale: es })} de ${selectedTime} a ${endTime}`,
      });

      setSelectedDate(undefined);
      setSelectedTime("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar la reserva",
        variant: "destructive",
      });
    }
  };

  const campusList = ["all", ...Array.from(new Set(salas.map((s) => s.campus)))];
  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Cargando salas...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Reserva de Salas de Estudio</h1>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Filters Section */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Campus</Label>
              <Select value={campus} onValueChange={setCampus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los campus</SelectItem>
                  {campusList.slice(1).map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Capacidad mínima</Label>
              <Select value={capacity} onValueChange={setCapacity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Cualquiera</SelectItem>
                  <SelectItem value="2">2 personas</SelectItem>
                  <SelectItem value="4">4 personas</SelectItem>
                  <SelectItem value="6">6 personas</SelectItem>
                  <SelectItem value="8">8 personas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="accessible"
                checked={needsAccessible}
                onCheckedChange={(checked) => setNeedsAccessible(checked as boolean)}
              />
              <Label htmlFor="accessible">Asiento accesible</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="power"
                checked={needsPower}
                onCheckedChange={(checked) => setNeedsPower(checked as boolean)}
              />
              <Label htmlFor="power">Energía disponible</Label>
            </div>

            <div>
              <Label>Fecha</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>

            <div>
              <Label>Hora de inicio</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar hora" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Duración (horas)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hora</SelectItem>
                  <SelectItem value="2">2 horas</SelectItem>
                  <SelectItem value="3">3 horas</SelectItem>
                  <SelectItem value="4">4 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Rooms Grid */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">
            Salas disponibles ({filteredSalas.length})
          </h2>
          {filteredSalas.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No se encontraron salas con los filtros seleccionados
            </p>
          ) : (
            <div className="grid gap-4">
              {filteredSalas.map((sala) => (
                <Card key={sala.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{sala.nombre_sala}</CardTitle>
                        <CardDescription>{sala.campus}</CardDescription>
                      </div>
                      <Badge>{sala.tipo}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline">Capacidad: {sala.capacidad}</Badge>
                      {sala.tiene_asiento_accesible && (
                        <Badge variant="outline">Accesible</Badge>
                      )}
                      {sala.tiene_energia && <Badge variant="outline">Energía</Badge>}
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => handleReserve(sala.id, sala.nombre_sala)}
                      disabled={!selectedDate || !selectedTime}
                    >
                      Reservar Sala
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
