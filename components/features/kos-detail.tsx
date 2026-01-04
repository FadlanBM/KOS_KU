"use client";

import {
  MapPin,
  Home,
  Users,
  DollarSign,
  CheckCircle2,
  XCircle,
  Calendar,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { KosData } from "./dashboard/kos-card";

interface KosDetailData extends KosData {
  createdAt?: string;
  updatedAt?: string;
  nomorPemilik?: string | null;
}

interface KosDetailProps {
  kos: KosDetailData;
}

export function KosDetail({ kos }: KosDetailProps) {
  const isFullyOccupied = kos.availableRooms === 0;
  const occupancyRate =
    ((kos.totalRooms - kos.availableRooms) / kos.totalRooms) * 100;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const getWhatsAppUrl = (phoneNumber?: string | null) => {
    if (!phoneNumber) return null;
    let formattedNumber = phoneNumber.replace(/\D/g, "");
    if (formattedNumber.startsWith("0")) {
      formattedNumber = "62" + formattedNumber.slice(1);
    }
    // Jika tidak ada kode negara, asumsikan 62
    if (!formattedNumber.startsWith("62")) {
      formattedNumber = "62" + formattedNumber;
    }
    return `https://wa.me/${formattedNumber}`;
  };

  const whatsappUrl = getWhatsAppUrl(kos.nomorPemilik);

  // Parse facilities jika berupa string yang dipisahkan koma
  const facilitiesList = kos.facilities
    ? kos.facilities
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                {kos.name}
              </h1>
              {isFullyOccupied ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400 border border-red-200 dark:border-red-800 self-start sm:self-center">
                  <XCircle className="size-3.5" />
                  Penuh
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400 border border-green-200 dark:border-green-800 self-start sm:self-center">
                  <CheckCircle2 className="size-3.5" />
                  Tersedia
                </span>
              )}
            </div>

            <div className="flex items-start gap-2 text-muted-foreground mb-3 sm:mb-2">
              <MapPin className="size-4 sm:size-5 mt-0.5 shrink-0" />
              <span className="text-base sm:text-lg leading-relaxed">
                {kos.address}, {kos.city}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
              {formatPrice(kos.price)}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              per bulan
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Description */}
          {kos.description && (
            <div className="rounded-lg border bg-card p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                Deskripsi
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                {kos.description}
              </p>
            </div>
          )}

          {/* Facilities */}
          {facilitiesList.length > 0 && (
            <div className="rounded-lg border bg-card p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <Building2 className="size-4 sm:size-5" />
                Fasilitas
              </h2>
              <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
                {facilitiesList.map((facility, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm sm:text-base"
                  >
                    <CheckCircle2 className="size-4 text-green-600 dark:text-green-400 shrink-0" />
                    <span>{facility}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Room Information */}
          <div className="rounded-lg border bg-card p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <Home className="size-4 sm:size-5" />
              Informasi Kamar
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm sm:text-base text-muted-foreground">
                  Tipe Kamar
                </span>
                <span className="text-sm sm:text-base font-medium">
                  {kos.roomType}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <span className="text-sm sm:text-base text-muted-foreground">
                  Total Kamar
                </span>
                <span className="text-sm sm:text-base font-medium">
                  {kos.totalRooms} kamar
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <span className="text-sm sm:text-base text-muted-foreground">
                  Kamar Tersedia
                </span>
                <span className="text-sm sm:text-base font-medium text-primary">
                  {kos.availableRooms} kamar
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <span className="text-sm sm:text-base text-muted-foreground">
                  Kamar Terisi
                </span>
                <span className="text-sm sm:text-base font-medium">
                  {kos.totalRooms - kos.availableRooms} kamar
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Quick Info Card */}
          <div className="rounded-lg border bg-card p-4 sm:p-6 lg:sticky lg:top-24">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
              Informasi Singkat
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <DollarSign className="size-4 sm:size-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Harga
                  </div>
                  <div className="text-sm sm:text-base font-semibold truncate">
                    {formatPrice(kos.price)}/bulan
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Home className="size-4 sm:size-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Tipe
                  </div>
                  <div className="text-sm sm:text-base font-semibold truncate">
                    {kos.roomType}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Users className="size-4 sm:size-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Ketersediaan
                  </div>
                  <div className="text-sm sm:text-base font-semibold">
                    {kos.availableRooms} dari {kos.totalRooms} kamar
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-3 sm:my-4" />

            {/* Occupancy Rate */}
            <div className="mb-3 sm:mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium">
                  Tingkat Hunian
                </span>
                <span className="text-xs sm:text-sm font-semibold">
                  {occupancyRate.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${occupancyRate}%` }}
                />
              </div>
            </div>

            {/* CTA Button */}
            {!isFullyOccupied && (
              <div className="space-y-2 sm:space-y-3">
                <Button className="w-full" size="default" asChild>
                  <Link href={`/listings/${kos.id}/rent`}>Ajukan Sewa</Link>
                </Button>
                {whatsappUrl ? (
                  <Button
                    className="w-full"
                    size="default"
                    variant="outline"
                    onClick={() => window.open(whatsappUrl, "_blank")}
                  >
                    Hubungi Pemilik
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    size="default"
                    variant="outline"
                    disabled
                  >
                    <span className="text-xs sm:text-sm">
                      Hubungi Pemilik (Nomor Belum Tersedia)
                    </span>
                  </Button>
                )}
              </div>
            )}

            {isFullyOccupied && (
              <Button className="w-full" size="default" variant="outline" disabled>
                Tidak Tersedia
              </Button>
            )}
          </div>

          {/* Additional Info */}
          {(kos.createdAt || kos.updatedAt) && (
            <div className="rounded-lg border bg-card p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <Calendar className="size-4 sm:size-5" />
                Informasi Tambahan
              </h3>
              <div className="space-y-2 text-xs sm:text-sm">
                {kos.createdAt && (
                  <div>
                    <span className="text-muted-foreground">Ditambahkan: </span>
                    <span className="font-medium">
                      {formatDate(kos.createdAt)}
                    </span>
                  </div>
                )}
                {kos.updatedAt && (
                  <div>
                    <span className="text-muted-foreground">Diperbarui: </span>
                    <span className="font-medium">
                      {formatDate(kos.updatedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
