import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Schema validasi untuk profile penyewa
const profilePenyewaSchema = z.object({
  full_name: z.string().min(1, "Nama lengkap harus diisi"),
  phone_number: z.string().min(1, "Nomor telepon harus diisi"),
  gender: z.enum(["male", "female"] as const, {
    message: "Jenis kelamin harus male atau female",
  }),
  date_of_birth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Format tanggal lahir tidak valid",
  }),
  address: z.string().min(1, "Alamat harus diisi"),
  emergency_contact: z.string().min(1, "Kontak darurat harus diisi"),
});

/**
 * API endpoint untuk membuat profile penyewa
 * POST /api/mobile/profile/penyewa
 *
 * Headers:
 * Authorization: Bearer <access_token>
 *
 * Body:
 * {
 *   "full_name": "Nama Lengkap",
 *   "phone_number": "08123456789",
 *   "gender": "male",
 *   "date_of_birth": "1990-01-01",
 *   "address": "Alamat Lengkap",
 *   "emergency_contact": "08987654321"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verifikasi Token
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

    // Ambil user dari token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Token tidak valid",
        },
        { status: 401 }
      );
    }

    // 2. Parse dan Validasi Body
    const body = await request.json();
    const validationResult = profilePenyewaSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const profileData = {
      ...validationResult.data,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    // 3. Simpan ke Database
    const { data, error: dbError } = await supabase
      .from("profile_penyewa")
      .upsert(profileData)
      .select()
      .single();

    if (dbError) {
      console.error("Error creating profile_penyewa:", dbError);
      return NextResponse.json(
        {
          success: false,
          error: "Gagal menyimpan profil penyewa",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Profil penyewa berhasil disimpan",
        data: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error in profile_penyewa:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan internal",
      },
      { status: 500 }
    );
  }
}

/**
 * API endpoint untuk mendapatkan profile penyewa
 * GET /api/mobile/profile/penyewa
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data, error: dbError } = await supabase
      .from("profile_penyewa")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (dbError) {
      return NextResponse.json(
        { success: false, error: "Gagal mengambil profil" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Profil belum dibuat" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
