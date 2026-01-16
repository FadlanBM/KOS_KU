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

    // Map data ke format KosData (camelCase) yang digunakan di KosCard
    const mappedKosList = kosList.map((kos) => ({
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
    }));

    return NextResponse.json(
      {
        success: true,
        message: "berhasil get data kos",
        data: mappedKosList,
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
