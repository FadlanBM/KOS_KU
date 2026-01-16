import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * API Route untuk assign role "user" ke user baru
 * Digunakan setelah registrasi berhasil
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Dapatkan role_id untuk role "user"
    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("name", "user")
      .single();

    if (roleError || !roleData) {
      console.error("Error fetching user role:", roleError);
      // Jika role tidak ditemukan, trigger database akan handle ini
      // Jadi kita return success karena trigger akan menanganinya
      return NextResponse.json(
        { message: "Role will be assigned automatically" },
        { status: 200 }
      );
    }

    // Insert role ke user_role (jika belum ada)
    const { error: insertError } = await supabase
      .from("user_role")
      .insert({
        user_id: user.id,
        role_id: roleData.id,
      })
      .select()
      .single();

    // Jika sudah ada (conflict), itu berarti role sudah di-assign
    if (insertError) {
      // Check jika error karena duplicate (sudah ada)
      if (insertError.code === "23505") {
        return NextResponse.json(
          { message: "User role already assigned" },
          { status: 200 }
        );
      }
      console.error("Error assigning user role:", insertError);
      return NextResponse.json(
        { error: "Failed to assign role" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "User role assigned successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

