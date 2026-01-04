# Setup Supabase

Panduan lengkap untuk setup Supabase di project ini.

## 1. Install Dependencies

Dependencies sudah terinstall:
- `@supabase/supabase-js` - Supabase JavaScript client
- `@supabase/ssr` - Supabase untuk Server-Side Rendering (Next.js)

## 2. Setup Environment Variables

Buat file `.env.local` di root project dengan konten berikut:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Cara Mendapatkan Credentials:

1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Login atau buat akun baru
3. Buat project baru atau pilih project yang sudah ada
4. Pergi ke **Settings** > **API**
5. Copy nilai berikut:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3. Struktur File Supabase

```
lib/supabase/
├── client.ts       # Client untuk client-side components
├── server.ts       # Client untuk server-side components
├── middleware.ts   # Helper untuk Next.js middleware
├── auth.ts         # Helper functions untuk authentication
├── types.ts        # Database types
├── examples.ts     # Contoh penggunaan
└── README.md       # Dokumentasi lengkap
```

## 4. Middleware

File `middleware.ts` di root sudah dikonfigurasi untuk:
- Refresh session user secara otomatis
- Mengelola cookies untuk authentication

## 5. Penggunaan Dasar

### Client-Side Component

```typescript
"use client";

import { createClient } from "@/lib/supabase/client";

export default function MyComponent() {
  const supabase = createClient();
  
  // Query data
  const { data, error } = await supabase
    .from("table_name")
    .select("*");
}
```

### Server Component

```typescript
import { createServerClient } from "@/lib/supabase/server";

export default async function MyServerComponent() {
  const supabase = await createServerClient();
  
  // Query data
  const { data, error } = await supabase
    .from("table_name")
    .select("*");
}
```

### Authentication

```typescript
import { signInWithEmail, getUser, signOut } from "@/lib/supabase";

// Sign in
await signInWithEmail("email@example.com", "password");

// Get current user
const user = await getUser();

// Sign out
await signOut();
```

## 6. Generate Database Types

Untuk mendapatkan TypeScript types dari database Supabase:

```bash
# Install Supabase CLI (jika belum)
npm install -g supabase

# Generate types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
```

Atau jika menggunakan Supabase local:

```bash
npx supabase gen types typescript --local > lib/supabase/types.ts
```

## 7. Next Steps

1. Setup database schema di Supabase Dashboard
2. Generate types dengan Supabase CLI
3. Buat komponen authentication (login, register, dll)
4. Implementasi protected routes jika diperlukan
5. Lihat `lib/supabase/examples.ts` untuk contoh penggunaan lebih lanjut

## Dokumentasi Lebih Lanjut

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Next.js Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- Lihat `lib/supabase/README.md` untuk dokumentasi lengkap
