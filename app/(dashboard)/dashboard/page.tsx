import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LoginAlert } from "@/components/login-alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Receipt, Users, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch counts for dashboard
  const [
    { count: kosCount },
    { count: transactionCount },
    { count: pendingCount },
    { count: userCount }
  ] = await Promise.all([
    supabase.from("kos").select("*", { count: "exact", head: true }),
    supabase.from("transactions").select("*", { count: "exact", head: true }),
    supabase.from("transactions").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("profiles").select("*", { count: "exact", head: true })
  ]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <LoginAlert />
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
        <p className="text-muted-foreground">
          Selamat datang kembali, {user.email}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properti</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kosCount || 0}</div>
            <p className="text-xs text-muted-foreground">Unit kos terdaftar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactionCount || 0}</div>
            <p className="text-xs text-muted-foreground">Keseluruhan transaksi</p>
          </CardContent>
        </Card>

        <Card className={pendingCount && pendingCount > 0 ? "border-yellow-200 bg-yellow-50/30" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perlu Validasi</CardTitle>
            <AlertCircle className={`h-4 w-4 ${pendingCount && pendingCount > 0 ? "text-yellow-600" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${pendingCount && pendingCount > 0 ? "text-yellow-600" : ""}`}>
              {pendingCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">Transaksi menunggu persetujuan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount || 0}</div>
            <p className="text-xs text-muted-foreground">User terdaftar</p>
          </CardContent>
        </Card>
      </div>

      {pendingCount && pendingCount > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/20">
          <CardContent className="flex flex-col md:flex-row items-center justify-between p-6 gap-4">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-900">Ada {pendingCount} transaksi menunggu validasi!</h3>
                <p className="text-sm text-yellow-700">Segera proses pengajuan sewa dari pengguna agar mereka bisa segera menempati kos.</p>
              </div>
            </div>
            <Button asChild className="bg-yellow-600 hover:bg-yellow-700 text-white shrink-0">
              <Link href="/transactions" className="flex items-center gap-2">
                Lihat Transaksi <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" asChild className="justify-start">
              <Link href="/kos/add">
                <Home className="mr-2 h-4 w-4" /> Tambah Unit Kos Baru
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href="/transactions">
                <Receipt className="mr-2 h-4 w-4" /> Kelola Semua Transaksi
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
