# Setup Roles dan User Roles

Dokumentasi untuk setup sistem role-based access control (RBAC).

## Cara Setup

### 1. Jalankan Migration SQL

1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Pergi ke **SQL Editor**
4. Copy seluruh isi file `migrations/002_create_roles_table.sql`
5. Paste ke SQL Editor
6. Klik **Run** untuk menjalankan migration

### 2. Setup Admin User

Setelah migration berhasil, Anda perlu menambahkan role admin ke user pertama:

```sql
-- Ganti 'YOUR_USER_ID' dengan UUID user yang ingin dijadikan admin
-- Anda bisa mendapatkan user_id dari tabel auth.users di Supabase Dashboard

-- Dapatkan role_id untuk 'admin'
-- (biasanya id = 1 jika admin adalah role pertama yang diinsert)
INSERT INTO public.user_roles (user_id, role_id)
SELECT 
  'YOUR_USER_ID'::uuid,
  id
FROM public.roles
WHERE name = 'admin';
```

### 3. Verifikasi Setup

Untuk memverifikasi bahwa setup berhasil:

```sql
-- Check apakah user memiliki role admin
SELECT 
  u.email,
  r.name as role_name
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
JOIN public.roles r ON ur.role_id = r.id
WHERE r.name = 'admin';
```

## Struktur Tabel

### Tabel `roles`

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key, auto-increment |
| `name` | TEXT | Nama role (unique, contoh: 'admin', 'user') |

### Tabel `user_roles`

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID | Foreign key ke auth.users |
| `role_id` | INTEGER | Foreign key ke roles |
| PRIMARY KEY | (user_id, role_id) | Composite primary key |

## Row Level Security (RLS)

### Roles Table
- **SELECT**: Semua user dapat melihat semua roles
- **INSERT/UPDATE/DELETE**: Hanya admin yang dapat mengelola roles

### User Roles Table
- **SELECT**: User dapat melihat role mereka sendiri, admin dapat melihat semua
- **INSERT/UPDATE/DELETE**: Hanya admin yang dapat mengelola user roles

## Default Roles

Setelah migration, akan ada 2 role default:
- `admin` - Administrator dengan akses penuh
- `user` - User biasa (untuk future use)

## Menambahkan Role Baru

Untuk menambahkan role baru (misalnya 'moderator'):

```sql
INSERT INTO public.roles (name) VALUES ('moderator');
```

## Menambahkan Role ke User

Hanya admin yang dapat menambahkan role ke user:

```sql
-- Menambahkan role 'admin' ke user
INSERT INTO public.user_roles (user_id, role_id)
SELECT 
  'USER_ID_HERE'::uuid,
  id
FROM public.roles
WHERE name = 'admin';
```

## Menghapus Role dari User

```sql
-- Menghapus role 'admin' dari user
DELETE FROM public.user_roles
WHERE user_id = 'USER_ID_HERE'::uuid
  AND role_id = (SELECT id FROM public.roles WHERE name = 'admin');
```

## Troubleshooting

### Error: "relation does not exist"
- Pastikan migration sudah dijalankan
- Check apakah tabel `roles` dan `user_roles` sudah dibuat

### Error: "permission denied"
- Pastikan RLS policies sudah dibuat dengan benar
- Pastikan user yang menjalankan query memiliki role admin

### User tidak bisa akses dashboard meskipun sudah ada role admin
- Check apakah user_id di `user_roles` sesuai dengan user yang login
- Check apakah role_id mengarah ke role 'admin' yang benar
- Pastikan query di `isAdmin()` function berjalan dengan benar

