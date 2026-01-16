-- Create penyedia_npwp table
CREATE TABLE IF NOT EXISTS public.penyedia_npwp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  npwp_number VARCHAR(20) NOT NULL UNIQUE,
  npwp_name VARCHAR(255) NOT NULL,
  npwp_address TEXT,
  npwp_photo_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  CONSTRAINT fk_penyedia_npwp_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.penyedia_npwp ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own NPWP data" ON public.penyedia_npwp
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own NPWP data" ON public.penyedia_npwp
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own NPWP data" ON public.penyedia_npwp
  FOR UPDATE USING (auth.uid() = user_id);
