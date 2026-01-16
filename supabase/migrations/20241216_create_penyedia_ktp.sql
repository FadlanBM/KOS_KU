-- Create penyedia_ktp table
CREATE TABLE IF NOT EXISTS public.penyedia_ktp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  ktp_number VARCHAR(16) NOT NULL UNIQUE,
  ktp_name VARCHAR(255) NOT NULL,
  ktp_address TEXT NOT NULL,
  ktp_province VARCHAR(100),
  ktp_city VARCHAR(100),
  ktp_district VARCHAR(100),
  ktp_photo_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  CONSTRAINT fk_penyedia_ktp_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.penyedia_ktp ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own KTP data" ON public.penyedia_ktp
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own KTP data" ON public.penyedia_ktp
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own KTP data" ON public.penyedia_ktp
  FOR UPDATE USING (auth.uid() = user_id);
