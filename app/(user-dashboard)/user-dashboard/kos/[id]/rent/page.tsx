"use client";

import Script from "next/script";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, CreditCard, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

declare global {
  interface Window {
    snap: any;
  }
}

interface RentPageProps {
  params: Promise<{ id: string }>;
}

export default function RentPage({ params }: RentPageProps) {
  const router = useRouter();
  const [kos, setKos] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState("1");
  const [ktp, setKtp] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);

  // Unpack params
  const [id, setId] = useState<string>("");

  useEffect(() => {
    params.then((unwrap) => setId(unwrap.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;

    const fetchKos = async () => {
      const supabase = createClient();

      // Check authentication first
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Anda harus login untuk menyewa");
        router.push(`/login?redirect=/user-dashboard/kos/${id}/rent`);
        return;
      }

      const { data, error } = await supabase
        .from("kos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Gagal memuat data kos");
        router.push("/user-dashboard/kos");
        return;
      }

      setKos(data);
      setLoading(false);
    };

    fetchKos();
  }, [id, router]);

  useEffect(() => {
    if (kos && duration) {
      setTotalPrice(kos.price * parseInt(duration));
    }
  }, [kos, duration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !duration || !ktp) {
      toast.error("Mohon lengkapi semua data");
      return;
    }

    if (ktp.length !== 16 || !/^\d+$/.test(ktp)) {
      toast.error("Nomor KTP harus 16 digit angka");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Anda harus login untuk menyewa");
        router.push("/login");
        return;
      }

      // Call payment API
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kosId: id,
          kosName: kos.name,
          startDate,
          duration: parseInt(duration),
          totalPrice,
          ktpNumber: ktp,
          customerDetails: {
            firstName: user.user_metadata?.full_name || "Customer",
            lastName: "",
            email: user.email,
            phone: user.phone || "08123456789", // Default phone if not available
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat transaksi");
      }

      // Open Snap Popup
      window.snap.pay(data.token, {
        onSuccess: function (result: any) {
          toast.success("Pembayaran berhasil!");
          router.push("/user-dashboard/transactions");
        },
        onPending: function (result: any) {
          toast.info("Menunggu pembayaran...");
          router.push("/user-dashboard/transactions");
        },
        onError: function (result: any) {
          toast.error("Pembayaran gagal!");
          console.error(result);
        },
        onClose: function () {
          toast.warning(
            "Anda menutup popup pembayaran sebelum menyelesaikan pembayaran"
          );
        },
      });
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan saat mengajukan sewa");
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!kos) return null;

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
      <div className="mb-6">
        <Button variant="ghost" asChild className="pl-0 hover:bg-transparent">
          <Link
            href={`/user-dashboard/kos/${id}`}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="size-4" />
            Kembali ke Detail
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mt-2">Ajukan Sewa Kos</h1>
        <p className="text-muted-foreground">
          Lengkapi formulir di bawah ini untuk mengajukan sewa
        </p>
      </div>

      <div className="grid gap-6">
        {/* Kos Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Rincian Kos</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div className="flex-1 space-y-1">
              <h3 className="font-semibold text-lg">{kos.name}</h3>
              <p className="text-sm text-muted-foreground">{kos.address}</p>
              <p className="text-primary font-medium">
                {formatPrice(kos.price)} / bulan
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Booking Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Data Penyewa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ktp">Nomor KTP (16 Digit)</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input
                    id="ktp"
                    placeholder="Masukkan 16 digit NIK"
                    className="pl-9"
                    value={ktp}
                    onChange={(e) => {
                      const val = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 16);
                      setKtp(val);
                    }}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  {ktp.length}/16
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Mulai Sewa</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input
                    id="startDate"
                    type="date"
                    className="pl-9"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Lama Sewa</Label>
                <div className="relative">
                  <Select
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  >
                    {[1, 2, 3, 6, 12].map((num) => (
                      <option key={num} value={num.toString()}>
                        {num} Bulan
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Harga per bulan</span>
                  <span>{formatPrice(kos.price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Durasi</span>
                  <span>{duration} Bulan</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-primary">
                  <span>Cicilan 1 Bulan</span>
                  <span>{formatPrice(kos.price)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total Bayar</span>
                  <span className="text-primary">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 size-4" />
                    Ajukan Sewa Sekarang
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
