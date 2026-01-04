// pages/api/kos/index.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Endpoint untuk mengambil semua data kos
export async function GET(request: NextRequest) {
  try {
    // Ambil token dari header Authorization
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Token tidak ditemukan",
        },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // Validasi token dengan Supabase
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

    // Query data kos
    const { data: kosList, error: kosError } = await supabase
      .from("kos")
      .select("*")
      .order("created_at", { ascending: false });

    if (kosError) {
      return NextResponse.json(
        {
          success: false,
          error: "Gagal mengambil data kos",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: kosList,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan server internal",
      },
      { status: 500 }
    );
  }
}
