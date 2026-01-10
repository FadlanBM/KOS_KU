import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Home,
  Users,
  DollarSign,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { KosData } from "@/components/features/dashboard/kos-card";
import { LikeButton } from "@/components/features/like-button";
import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/auth-js";

interface KosListingProps {
  kosList: KosData[];
  limit?: number;
  likedKosIds?: Set<string>;
  user: User | null;
}

export async function KosListing({
  kosList,
  limit,
  likedKosIds,
  user,
}: KosListingProps) {
  const displayKos = limit ? kosList.slice(0, limit) : kosList;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (displayKos.length === 0) {
    return (
      <div className="rounded-lg border p-12 text-center">
        <p className="text-muted-foreground">
          Belum ada kos yang tersedia saat ini.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {displayKos.map((kos) => {
        const isFullyOccupied = kos.availableRooms === 0;
        const occupancyRate =
          ((kos.totalRooms - kos.availableRooms) / kos.totalRooms) * 100;

        // Check if this kos is liked by user
        const isLiked = likedKosIds ? likedKosIds.has(kos.id) : false;

        return (
          <div
            key={kos.id}
            className="group relative rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
          >
            {/* Like Button */}
            <LikeButton kosId={kos.id} initialIsLiked={isLiked} user={user} />

            <div className="flex items-start justify-between mb-4">
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
                    <p className="text-sm line-clamp-2">{kos.facilities}</p>
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

            <div className="mt-6 flex items-center gap-2">
              <Button asChild className="flex-1">
                <Link href={`/user-dashboard/kos/${kos.id}`}>Detail</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/user-dashboard/kos/${kos.id}/rent`}>
                  Sewa Sekarang
                </Link>
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
