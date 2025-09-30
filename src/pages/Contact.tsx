import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();

  const handleContact = () => {
    toast({
      title: "Función no disponible",
      description: "Esta funcionalidad será añadida próximamente. ¡Que tenga un buen día!",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Contacto</h1>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Casa Central Valparaíso
            </p>
            <p className="text-sm">
              Av. España 1680, Valparaíso, Chile
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Horario de Atención
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Lunes a Viernes: 8:00 - 20:00</p>
            <p className="text-sm">Sábados: 9:00 - 14:00</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Teléfono
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="p-0 h-auto" onClick={handleContact}>
              +56 32 265 4000
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="p-0 h-auto" onClick={handleContact}>
              biblioteca@usm.cl
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 max-w-4xl">
        <CardHeader>
          <CardTitle>Envíanos un mensaje</CardTitle>
          <CardDescription>
            Completa el formulario y nos pondremos en contacto contigo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleContact} className="w-full md:w-auto">
            Formulario de Contacto
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
