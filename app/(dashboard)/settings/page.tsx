import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">
          Kelola pengaturan akun dan preferensi Anda
        </p>
      </div>

      {/* Settings content akan ditambahkan di sini */}
      <div className="max-w-2xl space-y-4">
        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Pengaturan Umum</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Konfigurasi pengaturan umum aplikasi
          </p>
        </div>
      </div>
    </div>
  );
}

