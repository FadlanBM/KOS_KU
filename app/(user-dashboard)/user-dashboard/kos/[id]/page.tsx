import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { HeroHeader } from "@/components/header";
import { KosDetail } from "@/components/features/kos-detail";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface KosDetailPageProps {
  params: Promise<{ id: string }>;
}

async function KosDetailContent({ id }: { id: string }) {
  const supabase = await createClient();

  // Fetch data kos berdasarkan ID
  const { data: kosData, error } = await supabase
    .from("kos")
    .select("*")
    .eq("id", id)
    .single();

  // Handle error atau data tidak ditemukan
  if (error || !kosData) {
    notFound();
  }

  // Map data dari database ke format KosData
  const kos = {
    id: kosData.id,
    name: kosData.name,
    address: kosData.address,
    city: kosData.city,
    price: kosData.price,
    roomType: kosData.room_type,
    facilities: kosData.facilities || "",
    description: kosData.description || "",
    availableRooms: kosData.available_rooms,
    totalRooms: kosData.total_rooms,
    createdAt: kosData.created_at,
    updatedAt: kosData.updated_at,
    nomorPemilik: kosData.nomor_pemilik,
  };

  return <KosDetail kos={kos} />;
}

function KosDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      <div className="space-y-3 sm:space-y-4">
        <Skeleton className="h-8 sm:h-10 w-3/4" />
        <Skeleton className="h-5 sm:h-6 w-1/2" />
      </div>
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Skeleton className="h-40 sm:h-48 w-full rounded-lg" />
          <Skeleton className="h-40 sm:h-48 w-full rounded-lg" />
        </div>
        <div className="space-y-4 sm:space-y-6">
          <Skeleton className="h-56 sm:h-64 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default async function KosDetailPage({ params }: KosDetailPageProps) {
  const { id } = await params;

  return (
    <>
      <div className="mb-4 sm:mb-6 mt-4 sm:mt-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/user-dashboard/kos" className="text-sm">
            <ArrowLeft className="size-4 mr-2" />
            <span className="hidden sm:inline">Kembali ke Daftar Kos</span>
            <span className="sm:hidden">Kembali</span>
          </Link>
        </Button>
      </div>
      <Suspense fallback={<KosDetailSkeleton />}>
        <KosDetailContent id={id} />
      </Suspense>
    </>
  );
}
