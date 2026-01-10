"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CreditCard,
  Receipt,
  Calendar,
  Home,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Transaction {
  id: string;
  start_date: string;
  duration_months: number;
  total_price: number;
  status: string;
  ktp_number: string;
  created_at: string;
  user_id: string;
  kos: {
    id: string;
    name: string;
    address: string;
  };
  profiles?: {
    full_name: string;
    email: string;
  };
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchTransactions = async () => {
    const supabase = createClient();

    // Fetch all transactions with kos and profiles info
    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        *,
        kos (id, name, address),
        profiles:user_id (full_name, email)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("Gagal memuat daftar transaksi");
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleUpdateStatus = async (
    id: string,
    newStatus: "approved" | "rejected"
  ) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin ${
        newStatus === "approved" ? "menyetujui" : "menolak"
      } transaksi ini?`
    );

    if (!confirmed) return;

    setActionLoading(id);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("transactions")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast.success(
        `Transaksi berhasil ${
          newStatus === "approved" ? "disetujui" : "ditolak"
        }`
      );
      // Refresh data
      await fetchTransactions();
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui status transaksi");
    } finally {
      setActionLoading(null);
    }
  };

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

  const renderTable = (items: Transaction[]) => {
    if (!items.length) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
          <p>Tidak ada transaksi dalam kategori ini.</p>
        </div>
      );
    }

    return (
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Penyewa</TableHead>
              <TableHead>Properti</TableHead>
              <TableHead>Durasi</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  <div className="text-sm">
                    {formatDate(transaction.created_at)}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    ID: {transaction.id.slice(0, 8)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {transaction.profiles?.full_name || "Guest"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {transaction.profiles?.email || "-"}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      KTP: {transaction.ktp_number}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{transaction.kos?.name}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {transaction.kos?.address}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="size-3 text-muted-foreground" />
                    {transaction.duration_months} Bln
                  </div>
                </TableCell>
                <TableCell className="font-bold">
                  {formatPrice(transaction.total_price)}
                </TableCell>
                <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                <TableCell className="text-right">
                  {transaction.status === "pending" ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                        onClick={() =>
                          handleUpdateStatus(transaction.id, "approved")
                        }
                        disabled={actionLoading === transaction.id}
                      >
                        <CheckCircle2 className="size-4 mr-1" />
                        Setujui
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                        onClick={() =>
                          handleUpdateStatus(transaction.id, "rejected")
                        }
                        disabled={actionLoading === transaction.id}
                      >
                        <XCircle className="size-4 mr-1" />
                        Tolak
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      Sudah divalidasi
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
            Disetujui
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
          >
            Menunggu
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Ditolak</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Memuat data transaksi...
          </p>
        </div>
      </div>
    );
  }

  const pendingCount = transactions.filter(
    (t) => t.status === "pending"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Manajemen Transaksi
          </h1>
          <p className="text-muted-foreground">
            Validasi dan kelola semua pengajuan sewa kos dari pengguna
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge
            variant="outline"
            className="h-fit py-1 px-3 border-yellow-300 bg-yellow-50 text-yellow-700 flex gap-2"
          >
            <AlertCircle className="size-4" />
            {pendingCount} Transaksi perlu validasi
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Receipt className="size-5" />
              Daftar Transaksi
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {!transactions.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <div className="rounded-full bg-muted p-4 mb-4">
                <CreditCard className="size-8" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Belum ada transaksi
              </h3>
              <p>Tidak ada riwayat transaksi yang ditemukan di sistem.</p>
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">Semua</TabsTrigger>
                <TabsTrigger value="pending" className="flex gap-2">
                  Menunggu
                  {pendingCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-[10px] text-white font-bold">
                      {pendingCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="approved">Disetujui</TabsTrigger>
                <TabsTrigger value="rejected">Ditolak</TabsTrigger>
              </TabsList>

              <TabsContent value="all">{renderTable(transactions)}</TabsContent>
              <TabsContent value="pending">
                {renderTable(
                  transactions.filter((t) => t.status === "pending")
                )}
              </TabsContent>
              <TabsContent value="approved">
                {renderTable(
                  transactions.filter((t) => t.status === "approved")
                )}
              </TabsContent>
              <TabsContent value="rejected">
                {renderTable(
                  transactions.filter((t) => t.status === "rejected")
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
