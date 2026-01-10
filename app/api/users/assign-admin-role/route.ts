import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * API Route untuk assign role "admin" ke user
 * Digunakan secara khusus oleh halaman manage-register
 */
export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Dapatkan role_id untuk role "admin"
    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("name", "admin")
      .single();

    if (roleError || !roleData) {
      console.error("Error fetching admin role:", roleError);
      return NextResponse.json(
        { error: "Admin role not found" },
        { status: 500 }
      );
    }

    // Insert role ke user_roles
    const { error: insertError } = await supabase
      .from("user_roles")
      .insert({
        user_id: userId,
        role_id: roleData.id,
      });

    if (insertError) {
      // Check jika error karena duplicate (sudah ada)
      if (insertError.code === "23505") {
        return NextResponse.json(
          { message: "Admin role already assigned" },
          { status: 200 }
        );
      }
      console.error("Error assigning admin role:", insertError);
      return NextResponse.json(
        { error: "Failed to assign admin role" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Admin role assigned successfully" },
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
