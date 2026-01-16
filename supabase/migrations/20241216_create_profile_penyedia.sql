-- Create profile_penyedia table
CREATE TABLE IF NOT EXISTS public.profile_penyedia (
  user_id UUID PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(255) NOT NULL,
  whatsapp_number VARCHAR(255),
  email VARCHAR(255),
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  date_of_birth DATE NOT NULL,
  address TEXT NOT NULL,
  emergency_contact VARCHAR(255) NOT NULL,
  emergency_contact_relation VARCHAR(100),
  business_name VARCHAR(255),
  business_address TEXT,
  total_properties INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_date TIMESTAMPTZ,
  profile_photo_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  CONSTRAINT fk_profile_penyedia_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.profile_penyedia ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own penyedia profile" ON public.profile_penyedia
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own penyedia profile" ON public.profile_penyedia
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own penyedia profile" ON public.profile_penyedia
  FOR UPDATE USING (auth.uid() = user_id);
