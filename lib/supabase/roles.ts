import { createClient } from "./server";

/**
 * Check if user has admin role
 * @param userId - User ID to check
 * @returns true if user is admin, false otherwise
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();

  try {
    // Query untuk check apakah user memiliki role "admin"
    // Menggunakan join untuk mendapatkan role name
    const { data, error } = await supabase
      .from("user_role")
      .select(`
        role_id,
        roles!inner(name)
      `)
      .eq("user_id", userId)
      .eq("roles.name", "admin")
      .maybeSingle();

    if (error) {
      console.error("Error checking admin role:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Unexpected error checking admin role:", error);
    return false;
  }
}

/**
 * Check if user has pemilik role
 * @param userId - User ID to check
 * @returns true if user is pemilik, false otherwise
 */
export async function isPemilik(userId: string): Promise<boolean> {
  const supabase = await createClient();

  try {
    // Query untuk check apakah user memiliki role "pemilik"
    const { data, error } = await supabase
      .from("user_role")
      .select(`
        role_id,
        roles!inner(name)
      `)
      .eq("user_id", userId)
      .eq("roles.name", "pemilik")
      .maybeSingle();

    if (error) {
      console.error("Error checking pemilik role:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Unexpected error checking pemilik role:", error);
    return false;
  }
}

/**
 * Check if user has user role
 * @param userId - User ID to check
 * @returns true if user has user role, false otherwise
 */
export async function isUser(userId: string): Promise<boolean> {
  const supabase = await createClient();

  try {
    // Query untuk check apakah user memiliki role "user"
    const { data, error } = await supabase
      .from("user_role")
      .select(`
        role_id,
        roles!inner(name)
      `)
      .eq("user_id", userId)
      .eq("roles.name", "user")
      .maybeSingle();

    if (error) {
      console.error("Error checking user role:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Unexpected error checking user role:", error);
    return false;
  }
}

/**
 * Get user roles
 * @param userId - User ID
 * @returns Array of role names
 */
export async function getUserRoles(userId: string): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_role")
    .select(`
      roles(name)
    `)
    .eq("user_id", userId);

  if (error || !data) {
    return [];
  }

  return data.map((item: any) => item.roles.name);
}
