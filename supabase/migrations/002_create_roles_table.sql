-- ============================================
-- SQL untuk membuat tabel roles dan user_roles
-- Copy seluruh isi file ini dan paste di Supabase SQL Editor
-- ============================================

-- Create table roles
CREATE TABLE IF NOT EXISTS public.roles (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Create table user_roles (junction table)
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- Create indexes untuk performa
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);

-- Enable Row Level Security
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all roles
CREATE POLICY "Users can view all roles"
  ON public.roles
  FOR SELECT
  USING (true);

-- Policy: Only admins can insert roles
CREATE POLICY "Only admins can insert roles"
  ON public.roles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Policy: Only admins can update roles
CREATE POLICY "Only admins can update roles"
  ON public.roles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Policy: Only admins can delete roles
CREATE POLICY "Only admins can delete roles"
  ON public.roles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Policy: Users can view their own roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Only admins can view all user roles
CREATE POLICY "Admins can view all user roles"
  ON public.user_roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Policy: Only admins can insert user roles
CREATE POLICY "Only admins can insert user roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Policy: Only admins can update user roles
CREATE POLICY "Only admins can update user roles"
  ON public.user_roles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Policy: Only admins can delete user roles
CREATE POLICY "Only admins can delete user roles"
  ON public.user_roles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Insert default roles
INSERT INTO public.roles (name) VALUES ('admin') ON CONFLICT (name) DO NOTHING;
INSERT INTO public.roles (name) VALUES ('user') ON CONFLICT (name) DO NOTHING;

-- Function untuk auto-assign role "user" saat user baru dibuat
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_id INTEGER;
BEGIN
  -- Dapatkan role_id untuk role "user"
  SELECT id INTO user_role_id
  FROM public.roles
  WHERE name = 'user'
  LIMIT 1;

  -- Jika role "user" ditemukan, tambahkan ke user_roles
  IF user_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (NEW.id, user_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger untuk auto-assign role "user" saat user baru dibuat di auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add comments untuk dokumentasi
COMMENT ON TABLE public.roles IS 'Tabel untuk menyimpan role/tingkat akses user';
COMMENT ON TABLE public.user_roles IS 'Junction table untuk menghubungkan user dengan role';
COMMENT ON COLUMN public.roles.id IS 'Primary key, auto-increment';
COMMENT ON COLUMN public.roles.name IS 'Nama role (contoh: admin, user)';
COMMENT ON COLUMN public.user_roles.user_id IS 'Foreign key ke auth.users';
COMMENT ON COLUMN public.user_roles.role_id IS 'Foreign key ke roles';
COMMENT ON FUNCTION public.handle_new_user() IS 'Function untuk auto-assign role "user" saat user baru dibuat';

