import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const loginSchema = z.object({
  email: z
    .string({ error: "Email harus diisi" })
    .min(1, "Email harus diisi")
    .email("Format email tidak valid"),
  password: z
    .string({ error: "Password harus diisi" })
    .min(1, "Password harus diisi"),
});

/**
 * API endpoint untuk mobile login dengan JWT
 * POST /api/auth/mobile-login
 *
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "user": {
 *       "id": "user-id",
 *       "email": "user@example.com",
 *       "name": "User Name"
 *     },
 *     "access_token": "jwt-access-token",
 *     "refresh_token": "jwt-refresh-token",
 *     "expires_in": 3600,
 *     "roles": ["user"],
 *     "isAdmin": false,
 *     "isUser": true
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validasi input dengan Zod
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      // Ambil error pertama untuk ditampilkan
      const errorMessage =
        validationResult.error.issues[0]?.message || "Input tidak valid";
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Buat Supabase client untuk autentikasi mobile
    // Menggunakan createClient langsung tanpa cookies untuk mobile
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Lakukan autentikasi dengan email dan password
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      return NextResponse.json(
        {
          success: false,
          error: authError.message || "Email atau password salah",
        },
        { status: 401 }
      );
    }

    if (!authData.session || !authData.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Autentikasi gagal",
        },
        { status: 401 }
      );
    }

    // Buat Supabase client yang sudah terautentikasi untuk query roles
    const authenticatedSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${authData.session.access_token}`,
          },
        },
      }
    );

    // Ambil informasi role user menggunakan authenticated client
    const userId = authData.user.id;

    // Query roles
    const { data: rolesData, error: rolesError } = await authenticatedSupabase
      .from("user_roles")
      .select(
        `
        roles(name)
      `
      )
      .eq("user_id", userId);

    const roles =
      rolesData && !rolesError
        ? rolesData.map((item: any) => item.roles.name)
        : [];

    // Check admin role
    const { data: adminData } = await authenticatedSupabase
      .from("user_roles")
      .select(
        `
        role_id,
        roles!inner(name)
      `
      )
      .eq("user_id", userId)
      .eq("roles.name", "admin")
      .maybeSingle();

    const userIsAdmin = !!adminData;

    // Check user role
    const { data: userData } = await authenticatedSupabase
      .from("user_roles")
      .select(
        `
        role_id,
        roles!inner(name)
      `
      )
      .eq("user_id", userId)
      .eq("roles.name", "user")
      .maybeSingle();

    const userIsUser = !!userData;

    // Siapkan response data
    const responseData = {
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.name || null,
        phone: authData.user.phone || null,
        avatar_url: authData.user.user_metadata?.avatar_url || null,
      },
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      expires_in: authData.session.expires_in || 3600,
      expires_at: authData.session.expires_at,
      token_type: authData.session.token_type,
      roles,
      isAdmin: userIsAdmin,
      isUser: userIsUser,
    };

    return NextResponse.json(
      {
        success: true,
        data: responseData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in mobile login:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan saat melakukan login",
      },
      { status: 500 }
    );
  }
}

/**
 * Handle method tidak didukung
 */
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: "Method tidak didukung. Gunakan POST untuk login.",
    },
    { status: 405 }
  );
}
