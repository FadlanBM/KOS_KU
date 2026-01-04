-- ============================================
-- SQL untuk memperbaiki infinite recursion pada RLS policy
-- Copy seluruh isi file ini dan paste di Supabase SQL Editor
-- ============================================

-- Drop existing policies yang menyebabkan infinite recursion
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete user roles" ON public.user_roles;

DROP POLICY IF EXISTS "Only admins can insert roles" ON public.roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON public.roles;

-- Function helper untuk check apakah user adalah admin
-- Menggunakan SECURITY DEFINER untuk bypass RLS dan menghindari infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_admin_result BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_id_param
      AND r.name = 'admin'
  ) INTO is_admin_result;
  
  RETURN COALESCE(is_admin_result, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Policy: Users can view their own roles (tetap sama)
-- Policy ini sudah ada, tidak perlu diubah

-- Policy: Admins can view all user roles (menggunakan function helper)
CREATE POLICY "Admins can view all user roles"
  ON public.user_roles
  FOR SELECT
  USING (
    auth.uid() = user_id OR public.is_admin(auth.uid())
  );

-- Policy: Only admins can insert user roles
CREATE POLICY "Only admins can insert user roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- Policy: Only admins can update user roles
CREATE POLICY "Only admins can update user roles"
  ON public.user_roles
  FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Policy: Only admins can delete user roles
CREATE POLICY "Only admins can delete user roles"
  ON public.user_roles
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Policy: Only admins can insert roles
CREATE POLICY "Only admins can insert roles"
  ON public.roles
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- Policy: Only admins can update roles
CREATE POLICY "Only admins can update roles"
  ON public.roles
  FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Policy: Only admins can delete roles
CREATE POLICY "Only admins can delete roles"
  ON public.roles
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Add comment untuk dokumentasi
COMMENT ON FUNCTION public.is_admin(UUID) IS 'Function helper untuk check apakah user adalah admin. Menggunakan SECURITY DEFINER untuk bypass RLS dan menghindari infinite recursion.';

