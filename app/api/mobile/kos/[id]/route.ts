import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * API endpoint untuk mendapatkan detail kos berdasarkan ID
 * GET /api/mobile/kos/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID kos harus disertakan",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("kos")
      .select("*, gambar_kos(*, tipe_gambar(*))")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching kos detail:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Gagal mengambil detail kos",
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: "Kos tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // Tambahkan increment view count secara background (optional, non-blocking)
    // Kita biarkan berjalan asynchronous tanpa await agar response cepat
    supabase
      .rpc("increment_kos_view_count", { kos_id: id })
      .then(({ error }) => {
        if (error) {
          // Fallback manual update jika RPC tidak ada
          supabase
            .from("kos")
            .update({ view_count: (data.view_count || 0) + 1 })
            .eq("id", id)
            .then();
        }
      });

    return NextResponse.json(
      {
        success: true,
        data: data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in get kos detail:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan internal",
      },
      { status: 500 }
    );
  }
}
