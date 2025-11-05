-- Add editorial and descripcion fields to libros table
ALTER TABLE public.libros 
ADD COLUMN IF NOT EXISTS editorial text,
ADD COLUMN IF NOT EXISTS descripcion text;

-- Update sample data with editorial and descripcion
UPDATE public.libros 
SET 
  editorial = CASE 
    WHEN categoria = 'Ingeniería' THEN 'McGraw-Hill'
    WHEN categoria = 'Ciencias' THEN 'Pearson'
    WHEN categoria = 'Literatura' THEN 'Penguin Random House'
    ELSE 'Editorial Universitaria'
  END,
  descripcion = 'Descripción detallada del libro con información relevante sobre su contenido, temas principales y aplicaciones prácticas.'
WHERE editorial IS NULL;

-- Drop existing restrictive RLS policies
DROP POLICY IF EXISTS "Users can insert their own prestamos" ON public.prestamos;
DROP POLICY IF EXISTS "Users can update their own prestamos" ON public.prestamos;
DROP POLICY IF EXISTS "Users can view their own prestamos" ON public.prestamos;

DROP POLICY IF EXISTS "Users can insert their own reservas" ON public.reservas;
DROP POLICY IF EXISTS "Users can update their own reservas" ON public.reservas;
DROP POLICY IF EXISTS "Users can view their own reservas" ON public.reservas;
DROP POLICY IF EXISTS "Users can view all reservas for checking availability" ON public.reservas;

-- Create new permissive policies for public access
CREATE POLICY "Anyone can view prestamos"
ON public.prestamos FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert prestamos"
ON public.prestamos FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update prestamos"
ON public.prestamos FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete prestamos"
ON public.prestamos FOR DELETE
USING (true);

CREATE POLICY "Anyone can view reservas"
ON public.reservas FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert reservas"
ON public.reservas FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update reservas"
ON public.reservas FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete reservas"
ON public.reservas FOR DELETE
USING (true);

-- Update libros policies to allow updates
DROP POLICY IF EXISTS "Anyone can view libros" ON public.libros;

CREATE POLICY "Anyone can view libros"
ON public.libros FOR SELECT
USING (true);

CREATE POLICY "Anyone can update libros"
ON public.libros FOR UPDATE
USING (true);