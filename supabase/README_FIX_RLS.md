# Fix Infinite Recursion pada RLS Policy

## Masalah

Error yang terjadi:
```
Error checking user role: {
  code: '42P17',
  message: 'infinite recursion detected in policy for relation "user_roles"'
}
```

## Penyebab

RLS policy pada tabel `user_roles` yang mengecek apakah user adalah admin menggunakan query ke tabel `user_roles` lagi, sehingga terjadi infinite recursion.

## Solusi

Gunakan migration `003_fix_rls_infinite_recursion.sql` yang membuat function helper `is_admin()` dengan `SECURITY DEFINER` untuk bypass RLS dan menghindari infinite recursion.

## Cara Menggunakan

### 1. Jalankan Migration SQL

1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Pergi ke **SQL Editor**
4. Copy seluruh isi file `migrations/003_fix_rls_infinite_recursion.sql`
5. Paste ke SQL Editor
6. Klik **Run** untuk menjalankan migration

### 2. Verifikasi

Setelah migration berhasil, coba akses aplikasi lagi. Error infinite recursion seharusnya sudah teratasi.

## Penjelasan Teknis

### Function Helper `is_admin()`

Function ini menggunakan `SECURITY DEFINER` yang berarti:
- Function berjalan dengan privilege dari user yang membuat function (biasanya postgres)
- Bypass RLS policies saat mengecek role
- Tidak terjadi infinite recursion karena tidak melalui RLS policy lagi

### RLS Policies yang Diperbaiki

Semua policies yang mengecek admin sekarang menggunakan function `is_admin()`:
- `Admins can view all user roles`
- `Only admins can insert user roles`
- `Only admins can update user roles`
- `Only admins can delete user roles`
- `Only admins can insert roles`
- `Only admins can update roles`
- `Only admins can delete roles`

## Catatan Keamanan

Function `is_admin()` menggunakan `SECURITY DEFINER`, yang berarti:
- Function berjalan dengan privilege tinggi
- Hanya digunakan untuk check role, tidak untuk modify data
- Function dibuat dengan `STABLE` untuk optimasi query
- Tetap aman karena hanya mengecek role, tidak mengubah data

## Troubleshooting

### Error: "function is_admin does not exist"
- Pastikan migration sudah dijalankan
- Check apakah function sudah dibuat di database

### Error masih terjadi setelah migration
- Pastikan semua policies lama sudah di-drop
- Check apakah function `is_admin()` sudah dibuat dengan benar
- Coba refresh browser atau clear cache

### User tidak bisa akses setelah migration
- Pastikan user masih memiliki role yang benar
- Check apakah RLS policies sudah di-update dengan benar

