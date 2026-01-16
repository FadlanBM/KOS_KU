-- Create penyedia_bank table
CREATE TABLE IF NOT EXISTS public.penyedia_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    bank_code VARCHAR(10),
    account_number VARCHAR(50) NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    branch_name VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    CONSTRAINT fk_penyedia_bank_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT unique_bank_account UNIQUE(user_id, bank_name, account_number)
);

-- Enable Row Level Security
ALTER TABLE public.penyedia_bank ENABLE ROW LEVEL SECURITY;

-- Policies for penyedia_bank
CREATE POLICY "Users can view their own bank accounts"
ON public.penyedia_bank
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bank accounts"
ON public.penyedia_bank
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank accounts"
ON public.penyedia_bank
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bank accounts"
ON public.penyedia_bank
FOR DELETE
USING (auth.uid() = user_id);

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_penyedia_bank_updated_at
    BEFORE UPDATE ON public.penyedia_bank
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
