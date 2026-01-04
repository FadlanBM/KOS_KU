import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const registerSchema = z
  .object({
    email: z
      .string({ message: "Email harus diisi" })
      .min(1, "Email harus diisi")
      .email("Format email tidak valid"),
    password: z
      .string({ message: "Password harus diisi" })
      .min(6, "Password minimal 6 karakter"),
    confirmPassword: z
      .string({ message: "Konfirmasi password harus diisi" })
      .min(1, "Konfirmasi password harus diisi"),
    name: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password dan konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

/**
 * API endpoint untuk registrasi user dengan JWT
 * POST /api/auth/register
 *
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "password": "password123",
 *   "confirmPassword": "password123",
 *   "name": "User Name" // optional
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
    const validationResult = registerSchema.safeParse(body);

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

    const { email, password, name } = validationResult.data;

    // Buat Supabase client untuk registrasi
    // Menggunakan createClient langsung tanpa cookies untuk mobile
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Lakukan registrasi dengan email dan password
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || undefined,
        },
      },
    });

    if (authError) {
      return NextResponse.json(
        {
          success: false,
          error: authError.message || "Gagal melakukan registrasi",
        },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Registrasi gagal",
        },
        { status: 400 }
      );
    }

    // Jika email confirmation diperlukan, Supabase mungkin tidak langsung memberikan session
    // Tapi jika email confirmation tidak diperlukan, session akan langsung tersedia
    if (!authData.session) {
      // Jika tidak ada session, berarti email confirmation diperlukan
      return NextResponse.json(
        {
          success: true,
          message:
            "Registrasi berhasil. Silakan cek email Anda untuk verifikasi.",
          data: {
            user: {
              id: authData.user.id,
              email: authData.user.email,
              name: authData.user.user_metadata?.name || null,
              phone: authData.user.phone || null,
              avatar_url: authData.user.user_metadata?.avatar_url || null,
              email_verified: false,
            },
            requiresEmailConfirmation: true,
          },
        },
        { status: 200 }
      );
    }

    // Jika session tersedia, berarti user langsung terautentikasi
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
    // Role "user" akan otomatis di-assign oleh database trigger
    const userId = authData.user.id;

    // Tunggu sebentar untuk memastikan trigger sudah selesai
    // (biasanya trigger berjalan sangat cepat, tapi kita beri sedikit delay)
    await new Promise((resolve) => setTimeout(resolve, 500));

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
        ? rolesData.map(
            (item: Record<string, unknown>) =>
              (item.roles as { name: string }).name
          )
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
        email_verified: authData.user.email_confirmed_at !== null,
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
        message: "Registrasi berhasil",
        data: responseData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in registration:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan saat melakukan registrasi",
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
      error: "Method tidak didukung. Gunakan POST untuk registrasi.",
    },
    { status: 405 }
  );
}
