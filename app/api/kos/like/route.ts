import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { kosId } = await request.json();

    if (!kosId) {
      return NextResponse.json(
        { error: "Kos ID is required" },
        { status: 400 }
      );
    }

    // Check if like exists
    const { data: existingLike, error: checkError } = await supabase
      .from("user_likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("kos_id", kosId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking like:", checkError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (existingLike) {
      // Unlike
      const { error: deleteError } = await supabase
        .from("user_likes")
        .delete()
        .eq("id", existingLike.id);

      if (deleteError) {
        console.error("Error removing like:", deleteError);
        return NextResponse.json(
          { error: deleteError.message || "Failed to remove like" },
          { status: 500 }
        );
      }

      return NextResponse.json({ liked: false });
    } else {
      // Like
      const { error: insertError } = await supabase.from("user_likes").insert({
        user_id: user.id,
        kos_id: kosId,
      });

      if (insertError) {
        console.error("Error adding like:", insertError);
        return NextResponse.json(
          { error: insertError.message || "Failed to add like" },
          { status: 500 }
        );
      }

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Unexpected error in like API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
