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
 *       "avatar_url": "https://...",
 *       "email_verified": true
 *     },
 *     "roles": ["penyewa"],
 *     "isAdmin": false,
 *     "isPenyewa": true
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
          error:
            "Unauthorized: Token tidak ditemukan. Sertakan header Authorization: Bearer <token>",
        },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // 2. Buat Supabase client manual dengan token dari header
    // Ini diperlukan agar Supabase mengenali user berdasarkan JWT yang dikirim mobile
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
    } = await supabase.auth.getUser(token);

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

    // Query semua roles user dalam satu request
    const { data: rolesData } = await supabase
      .from("user_role")
      .select(
        `
        roles!inner(name)
      `
      )
      .eq("user_id", userId);

    const roles = rolesData
      ? rolesData.map((item: any) => item.roles.name)
      : [];

    const userIsAdmin = roles.includes("admin");
    const userIsPemilik = roles.includes("pemilik");
    const userIsPenyewa = roles.includes("penyewa") || roles.includes("user");

    // 5. Response
    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || null,
            phone: user.phone || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            email_verified: user.email_confirmed_at !== null,
          },
          roles,
          isAdmin: userIsAdmin,
          isPemilik: userIsPemilik,
          isPenyewa: userIsPenyewa,
        },
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
