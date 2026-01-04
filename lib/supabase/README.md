# Supabase Setup

Dokumentasi setup dan penggunaan Supabase di project ini.

## Setup

1. **Install dependencies** (sudah dilakukan):

   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   ```

2. **Buat file `.env.local`** di root project:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Dapatkan credentials dari Supabase Dashboard**:
   - Buka https://app.supabase.com
   - Pilih project Anda
   - Pergi ke Settings > API
   - Copy `Project URL` dan `anon public` key

## Struktur File

- `client.ts` - Client untuk client-side components (browser)
- `server.ts` - Client untuk server-side components dan API routes
- `middleware.ts` - Helper untuk Next.js middleware
- `auth.ts` - Helper functions untuk authentication

## Penggunaan

### Client-Side (Components)

```typescript
"use client";

import { createClient } from "@/lib/supabase/client";
import { signInWithEmail, getUser } from "@/lib/supabase";

// Menggunakan client langsung
const supabase = createClient();
const { data } = await supabase.from("table_name").select("*");

// Menggunakan auth helpers
const user = await getUser();
await signInWithEmail("email@example.com", "password");
```

### Server-Side (Server Components & API Routes)

**PENTING**: Import langsung dari `@/lib/supabase/server`, jangan dari `@/lib/supabase`!

```typescript
// Di Server Component (tanpa "use client")
import { createClient } from "@/lib/supabase/server";

export default async function MyServerComponent() {
  const supabase = await createClient();
  const { data } = await supabase.from("table_name").select("*");
  return <div>{/* ... */}</div>;
}

// Di API Route
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.from("table_name").select("*");
  return Response.json(data);
}
```

### Authentication

```typescript
import {
  signInWithEmail,
  signUpWithEmail,
  signOut,
  getUser,
  getSession,
} from "@/lib/supabase";

// Sign in
const { data, error } = await signInWithEmail("email@example.com", "password");

// Sign up
const { data, error } = await signUpWithEmail("email@example.com", "password");

// Sign out
await signOut();

// Get current user
const user = await getUser();

// Get session
const session = await getSession();
```

## Middleware

Middleware sudah dikonfigurasi untuk:

- Refresh user session secara otomatis
- Redirect ke `/login` jika user belum login (kecuali di route `/login` dan `/auth`)

Anda bisa memodifikasi logic di `middleware.ts` sesuai kebutuhan.
