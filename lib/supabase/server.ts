/**
 * Server-side Supabase client
 *
 * IMPORTANT: File ini HANYA untuk digunakan di:
 * - Server Components (tanpa "use client")
 * - API Routes (app/api/*)
 * - Server Actions
 *
 * JANGAN import file ini di Client Components!
 * Gunakan "@/lib/supabase/client" untuk client-side.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
