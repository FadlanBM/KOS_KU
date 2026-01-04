"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Receipt, Calendar, Home, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Transaction {
  id: string;
  start_date: string;
  duration_months: number;
  total_price: number;
  status: string;
  ktp_number: string;
  created_at: string;
  kos: {
    id: string;
    name: string;
    address: string;
    price: number;
  };
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("transactions")
        .select("*, kos(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        toast.error("Gagal memuat riwayat transaksi");
      } else {
        setTransactions(data || []);
      }
      setLoading(false);
    };

    fetchTransactions();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Disetujui";
      case "pending":
        return "Menunggu Persetujuan";
      case "rejected":
        return "Ditolak";
      default:
        return status;
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Memuat riwayat transaksi...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Riwayat Transaksi</h1>
        <p className="text-muted-foreground">
          Lihat riwayat transaksi pembayaran sewa kos Anda
        </p>
      </div>

      {!transactions.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="size-5" />
              Daftar Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <div className="rounded-full bg-muted p-4 mb-4">
                <CreditCard className="size-8" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Belum ada transaksi
              </h3>
              <p className="mb-4">
                Anda belum melakukan transaksi pembayaran sewa kos.
              </p>
              <Button asChild>
                <Link href="/listings">Cari Kos Sekarang</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {transactions.map((transaction) => (
            <Card key={transaction.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Status Strip */}
                  <div
                    className={`w-full md:w-2 ${
                      getStatusColor(transaction.status).split(" ")[1]
                    }`}
                  />

                  <div className="flex-1 p-6 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                              transaction.status
                            )}`}
                          >
                            {getStatusLabel(transaction.status)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ID: {transaction.id.slice(0, 8)}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold mb-1">
                          {transaction.kos?.name || "Kos tidak ditemukan"}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Home className="size-3" /> {transaction.kos?.address}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {formatPrice(transaction.total_price)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Pembayaran
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Calendar className="size-3" /> Mulai Sewa
                        </p>
                        <p className="font-medium">
                          {formatDate(transaction.start_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Clock className="size-3" /> Durasi
                        </p>
                        <p className="font-medium">
                          {transaction.duration_months} Bulan
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Nomor KTP
                        </p>
                        <p className="font-medium font-mono">
                          {transaction.ktp_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Tanggal Transaksi
                        </p>
                        <p className="font-medium">
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
