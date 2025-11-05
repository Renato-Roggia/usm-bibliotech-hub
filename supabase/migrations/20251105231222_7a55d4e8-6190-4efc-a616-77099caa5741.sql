-- Make usuario_id nullable in prestamos table to allow borrowing without user tracking
ALTER TABLE public.prestamos ALTER COLUMN usuario_id DROP NOT NULL;

-- Make usuario_id nullable in reservas table to allow reservations without user tracking
ALTER TABLE public.reservas ALTER COLUMN usuario_id DROP NOT NULL;