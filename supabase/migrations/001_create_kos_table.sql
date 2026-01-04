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

-- Policy: Users can view all kos (atau hanya milik mereka sendiri, sesuaikan kebutuhan)
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

-- Add comments untuk dokumentasi
COMMENT ON TABLE public.kos IS 'Tabel untuk menyimpan data kos/boarding house';
COMMENT ON COLUMN public.kos.id IS 'Primary key, UUID auto-generated';
COMMENT ON COLUMN public.kos.user_id IS 'Foreign key ke auth.users, pemilik kos';
COMMENT ON COLUMN public.kos.name IS 'Nama kos';
COMMENT ON COLUMN public.kos.address IS 'Alamat lengkap kos';
COMMENT ON COLUMN public.kos.city IS 'Kota/kabupaten lokasi kos';
COMMENT ON COLUMN public.kos.price IS 'Harga sewa per bulan dalam Rupiah';
COMMENT ON COLUMN public.kos.room_type IS 'Tipe kamar (contoh: Kamar Mandi Dalam, Kamar Mandi Luar)';
COMMENT ON COLUMN public.kos.facilities IS 'Fasilitas yang tersedia, dipisahkan dengan koma';
COMMENT ON COLUMN public.kos.description IS 'Deskripsi lengkap tentang kos';
COMMENT ON COLUMN public.kos.available_rooms IS 'Jumlah kamar yang tersedia';
COMMENT ON COLUMN public.kos.total_rooms IS 'Total jumlah kamar';
COMMENT ON COLUMN public.kos.created_at IS 'Timestamp ketika data dibuat';
COMMENT ON COLUMN public.kos.updated_at IS 'Timestamp ketika data terakhir diupdate';

