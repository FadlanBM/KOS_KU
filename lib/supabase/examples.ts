/**
 * Contoh penggunaan Supabase
 * File ini hanya sebagai referensi, tidak digunakan di production
 * 
 * IMPORTANT: File ini hanya untuk dokumentasi, jangan di-import di production code!
 */

// ============================================
// CLIENT-SIDE EXAMPLES
// ============================================

// Example 1: Menggunakan client di Client Component
export async function exampleClientComponent() {
  "use client";
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();

  // Query data
  const { data, error } = await supabase
    .from("table_name")
    .select("*")
    .limit(10);

  if (error) {
    console.error("Error:", error);
    return;
  }

  return data;
}

// Example 2: Menggunakan auth helpers
export async function exampleAuth() {
  "use client";
  const { signInWithEmail, signUpWithEmail, signOut, getUser } = await import(
    "@/lib/supabase"
  );

  // Sign in
  const { data: signInData, error: signInError } = await signInWithEmail(
    "user@example.com",
    "password123"
  );

  // Sign up
  const { data: signUpData, error: signUpError } = await signUpWithEmail(
    "user@example.com",
    "password123",
    {
      data: {
        name: "John Doe",
      },
    }
  );

  // Get current user
  const user = await getUser();

  // Sign out
  await signOut();
}

// ============================================
// SERVER-SIDE EXAMPLES
// ============================================

// Example 3: Menggunakan client di Server Component
export async function exampleServerComponent() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  // Query data
  const { data, error } = await supabase
    .from("table_name")
    .select("*")
    .limit(10);

  if (error) {
    console.error("Error:", error);
    return;
  }

  return data;
}

// Example 4: Menggunakan di API Route
export async function exampleApiRoute() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Query data
  const { data, error } = await supabase
    .from("table_name")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ data });
}

// Example 5: Real-time subscription (Client-side only)
export function exampleRealtimeSubscription() {
  "use client";
  const { createClient } = require("@/lib/supabase/client");
  const supabase = createClient();

  const channel = supabase
    .channel("table_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "table_name",
      },
      (payload: any) => {
        console.log("Change received!", payload);
      }
    )
    .subscribe();

  // Unsubscribe
  return () => {
    supabase.removeChannel(channel);
  };
}

// Example 6: File upload
export async function exampleFileUpload(file: File, bucket: string) {
  "use client";
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();

  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return data.publicUrl;
}
