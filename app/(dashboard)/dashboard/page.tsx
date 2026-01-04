import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LoginAlert } from "@/components/login-alert";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <LoginAlert />
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Selamat datang kembali, {user.email}
          </p>
        </div>
      </div>

      {/* Dashboard content akan ditambahkan di sini */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Stat cards akan ditambahkan di sini */}
      </div>
    </div>
  );
}
