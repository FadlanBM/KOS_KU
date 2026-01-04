"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Home,
  Users,
  DollarSign,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface KosData {
  id: string;
  name: string;
  address: string;
  city: string;
  price: number;
  roomType: string;
  facilities: string;
  description: string;
  availableRooms: number;
  totalRooms: number;
}

interface KosCardProps {
  kos: KosData;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export function KosCard({
  kos,
  onEdit,
  onDelete,
  isDeleting = false,
}: KosCardProps) {
  const occupancyRate =
    ((kos.totalRooms - kos.availableRooms) / kos.totalRooms) * 100;
  const isFullyOccupied = kos.availableRooms === 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold">{kos.name}</h3>
            {isFullyOccupied ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <XCircle className="size-3 text-red-500" />
                Penuh
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <CheckCircle2 className="size-3" />
                Tersedia
              </span>
            )}
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              <span>
                {kos.address}, {kos.city}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Home className="size-4" />
              <span>{kos.roomType}</span>
            </div>

            <div className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="size-4" />
              <span className="text-primary">
                {formatPrice(kos.price)}/bulan
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="size-4" />
              <span>
                {kos.availableRooms} dari {kos.totalRooms} kamar tersedia
              </span>
            </div>
          </div>

          {kos.facilities && (
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Fasilitas:
              </p>
              <p className="text-sm">{kos.facilities}</p>
            </div>
          )}

          {kos.description && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {kos.description}
              </p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">
                    Tingkat Hunian
                  </span>
                  <span className="text-xs font-medium">
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
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit?.(kos.id)}
          disabled={isDeleting}
        >
          <Edit className="size-4" />
          Edit
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
              disabled={isDeleting}
            >
              <Trash2 className="size-4" />
              {isDeleting ? "Menghapus..." : "Hapus"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data kos
                <span className="font-semibold text-foreground">
                  {" "}
                  "{kos.name}"{" "}
                </span>
                secara permanen dari database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete?.(kos.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
