import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isAdmin, isUser, isPemilik } from "@/lib/supabase/roles";

/**
 * API Route untuk check role user (client-side)
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { isAdmin: false, isPemilik: false, isUser: false, authenticated: false },
        { status: 200 }
      );
    }

    // Check roles
    const [userIsAdmin, userIsPemilik, userIsUser] = await Promise.all([
      isAdmin(user.id),
      isPemilik(user.id),
      isUser(user.id),
    ]);

    return NextResponse.json({
      isAdmin: userIsAdmin,
      isPemilik: userIsPemilik,
      isUser: userIsUser,
      authenticated: true,
    });
  } catch (error) {
    console.error("Error checking user role:", error);
    return NextResponse.json(
      { isAdmin: false, isPemilik: false, isUser: false, authenticated: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

