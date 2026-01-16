-- ============================================
-- SQL untuk RLS tabel roles
-- Mengizinkan READ (SELECT) untuk semua user
-- Memblokir CREATE, UPDATE, DELETE untuk semua user
-- ============================================

-- Pastikan tabel roles ada
CREATE TABLE IF NOT EXISTS public.roles (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Pastikan tabel user_roles ada (mengatasi error relation not exist sebelumnya)
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES public.roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- Aktifkan RLS pada tabel roles
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama jika ada untuk menghindari duplikasi/konflik
DROP POLICY IF EXISTS "Users can view all roles" ON public.roles;
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON public.roles;
DROP POLICY IF EXISTS "Allow public read access to roles" ON public.roles;

-- 1. Buat policy untuk GET (SELECT) - Izinkan semua user (public read)
CREATE POLICY "Allow public read access to roles"
  ON public.roles
  FOR SELECT
  USING (true);

-- 2. Untuk CREATE (INSERT), UPDATE, dan DELETE:
-- Kita tidak membuat policy apa pun. 
-- Secara default di Supabase/PostgreSQL, jika RLS aktif dan tidak ada policy yang cocok, 
-- maka operasi tersebut akan DITOLAK (denied).
-- Jadi dengan hanya memiliki policy SELECT, operasi CUD otomatis tidak bisa dilakukan oleh siapa pun.

-- Isi data default jika belum ada
INSERT INTO public.roles (name) VALUES ('admin') ON CONFLICT (name) DO NOTHING;
INSERT INTO public.roles (name) VALUES ('user') ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE public.roles IS 'Tabel roles dengan akses read-only untuk publik dan proteksi penuh terhadap perubahan data.';
