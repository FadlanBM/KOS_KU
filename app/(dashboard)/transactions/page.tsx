import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function TransactionsPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Transaksi</h1>
        <p className="text-muted-foreground">
          Riwayat transaksi Anda
        </p>
      </div>

      {/* Transactions table akan ditambahkan di sini */}
      <div className="rounded-lg border p-6">
        <p className="text-sm text-muted-foreground">
          Daftar transaksi akan ditampilkan di sini
        </p>
      </div>
    </div>
  );
}

