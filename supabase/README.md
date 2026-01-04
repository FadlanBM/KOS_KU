# Supabase Database Migrations

Dokumentasi untuk database migrations Supabase.

## Cara Menggunakan

### 1. Menggunakan Supabase Dashboard (Recommended untuk pemula)

1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Pergi ke **SQL Editor**
4. Copy seluruh isi file `migrations/001_create_kos_table.sql`
5. Paste ke SQL Editor
6. Klik **Run** untuk menjalankan migration

### 2. Menggunakan Supabase CLI (Recommended untuk production)

```bash
# Install Supabase CLI (jika belum)
npm install -g supabase

# Login ke Supabase
supabase login

# Link ke project Anda
supabase link --project-ref YOUR_PROJECT_REF

# Jalankan migration
supabase db push
```

## Struktur Tabel

### Tabel `kos`

Tabel untuk menyimpan data kos/boarding house.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `user_id` | UUID | Foreign key ke auth.users |
| `name` | TEXT | Nama kos |
| `address` | TEXT | Alamat lengkap |
| `city` | TEXT | Kota/kabupaten |
| `price` | INTEGER | Harga per bulan (Rupiah) |
| `room_type` | TEXT | Tipe kamar |
| `facilities` | TEXT | Fasilitas (nullable) |
| `description` | TEXT | Deskripsi (nullable) |
| `available_rooms` | INTEGER | Jumlah kamar tersedia |
| `total_rooms` | INTEGER | Total jumlah kamar |
| `created_at` | TIMESTAMP | Waktu dibuat |
| `updated_at` | TIMESTAMP | Waktu diupdate |

## Row Level Security (RLS)

Tabel menggunakan Row Level Security dengan policies berikut:

- **SELECT**: Semua user dapat melihat semua kos (bisa diubah jika ingin hanya milik sendiri)
- **INSERT**: User hanya bisa insert kos milik mereka sendiri
- **UPDATE**: User hanya bisa update kos milik mereka sendiri
- **DELETE**: User hanya bisa delete kos milik mereka sendiri

## Constraints

- `price >= 0`: Harga tidak boleh negatif
- `available_rooms >= 0`: Kamar tersedia tidak boleh negatif
- `total_rooms > 0`: Total kamar harus lebih dari 0
- `available_rooms <= total_rooms`: Kamar tersedia tidak boleh lebih dari total kamar

## Indexes

Indexes dibuat untuk optimasi query:

- `idx_kos_user_id`: Untuk query berdasarkan user_id
- `idx_kos_city`: Untuk query berdasarkan kota
- `idx_kos_created_at`: Untuk sorting berdasarkan tanggal dibuat

## Auto-update Timestamp

Trigger `set_updated_at` otomatis mengupdate kolom `updated_at` setiap kali data diupdate.

## Contoh Query

### Insert data kos

```sql
INSERT INTO public.kos (
  user_id,
  name,
  address,
  city,
  price,
  room_type,
  facilities,
  description,
  available_rooms,
  total_rooms
) VALUES (
  'user-uuid-here',
  'Kos Nyaman Sejahtera',
  'Jl. Merdeka No. 123',
  'Jakarta Selatan',
  500000,
  'Kamar Mandi Dalam',
  'WiFi, AC, Kasur, Lemari',
  'Kos yang nyaman dan strategis',
  3,
  10
);
```

### Query semua kos milik user

```sql
SELECT * FROM public.kos
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
```

### Update data kos

```sql
UPDATE public.kos
SET 
  name = 'Kos Baru',
  price = 600000,
  available_rooms = 5
WHERE id = 'kos-uuid-here'
  AND user_id = auth.uid();
```

### Delete kos

```sql
DELETE FROM public.kos
WHERE id = 'kos-uuid-here'
  AND user_id = auth.uid();
```

