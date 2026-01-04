-- ============================================
-- SQL untuk membuat tabel kos di Supabase
-- Copy seluruh isi file ini dan paste di Supabase SQL Editor
-- ============================================

-- Create table untuk data kos
CREATE TABLE IF NOT EXISTS public.kos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  room_type TEXT NOT NULL,
  facilities TEXT,
  description TEXT,
  available_rooms INTEGER NOT NULL DEFAULT 0 CHECK (available_rooms >= 0),
  total_rooms INTEGER NOT NULL DEFAULT 1 CHECK (total_rooms > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT available_rooms_check CHECK (available_rooms <= total_rooms)
);

-- Create index untuk performa query
CREATE INDEX IF NOT EXISTS idx_kos_user_id ON public.kos(user_id);
CREATE INDEX IF NOT EXISTS idx_kos_city ON public.kos(city);
CREATE INDEX IF NOT EXISTS idx_kos_created_at ON public.kos(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.kos ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all kos
CREATE POLICY "Users can view all kos"
  ON public.kos
  FOR SELECT
  USING (true);

-- Policy: Users can insert their own kos
CREATE POLICY "Users can insert their own kos"
  ON public.kos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own kos
CREATE POLICY "Users can update their own kos"
  ON public.kos
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own kos
CREATE POLICY "Users can delete their own kos"
  ON public.kos
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function untuk auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.kos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

