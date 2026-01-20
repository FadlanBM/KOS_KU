import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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
    const likedOnly = searchParams.get("liked") === "true";

    let offset = parseInt(searchParams.get("offset") || "0");
    if (!searchParams.has("offset") && page > 0) {
      offset = (page - 1) * limit;
    }

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

    const supabase = await createClient();

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

    let likedKosIds: string[] = [];

    if (likedOnly) {
      const { data: userLikes, error: likesError } = await supabase
        .from("user_likes")
        .select("kos_id")
        .eq("user_id", user.id);

      if (likesError) {
        console.error("Error fetching user likes:", likesError);
        return NextResponse.json(
          {
            success: false,
            error: "Gagal mengambil data like pengguna",
          },
          { status: 500 }
        );
      }

      likedKosIds = userLikes?.map((like) => like.kos_id) ?? [];

      if (likedKosIds.length === 0) {
        const totalRecords = 0;
        const totalPages = 0;
        const currentPage = Math.floor(offset / limit) + 1;
        const nextPage = null;
        const prevPage = currentPage > 1 ? currentPage - 1 : null;

        return NextResponse.json(
          {
            success: true,
            data: [],
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
      }
    }

    let countQuery = supabase
      .from("kos")
      .select("*", { count: "exact", head: true })
      .eq("property_status", "active");

    if (search) {
      countQuery = countQuery.or(
        `name.ilike.%${search}%,address.ilike.%${search}%`
      );
    }

    if (minPrice) {
      countQuery = countQuery.gte("monthly_price", minPrice);
    }

    if (maxPrice) {
      countQuery = countQuery.lte("monthly_price", maxPrice);
    }

    if (likedOnly && likedKosIds.length > 0) {
      countQuery = countQuery.in("id", likedKosIds);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error("Error counting kos:", countError);
      return NextResponse.json(
        {
          success: false,
          error: "Gagal menghitung data kos",
        },
        { status: 500 }
      );
    }

    const totalRecords = count || 0;
    const totalPages = Math.ceil(totalRecords / limit);
    const currentPage = Math.floor(offset / limit) + 1;
    const nextPage = currentPage < totalPages ? currentPage + 1 : null;
    const prevPage = currentPage > 1 ? currentPage - 1 : null;

    if (offset >= totalRecords) {
      return NextResponse.json(
        {
          success: true,
          data: [],
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
    }

    let dataQuery = supabase
      .from("kos")
      .select("*, gambar_kos(*, tipe_gambar(*))")
      .eq("property_status", "active")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      dataQuery = dataQuery.or(
        `name.ilike.%${search}%,address.ilike.%${search}%`
      );
    }

    if (minPrice) {
      dataQuery = dataQuery.gte("monthly_price", minPrice);
    }

    if (maxPrice) {
      dataQuery = dataQuery.lte("monthly_price", maxPrice);
    }

    if (likedOnly && likedKosIds.length > 0) {
      dataQuery = dataQuery.in("id", likedKosIds);
    }

    const { data, error } = await dataQuery;

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

    return NextResponse.json(
      {
        success: true,
        data: data || [],
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
