import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * API Endpoint untuk mengambil data kos berdasarkan UUID
 * GET /api/kos/[id]
 * ID yang diterima adalah UUID
 *
 * Headers:
 * Authorization: Bearer <access_token>
 *
 * Response:
 * {
 *   "success": true,
 *   "data": { ... }
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid UUID format",
        },
        { status: 400 }
      );
    }

    // 1. Ambil token dari header Authorization
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

    // 2. Validasi token dengan Supabase
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

    // 3. Query data kos berdasarkan UUID
    const { data: kos, error: kosError } = await supabase
      .from("kos")
      .select("*")
      .eq("id", id)
      .single();

    if (kosError) {
      return NextResponse.json(
        {
          success: false,
          error: "Gagal mengambil data kos",
        },
        { status: 500 }
      );
    }

    if (!kos) {
      return NextResponse.json(
        {
          success: false,
          error: "Kos tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // Map data ke format KosData (camelCase) yang digunakan di KosCard
    const mappedKos = {
      id: kos.id,
      userId: kos.user_id,
      name: kos.name,
      address: kos.address,
      location:
        typeof kos.location === "object" && kos.location !== null
          ? (kos.location as any).text || ""
          : kos.location || "",
      description: kos.description || "",
      genderType: kos.gender_type,
      availableRooms: kos.available_rooms,
      totalRooms: kos.total_rooms,
      monthlyPrice: kos.monthly_price,
      yearlyPrice: kos.yearly_price,
      depositPrice: kos.deposit_price,
      adminFee: kos.admin_fee,
      electricityType: kos.electricity_type,
      waterType: kos.water_type,
      minStayDuration: kos.min_stay_duration,
      roomSize: kos.room_size,
      certificateType: kos.certificate_type,
      yearBuilt: kos.year_built,
      buildingFloors: kos.building_floors,
      propertyStatus: kos.property_status,
      isFeatured: kos.is_featured,
      viewCount: kos.view_count,
      ratingAverage: kos.rating_average,
      totalReviews: kos.total_reviews,
      nearestCampus: kos.nearest_campus,
      distanceToCampus: kos.distance_to_campus,
      fasilitas_kos: kos.fasilitas_kos,
      fasilitas_kamar: kos.fasilitas_kamar,
      fasilitas_kamar_mandi: kos.fasilitas_kamar_mandi,
      fasilitas_parkir: kos.fasilitas_parkir,
      peraturan_kos: kos.peraturan_kos,
    };

    return NextResponse.json(
      {
        success: true,
        data: mappedKos,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in GET /api/kos/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan server internal",
      },
      { status: 500 }
    );
  }
}
