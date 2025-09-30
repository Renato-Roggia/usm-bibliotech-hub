-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nombre', 'Usuario'),
    new.email
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create libros table
CREATE TABLE public.libros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  autor TEXT NOT NULL,
  categoria TEXT NOT NULL,
  isbn TEXT UNIQUE NOT NULL,
  estado TEXT NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'prestado')),
  imagen_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.libros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view libros"
  ON public.libros FOR SELECT
  USING (true);

-- Create prestamos table
CREATE TABLE public.prestamos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  libro_id UUID NOT NULL REFERENCES public.libros(id) ON DELETE CASCADE,
  fecha_prestamo TIMESTAMPTZ DEFAULT now(),
  fecha_devolucion TIMESTAMPTZ,
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'devuelto', 'cancelado')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.prestamos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own prestamos"
  ON public.prestamos FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert their own prestamos"
  ON public.prestamos FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own prestamos"
  ON public.prestamos FOR UPDATE
  USING (auth.uid() = usuario_id);

-- Create salas table
CREATE TABLE public.salas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_sala TEXT NOT NULL,
  capacidad INTEGER NOT NULL,
  campus TEXT NOT NULL,
  tipo TEXT NOT NULL,
  tiene_asiento_accesible BOOLEAN DEFAULT false,
  tiene_energia BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.salas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view salas"
  ON public.salas FOR SELECT
  USING (true);

-- Create reservas table
CREATE TABLE public.reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sala_id UUID NOT NULL REFERENCES public.salas(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  estado TEXT NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'cancelada')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reservas"
  ON public.reservas FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can view all reservas for checking availability"
  ON public.reservas FOR SELECT
  USING (estado = 'activa');

CREATE POLICY "Users can insert their own reservas"
  ON public.reservas FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own reservas"
  ON public.reservas FOR UPDATE
  USING (auth.uid() = usuario_id);

-- Create base_datos_cientifica table
CREATE TABLE public.base_datos_cientifica (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  enlace TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  tipos TEXT[] NOT NULL,
  materias TEXT[],
  editores TEXT[],
  modo_acceso TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.base_datos_cientifica ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view base_datos_cientifica"
  ON public.base_datos_cientifica FOR SELECT
  USING (true);

-- Insert sample data for libros
INSERT INTO public.libros (titulo, autor, categoria, isbn, estado, imagen_url) VALUES
  ('Cálculo: Una Variable', 'James Stewart', 'Matemáticas', '978-6074817188', 'disponible', NULL),
  ('Física para Ciencias e Ingeniería', 'Raymond Serway', 'Física', '978-6075191218', 'disponible', NULL),
  ('Química: La Ciencia Central', 'Theodore Brown', 'Química', '978-6073238441', 'disponible', NULL),
  ('Fundamentos de Programación', 'Luis Joyanes', 'Computación', '978-8448160531', 'prestado', NULL),
  ('Mecánica de Fluidos', 'Frank White', 'Ingeniería', '978-6071509048', 'disponible', NULL),
  ('Termodinámica', 'Yunus Çengel', 'Ingeniería', '978-6071513359', 'disponible', NULL),
  ('Álgebra Lineal', 'Gilbert Strang', 'Matemáticas', '978-9687529462', 'disponible', NULL),
  ('Estructuras de Datos en C++', 'Adam Drozdek', 'Computación', '978-9708300477', 'disponible', NULL);

-- Insert sample data for salas
INSERT INTO public.salas (nombre_sala, capacidad, campus, tipo, tiene_asiento_accesible, tiene_energia) VALUES
  ('Sala A1', 4, 'Casa Central Valparaíso', 'Grupal', true, true),
  ('Sala A2', 6, 'Casa Central Valparaíso', 'Grupal', false, true),
  ('Sala B1', 2, 'Casa Central Valparaíso', 'Individual', true, true),
  ('Sala B2', 4, 'Casa Central Valparaíso', 'Grupal', false, false),
  ('Sala C1', 8, 'Santiago San Joaquín', 'Grupal', true, true),
  ('Sala C2', 4, 'Santiago San Joaquín', 'Grupal', false, true),
  ('Sala D1', 2, 'Santiago Vitacura', 'Individual', true, true),
  ('Sala D2', 6, 'Santiago Vitacura', 'Grupal', true, true);

-- Insert sample data for base_datos_cientifica
INSERT INTO public.base_datos_cientifica (titulo, enlace, descripcion, tipos, materias, editores, modo_acceso) VALUES
  ('Airfleets', 'https://www.airfleets.es/home/', 'Airfleets contiene toda la información sobre las aeronaves civiles. Incluyendo la mayoría de los fabricantes en el mundo (Airbus, Boeing, Embraer, Bombardier, Sukhoi, Fokker ,...), Airfleets te informa de movimientos de aeronaves entre los distintos operadores y estado de las flotas de la mayoría de las aerolíneas del mundo.', ARRAY['Acceso Abierto', 'Datos', 'Estadística'], ARRAY['Ingeniería Aeronáutica', 'Transporte'], ARRAY['Airfleets'], 'Acceso Libre'),
  ('IEEE Xplore', 'https://ieeexplore.ieee.org/', 'Base de datos líder en ingeniería eléctrica, electrónica y ciencias de la computación. Contiene más de 5 millones de documentos técnicos y científicos.', ARRAY['Revistas', 'Conferencias', 'Estándares'], ARRAY['Ingeniería Eléctrica', 'Computación', 'Telecomunicaciones'], ARRAY['IEEE'], 'Suscripción Institucional'),
  ('ScienceDirect', 'https://www.sciencedirect.com/', 'Plataforma de texto completo de revistas científicas y libros académicos publicados por Elsevier. Cubre ciencias físicas, ingeniería, ciencias de la vida y ciencias sociales.', ARRAY['Revistas', 'Libros', 'Capítulos'], ARRAY['Ciencias', 'Ingeniería', 'Medicina', 'Ciencias Sociales'], ARRAY['Elsevier'], 'Suscripción Institucional'),
  ('SpringerLink', 'https://link.springer.com/', 'Colección de revistas, libros, protocolos y materiales de referencia en ciencia, tecnología y medicina publicados por Springer.', ARRAY['Revistas', 'Libros', 'Protocolos'], ARRAY['Ciencias', 'Tecnología', 'Medicina'], ARRAY['Springer'], 'Suscripción Institucional'),
  ('Web of Science', 'https://www.webofknowledge.com/', 'Base de datos de citas que proporciona acceso a referencias bibliográficas y citas de publicaciones periódicas y libros en todos los campos del conocimiento.', ARRAY['Índice de Citas', 'Revistas'], ARRAY['Multidisciplinario'], ARRAY['Clarivate Analytics'], 'Suscripción Institucional');

-- Function to check room availability
CREATE OR REPLACE FUNCTION public.check_sala_disponible(
  p_sala_id UUID,
  p_fecha DATE,
  p_hora_inicio TIME,
  p_hora_fin TIME
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1
    FROM public.reservas
    WHERE sala_id = p_sala_id
    AND fecha = p_fecha
    AND estado = 'activa'
    AND (
      (hora_inicio <= p_hora_inicio AND hora_fin > p_hora_inicio)
      OR (hora_inicio < p_hora_fin AND hora_fin >= p_hora_fin)
      OR (hora_inicio >= p_hora_inicio AND hora_fin <= p_hora_fin)
    )
  );
END;
$$;