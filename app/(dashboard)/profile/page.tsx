import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Kelola informasi profil Anda</p>
      </div>

      {/* Profile form akan ditambahkan di sini */}
      <div className="max-w-2xl space-y-4">
        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Informasi Akun</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Email: {user.email}
          </p>
        </div>
      </div>
    </div>
  );
}
