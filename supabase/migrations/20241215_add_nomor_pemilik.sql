-- Add nomor_pemilik column to kos table
ALTER TABLE kos
ADD COLUMN nomor_pemilik VARCHAR(20);

COMMENT ON COLUMN kos.nomor_pemilik IS 'Nomor telepon pemilik kos untuk dihubungi';
