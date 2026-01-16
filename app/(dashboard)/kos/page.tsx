import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { KosList } from "@/components/features/dashboard/kos-list";
import type { KosData } from "@/components/features/dashboard/kos-card";

export default async function KosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch data dari Supabase
  const { data: kosData, error } = await supabase
    .from("kos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Handle error
  if (error) {
    console.error("Error fetching kos:", error);
  }

  // Map data dari database ke format KosData
  // Mapping field database (snake_case) ke interface (camelCase)
  const kosList: KosData[] =
    kosData?.map((kos) => ({
      id: kos.id,
      userId: kos.user_id,
      name: kos.name,
      address: kos.address,
      location:
        typeof kos.location === "object" && kos.location !== null
          ? (kos.location as any).text || ""
          : kos.location || "",
      description: kos.description || "",
      genderType: kos.gender_type,
      availableRooms: kos.available_rooms,
      totalRooms: kos.total_rooms,
      monthlyPrice: kos.monthly_price,
      yearlyPrice: kos.yearly_price,
      depositPrice: kos.deposit_price,
      adminFee: kos.admin_fee,
      electricityType: kos.electricity_type,
      waterType: kos.water_type,
      minStayDuration: kos.min_stay_duration,
      roomSize: kos.room_size,
      certificateType: kos.certificate_type,
      yearBuilt: kos.year_built,
      buildingFloors: kos.building_floors,
      propertyStatus: kos.property_status,
      isFeatured: kos.is_featured,
      viewCount: kos.view_count,
      ratingAverage: kos.rating_average,
      totalReviews: kos.total_reviews,
      nearestCampus: kos.nearest_campus,
      distanceToCampus: kos.distance_to_campus,
      fasilitas_kos: kos.fasilitas_kos,
      fasilitas_kamar: kos.fasilitas_kamar,
      fasilitas_kamar_mandi: kos.fasilitas_kamar_mandi,
      fasilitas_parkir: kos.fasilitas_parkir,
      peraturan_kos: kos.peraturan_kos,
    })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Kos</h1>
          <p className="text-muted-foreground">
            Kelola data kos Anda ({kosList.length} kos)
          </p>
        </div>
        <Link href="/kos/add">
          <Button>
            <Plus className="size-4" />
            Jual Properti Kos
          </Button>
        </Link>
      </div>

      {kosList.length === 0 ? (
        <div className="rounded-lg border p-12 text-center">
          <p className="text-muted-foreground mb-4">
            Belum ada data kos. Tambahkan kos pertama Anda!
          </p>
          <Link href="/kos/add">
            <Button>Jual Properti Kos</Button>
          </Link>
        </div>
      ) : (
        <KosList kosList={kosList} />
      )}
    </div>
  );
}
