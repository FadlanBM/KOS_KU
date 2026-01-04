import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * API endpoint untuk mendapatkan data user berdasarkan JWT token
 * GET /api/auth/me
 *
 * Headers:
 * Authorization: Bearer <access_token>
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "user": {
 *       "id": "user-id",
 *       "email": "user@example.com",
 *       "name": "User Name",
 *       "phone": "+628123456789",
 *       "avatar_url": "https://..."
 *     },
 *     "roles": ["user"],
 *     "isAdmin": false,
 *     "isUser": true
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Ambil token dari header Authorization
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Token tidak ditemukan. Sertakan header Authorization: Bearer <token>",
        },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // 2. Validasi token dengan Supabase dan buat client yang terautentikasi
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // 3. Verifikasi token dan ambil data user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Token tidak valid atau kadaluarsa",
        },
        { status: 401 }
      );
    }

    // 4. Ambil informasi role user
    const userId = user.id;

    // Query roles
    const { data: rolesData, error: rolesError } = await supabase
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
    const { data: adminData } = await supabase
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
    const { data: userData } = await supabase
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

    // 5. Siapkan response data
    const responseData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || null,
        phone: user.phone || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        email_verified: user.email_confirmed_at !== null,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
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
    console.error("Error in get user data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan saat mengambil data user",
      },
      { status: 500 }
    );
  }
}

/**
 * Handle method tidak didukung
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "Method tidak didukung. Gunakan GET untuk mendapatkan data user.",
    },
    { status: 405 }
  );
}

