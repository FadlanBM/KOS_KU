import { createClient } from "@/lib/supabase/server";
import { Home, Search, Heart, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LoginAlert } from "@/components/login-alert";

export default async function UserDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch jumlah kos yang tersedia
  const { count: kosCount } = await supabase
    .from("kos")
    .select("*", { count: "exact", head: true })
    .gt("available_rooms", 0);

  // Fetch jumlah favorit
  const { count: favoritesCount } = await supabase
    .from("user_likes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id);

  return (
    <div className="space-y-4 sm:space-y-6">
      <LoginAlert />
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Selamat Datang, {user?.email?.split("@")[0] || "User"}!
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Kelola dan temukan kos yang sesuai dengan kebutuhan Anda
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                Kos Tersedia
              </p>
              <p className="text-xl font-bold sm:text-2xl">{kosCount || 0}</p>
            </div>
            <div className="rounded-full bg-primary/10 p-2 sm:p-3">
              <Home className="size-5 text-primary sm:size-6" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                Favorit
              </p>
              <p className="text-xl font-bold sm:text-2xl">
                {favoritesCount || 0}
              </p>
            </div>
            <div className="rounded-full bg-red-500/10 p-2 sm:p-3">
              <Heart className="size-5 text-red-500 sm:size-6" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                Profile
              </p>
              <p className="text-xl font-bold sm:text-2xl">-</p>
            </div>
            <div className="rounded-full bg-green-500/10 p-2 sm:p-3">
              <User className="size-5 text-green-500 sm:size-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-1">
        <div className="rounded-lg border bg-card p-4 sm:p-6">
          <h3 className="text-base font-semibold mb-2 sm:text-lg">
            Lihat Favorit
          </h3>
          <p className="text-xs text-muted-foreground mb-4 sm:text-sm">
            Kelola kos yang telah Anda simpan sebagai favorit
          </p>
          <Button asChild variant="outline" size="sm" className="sm:size-default">
            <Link href="/user-dashboard/favorites">
              <Heart className="size-4 mr-2" />
              Lihat Favorit
            </Link>
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border bg-card p-4 sm:p-6">
        <h3 className="text-base font-semibold mb-4 sm:text-lg">
          Aktivitas Terbaru
        </h3>
        <div className="text-center py-6 text-muted-foreground sm:py-8">
          <p className="text-sm">Belum ada aktivitas terbaru</p>
        </div>
      </div>
    </div>
  );
}
