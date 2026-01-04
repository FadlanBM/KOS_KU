import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * API endpoint untuk refresh JWT token
 * POST /api/auth/refresh-token
 *
 * Request body:
 * {
 *   "refresh_token": "refresh-token-string"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "access_token": "new-jwt-access-token",
 *     "refresh_token": "new-refresh-token",
 *     "expires_in": 3600,
 *     "expires_at": 1234567890
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { refresh_token } = body;

    // Validasi input
    if (!refresh_token) {
      return NextResponse.json(
        {
          success: false,
          error: "Refresh token harus diisi",
        },
        { status: 400 }
      );
    }

    // Buat Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Refresh session menggunakan refresh token
    const { data: authData, error: authError } =
      await supabase.auth.refreshSession({
        refresh_token,
      });

    if (authError) {
      return NextResponse.json(
        {
          success: false,
          error:
            authError.message || "Refresh token tidak valid atau sudah expired",
        },
        { status: 401 }
      );
    }

    if (!authData.session) {
      return NextResponse.json(
        {
          success: false,
          error: "Gagal memperbarui session",
        },
        { status: 401 }
      );
    }

    // Siapkan response data
    const responseData = {
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      expires_in: authData.session.expires_in || 3600,
      expires_at: authData.session.expires_at,
      token_type: authData.session.token_type,
    };

    return NextResponse.json(
      {
        success: true,
        data: responseData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in refresh token:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan saat memperbarui token",
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
      error: "Method tidak didukung. Gunakan POST untuk refresh token.",
    },
    { status: 405 }
  );
}
