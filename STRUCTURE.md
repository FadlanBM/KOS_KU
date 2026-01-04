# Struktur Folder Project

Dokumentasi struktur folder project web-kosku.

## 📁 Struktur Folder

```
web-kosku/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── (routes)/         # Route groups untuk halaman
│   ├── (dashboard)/      # Dashboard route group (protected)
│   │   ├── layout.tsx    # Dashboard layout dengan sidebar & header
│   │   ├── dashboard/    # Dashboard utama
│   │   ├── profile/      # Halaman profile
│   │   ├── settings/     # Halaman pengaturan
│   │   ├── kos/           # Halaman data kos
│   │   └── transactions/  # Halaman transaksi
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
│
├── components/            # Komponen React
│   ├── ui/               # Komponen UI (shadcn/ui)
│   ├── features/         # Komponen berdasarkan fitur
│   │   └── dashboard/   # Komponen khusus dashboard
│   ├── layout/           # Komponen layout (Header, Footer, Sidebar)
│   │   └── dashboard/    # Layout components untuk dashboard
│   │       ├── sidebar.tsx  # Sidebar navigation
│   │       └── header.tsx   # Header dengan user info
│   └── common/           # Komponen umum/reusable
│
├── lib/                   # Utilities dan helpers
│   ├── utils/            # Utility functions
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript types
│   ├── constants/        # Constants dan konfigurasi
│   ├── api/              # API clients dan functions
│   ├── supabase/         # Supabase configuration dan helpers
│   │   ├── client.ts     # Client-side Supabase client
│   │   ├── server.ts     # Server-side Supabase client
│   │   ├── middleware.ts # Middleware helper
│   │   ├── auth.ts       # Authentication helpers
│   │   ├── types.ts      # Database types
│   │   └── examples.ts   # Contoh penggunaan
│   └── utils.ts          # Utility utama (cn function)
│
├── types/                 # Global TypeScript types
│
├── middleware.ts          # Next.js middleware (Supabase session management)
│
├── public/                # Static assets
│   ├── images/           # Gambar
│   ├── icons/            # Ikon
│   └── fonts/            # Font files
│
└── [config files]         # File konfigurasi (tsconfig, next.config, dll)
```

## 📝 Penjelasan Folder

### `app/`

Folder untuk Next.js App Router:

- `api/` - API routes (Next.js API routes)
- `(routes)/` - Route groups untuk mengorganisir halaman
- `(dashboard)/` - Route group untuk halaman dashboard (protected)
  - `layout.tsx` - Layout khusus dashboard dengan sidebar dan header
  - `dashboard/` - Halaman dashboard utama
  - `profile/` - Halaman profil user
  - `settings/` - Halaman pengaturan
  - `kos/` - Halaman untuk mengelola data kos
  - `transactions/` - Halaman riwayat transaksi
- File `layout.tsx` dan `page.tsx` untuk routing

### `components/`

Komponen React yang dapat digunakan kembali:

- `ui/` - Komponen UI dari shadcn/ui (Button, Input, dll)
- `features/` - Komponen yang spesifik untuk fitur tertentu
  - `dashboard/` - Komponen khusus untuk fitur dashboard
- `layout/` - Komponen layout seperti Header, Footer, Sidebar
  - `dashboard/` - Layout components untuk dashboard
    - `sidebar.tsx` - Sidebar navigation dengan menu
    - `header.tsx` - Header dengan user info dan logout
- `common/` - Komponen umum yang digunakan di berbagai tempat

### `lib/`

Utilities, helpers, dan kode yang dapat digunakan kembali:

- `utils/` - Utility functions tambahan
- `hooks/` - Custom React hooks
- `types/` - TypeScript types dan interfaces
- `constants/` - Constants, konfigurasi, dan nilai tetap
- `api/` - API clients, fetch functions, dan API-related code
- `supabase/` - Konfigurasi dan helper functions untuk Supabase
  - `client.ts` - Client untuk client-side components
  - `server.ts` - Client untuk server-side components dan API routes
  - `middleware.ts` - Helper untuk Next.js middleware
  - `auth.ts` - Helper functions untuk authentication
  - `types.ts` - Database types (generate dengan Supabase CLI)
  - `examples.ts` - Contoh penggunaan Supabase

### `types/`

Global TypeScript types yang digunakan di seluruh aplikasi.

### `middleware.ts`

Next.js middleware untuk mengelola session Supabase secara otomatis. Middleware ini akan refresh session user di setiap request.

### `public/`

Static assets yang dapat diakses langsung:

- `images/` - File gambar
- `icons/` - File ikon
- `fonts/` - File font

## 🎯 Best Practices

1. **Komponen**: Pisahkan komponen berdasarkan kegunaannya

   - UI components → `components/ui/`
   - Feature-specific → `components/features/`
   - Layout components → `components/layout/`

2. **Utilities**: Simpan fungsi helper di `lib/utils/` atau `lib/`

3. **Types**: Gunakan `lib/types/` untuk types yang spesifik, `types/` untuk global types

4. **API**: Semua fungsi API dan clients di `lib/api/`

5. **Constants**: Simpan semua konstanta di `lib/constants/`

6. **Supabase**: 
   - Gunakan `lib/supabase/client` untuk client-side components
   - Gunakan `lib/supabase/server` untuk server-side components dan API routes
   - Lihat `lib/supabase/README.md` untuk dokumentasi lengkap

7. **Dashboard**:
   - Semua halaman dashboard ada di `app/(dashboard)/`
   - Layout dashboard otomatis melindungi semua route di dalamnya
   - Sidebar dan header tersedia di semua halaman dashboard
   - Gunakan `components/features/dashboard/` untuk komponen khusus dashboard
