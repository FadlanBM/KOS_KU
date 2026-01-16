import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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
    const supabase = await createClient();

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

    const userId = authData.user.id;

    // VALIDASI ROLE: Hanya 'penyewa' yang boleh login melalui mobile
    // Kita gunakan client yang sudah terautentikasi untuk pengecekan role jika RLS aktif
    const { data: roleData, error: roleError } = await supabase
      .from("user_role")
      .select(
        `
        role_id,
        roles!inner(name)
      `
      )
      .eq("user_id", userId)
      .eq("roles.name", "penyewa")
      .maybeSingle();

    if (roleError || !roleData) {
      // Jika bukan role 'penyewa', kita sign out session yang baru dibuat
      await supabase.auth.signOut();

      return NextResponse.json(
        {
          success: false,
          error:
            "Akses ditolak: Hanya akun Penyewa yang dapat login melalui aplikasi ini.",
        },
        { status: 403 }
      );
    }

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
      roles: ["penyewa"],
      isPenyewa: true,
      isAdmin: false,
      isPemilik: false,
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
