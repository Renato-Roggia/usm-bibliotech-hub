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
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Clock } from "lucide-react";

interface Sala {
  id: string;
  nombre_sala: string;
  capacidad: number;
  campus: string;
  tipo: string;
  tiene_asiento_accesible: boolean;
  tiene_energia: boolean;
}

interface Reserva {
  id: string;
  sala_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  selected: boolean;
}

export default function Rooms() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [filteredSalas, setFilteredSalas] = useState<Sala[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [campus, setCampus] = useState("all");
  const [capacity, setCapacity] = useState("all");
  const [needsAccessible, setNeedsAccessible] = useState(false);
  const [needsPower, setNeedsPower] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSalas();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchReservas();
    }
  }, [selectedDate]);

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

  const fetchReservas = async () => {
    if (!selectedDate) return;
    
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("reservas")
        .select("*")
        .eq("fecha", dateStr)
        .eq("estado", "activa");

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

  const generateTimeSlots = (salaId: string): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    
    // Generate slots from 8:00 to 20:00 (every 30 minutes)
    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        
        // Check if this slot is reserved
        const isReserved = reservas.some((reserva) => {
          if (reserva.sala_id !== salaId) return false;
          
          const slotTime = `${timeStr}:00`;
          const slotMinutes = hour * 60 + minute;
          
          const startParts = reserva.hora_inicio.split(":");
          const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
          
          const endParts = reserva.hora_fin.split(":");
          const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
          
          return slotMinutes >= startMinutes && slotMinutes < endMinutes;
        });
        
        slots.push({
          time: timeStr,
          available: !isReserved,
          selected: selectedSlots[salaId]?.includes(timeStr) || false,
        });
      }
    }
    
    return slots;
  };

  const handleSlotClick = (salaId: string, time: string, available: boolean) => {
    if (!available) return;

    const currentSlots = selectedSlots[salaId] || [];
    const slotIndex = currentSlots.indexOf(time);

    if (slotIndex > -1) {
      // Deselect slot
      const newSlots = currentSlots.filter((t) => t !== time);
      setSelectedSlots({ ...selectedSlots, [salaId]: newSlots });
    } else {
      // Check if adding this slot would exceed 2 hours (4 slots)
      if (currentSlots.length >= 4) {
        toast({
          title: "Máximo alcanzado",
          description: "Solo puedes reservar hasta 2 horas (4 bloques de 30 minutos)",
          variant: "destructive",
        });
        return;
      }

      // Add slot
      const newSlots = [...currentSlots, time].sort();
      
      // Check if slots are consecutive
      if (!areSlotsConsecutive(newSlots)) {
        toast({
          title: "Bloques no consecutivos",
          description: "Debes seleccionar bloques de tiempo consecutivos",
          variant: "destructive",
        });
        return;
      }

      setSelectedSlots({ ...selectedSlots, [salaId]: newSlots });
    }
  };

  const areSlotsConsecutive = (slots: string[]): boolean => {
    if (slots.length <= 1) return true;

    const sortedSlots = [...slots].sort();
    for (let i = 0; i < sortedSlots.length - 1; i++) {
      const [h1, m1] = sortedSlots[i].split(":").map(Number);
      const [h2, m2] = sortedSlots[i + 1].split(":").map(Number);
      
      const minutes1 = h1 * 60 + m1;
      const minutes2 = h2 * 60 + m2;
      
      if (minutes2 - minutes1 !== 30) {
        return false;
      }
    }
    return true;
  };

  const handleReserve = async (salaId: string, nombreSala: string) => {
    const slots = selectedSlots[salaId];
    
    if (!slots || slots.length === 0) {
      toast({
        title: "Error",
        description: "Debes seleccionar al menos un bloque de tiempo",
        variant: "destructive",
      });
      return;
    }

    try {
      const sortedSlots = [...slots].sort();
      const startTime = `${sortedSlots[0]}:00`;
      
      // Calculate end time
      const [lastHour, lastMinute] = sortedSlots[sortedSlots.length - 1].split(":").map(Number);
      const endMinutes = lastHour * 60 + lastMinute + 30;
      const endHour = Math.floor(endMinutes / 60);
      const endMin = endMinutes % 60;
      const endTime = `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}:00`;

      const { error } = await supabase.from("reservas").insert({
        sala_id: salaId,
        fecha: format(selectedDate, "yyyy-MM-dd"),
        hora_inicio: startTime,
        hora_fin: endTime,
        estado: "activa",
      });

      if (error) throw error;

      toast({
        title: "¡Reserva confirmada!",
        description: `Has reservado ${nombreSala} para el ${format(selectedDate, "dd/MM/yyyy", { locale: es })} de ${sortedSlots[0]} a ${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`,
      });

      // Clear selected slots for this room
      setSelectedSlots({ ...selectedSlots, [salaId]: [] });
      fetchReservas();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar la reserva",
        variant: "destructive",
      });
    }
  };

  const campusList = ["all", ...Array.from(new Set(salas.map((s) => s.campus)))];

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

      <div className="grid lg:grid-cols-4 gap-6 mb-8">
        {/* Filters Section */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Fecha</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>

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
          </CardContent>
        </Card>

        {/* Rooms with Time Slots */}
        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Selecciona bloques de 30 minutos (máximo 2 horas por reserva)
            </p>
          </div>
          
          {filteredSalas.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No se encontraron salas con los filtros seleccionados
            </p>
          ) : (
            <div className="space-y-6">
              {filteredSalas.map((sala) => {
                const timeSlots = generateTimeSlots(sala.id);
                const selectedCount = selectedSlots[sala.id]?.length || 0;

                return (
                  <Card key={sala.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{sala.nombre_sala}</CardTitle>
                          <CardDescription>{sala.campus}</CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge>{sala.tipo}</Badge>
                          {selectedCount > 0 && (
                            <Badge variant="secondary">
                              {selectedCount} bloque{selectedCount > 1 ? 's' : ''} ({selectedCount * 0.5}h)
                            </Badge>
                          )}
                        </div>
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

                      {/* Time Slots Grid */}
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 mb-4">
                        {timeSlots.map((slot) => (
                          <Button
                            key={slot.time}
                            variant={slot.selected ? "default" : slot.available ? "outline" : "secondary"}
                            size="sm"
                            onClick={() => handleSlotClick(sala.id, slot.time, slot.available)}
                            disabled={!slot.available}
                            className="text-xs px-2 py-1 h-auto"
                          >
                            {slot.time}
                          </Button>
                        ))}
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => handleReserve(sala.id, sala.nombre_sala)}
                        disabled={!selectedSlots[sala.id] || selectedSlots[sala.id].length === 0}
                      >
                        Confirmar Reserva
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
