import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * API endpoint untuk like/unlike sebuah kos dari aplikasi mobile
 * POST /api/mobile/kos/like
 *
 * Headers:
 * Authorization: Bearer <access_token>
 *
 * Body JSON:
 * {
 *   "kos_id": "uuid-kos"
 * }
 *
 * Perilaku:
 * - Jika user belum like kos tersebut -> insert ke user_likes (liked: true)
 * - Jika user sudah like kos tersebut -> hapus dari user_likes (liked: false)
 */
export async function POST(request: NextRequest) {
  try {
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

    const kosId: string | undefined =
      request.nextUrl.searchParams.get("kos_id") || undefined;

    if (!kosId) {
      return NextResponse.json(
        {
          success: false,
          error: "kos_id harus disertakan",
        },
        { status: 400 }
      );
    }

    const { data: existingLike, error: checkError } = await supabase
      .from("user_likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("kos_id", kosId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing like:", checkError);
      return NextResponse.json(
        {
          success: false,
          error: "Gagal memeriksa status like",
        },
        { status: 500 }
      );
    }

    if (existingLike) {
      const { error: deleteError } = await supabase
        .from("user_likes")
        .delete()
        .eq("id", existingLike.id);

      if (deleteError) {
        console.error("Error removing like:", deleteError);
        return NextResponse.json(
          {
            success: false,
            error: deleteError.message || "Gagal menghapus like",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          liked: false,
        },
        { status: 200 }
      );
    }

    const { error: insertError } = await supabase.from("user_likes").insert({
      user_id: user.id,
      kos_id: kosId,
    });

    if (insertError) {
      console.error("Error adding like:", insertError);
      return NextResponse.json(
        {
          success: false,
          error: insertError.message || "Gagal menambahkan like",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        liked: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in mobile kos like API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan internal",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
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

    const kosId: string | undefined =
      request.nextUrl.searchParams.get("kos_id") || undefined;

    if (!kosId) {
      return NextResponse.json(
        {
          success: false,
          error: "kos_id harus disertakan",
        },
        { status: 400 }
      );
    }

    const { data: existingLike, error: checkError } = await supabase
      .from("user_likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("kos_id", kosId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing like:", checkError);
      return NextResponse.json(
        {
          success: false,
          error: "Gagal memeriksa status like",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        liked: !!existingLike,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in mobile kos like status API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan internal",
      },
      { status: 500 }
    );
  }
}
