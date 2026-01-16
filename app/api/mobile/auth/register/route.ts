import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

    const supabase = await createClient();

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

    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("name", "penyewa")
      .single();

    if (roleError || !roleData) {
      console.error(`Error fetching role penyewa:`, roleError);
      return NextResponse.json(
        { error: `Role penyewa not found` },
        { status: 500 }
      );
    }

    // Insert role ke user_role
    const { error: insertError } = await supabase.from("user_role").insert({
      user_id: authData.user.id,
      role_id: roleData.id,
    });

    if (insertError) {
      // Check jika error karena duplicate (sudah ada)
      if (insertError.code === "23505") {
        return NextResponse.json(
          { message: `Role penyewa already assigned` },
          { status: 200 }
        );
      }
      console.error(`Error assigning role penyewa:`, insertError);
      return NextResponse.json(
        { error: `Failed to assign role penyewa` },
        { status: 500 }
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
        email_verified: authData.user.email_confirmed_at !== null,
        created_at: authData.user.created_at,
        updated_at: authData.user.updated_at,
      },
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
