-- ============================================
-- SQL untuk memperbaiki error 'Failed to assign admin role'
-- Menambahkan policy agar user dapat mengassign role ke dirinya sendiri
-- ============================================

-- Policy: Mengizinkan user untuk memasukkan data ke user_roles jika user_id sesuai dengan UID mereka
-- Ini diperlukan karena saat registrasi, user belum memiliki role admin namun perlu mengassign role admin ke dirinya sendiri
CREATE POLICY "Users can assign their own role"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Opsional: Jika Anda ingin lebih ketat, Anda bisa membatasi agar user hanya bisa mengassign role ke dirinya sendiri jika belum punya role sama sekali
-- Tapi policy di atas sudah cukup untuk mengatasi error tersebut.

COMMENT ON POLICY "Users can assign their own role" ON public.user_roles IS 'Mengizinkan user untuk mengassign role (seperti admin) ke dirinya sendiri saat proses registrasi.';
