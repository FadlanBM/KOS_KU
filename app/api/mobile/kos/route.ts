import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * API endpoint untuk mendapatkan daftar kos
 * GET /api/mobile/kos
 *
 * Query Parameters:
 * - search: Pencarian berdasarkan nama atau alamat
 * - min_price: Filter harga minimum
 * - max_price: Filter harga maksimum
 * - page: Halaman saat ini (default: 1)
 * - limit: Batas jumlah data (default: 10)
 * - offset: Offset data (opsional, akan menimpa page jika diisi)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const minPrice = searchParams.get("min_price");
    const maxPrice = searchParams.get("max_price");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Hitung offset berdasarkan page jika offset tidak disediakan secara eksplisit
    let offset = parseInt(searchParams.get("offset") || "0");
    if (!searchParams.has("offset") && page > 0) {
      offset = (page - 1) * limit;
    }

    // Validasi token autentikasi
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Missing token",
        },
        { status: 401 }
      );
    }

    // Inisialisasi Supabase client dengan token
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

    // Verifikasi user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Invalid token",
        },
        { status: 401 }
      );
    }

    // Query dasar untuk mengambil data kos beserta gambar
    // Kita join dengan gambar_kos dan tipe_gambar
    // Gunakan { count: 'exact' } untuk mendapatkan total data untuk pagination
    let query = supabase
      .from("kos")
      .select(
        `
        *,
        gambar_kos (
          id,
          url_gambar,
          tipe_gambar (
            id,
            name
          )
        )
      `,
        { count: "exact" }
      )
      .eq("property_status", "active") // Hanya tampilkan kos aktif
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Terapkan filter jika ada parameter
    if (search) {
      query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`);
    }

    if (minPrice) {
      query = query.gte("monthly_price", minPrice);
    }

    if (maxPrice) {
      query = query.lte("monthly_price", maxPrice);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching kos:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Gagal mengambil data kos",
        },
        { status: 500 }
      );
    }

    const totalRecords = count || 0;
    const totalPages = Math.ceil(totalRecords / limit);
    const currentPage = Math.floor(offset / limit) + 1;
    const nextPage = currentPage < totalPages ? currentPage + 1 : null;
    const prevPage = currentPage > 1 ? currentPage - 1 : null;

    return NextResponse.json(
      {
        success: true,
        data: data,
        pagination: {
          total_records: totalRecords,
          total_pages: totalPages,
          current_page: currentPage,
          next_page: nextPage,
          prev_page: prevPage,
          limit: limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in get kos:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan internal",
      },
      { status: 500 }
    );
  }
}
