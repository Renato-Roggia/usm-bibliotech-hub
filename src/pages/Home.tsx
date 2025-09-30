import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar, Database, FileText } from "lucide-react";
import heroImage from "@/assets/library-hero.jpg";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative h-[500px] flex items-center justify-center text-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 51, 102, 0.7), rgba(0, 51, 102, 0.7)), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto px-4 text-primary-foreground">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Biblioteca USM
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Un espacio de conocimiento y aprendizaje para la comunidad universitaria
          </p>
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Acceso Rápido</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BookOpen className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Catálogo de Libros</CardTitle>
              <CardDescription>
                Busca y solicita libros de nuestra colección
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/catalog">
                <Button className="w-full">Explorar Catálogo</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calendar className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Reserva de Salas</CardTitle>
              <CardDescription>
                Reserva salas de estudio individuales o grupales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/rooms">
                <Button className="w-full">Reservar Sala</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Database className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Base de Datos Científica</CardTitle>
              <CardDescription>
                Accede a recursos científicos y académicos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/scientific">
                <Button className="w-full">Explorar Bases</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Mis Préstamos</CardTitle>
              <CardDescription>
                Gestiona tus préstamos y reservas activas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/my-loans">
                <Button className="w-full">Ver Préstamos</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Sobre la Biblioteca USM</h2>
            <p className="text-lg text-muted-foreground mb-4">
              La Biblioteca de la Universidad Técnica Federico Santa María es un centro de recursos
              académicos que apoya la formación de nuestros estudiantes y la investigación de nuestra
              comunidad universitaria.
            </p>
            <p className="text-lg text-muted-foreground">
              Contamos con una amplia colección de libros, revistas, bases de datos científicas y
              espacios de estudio diseñados para potenciar tu aprendizaje.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
