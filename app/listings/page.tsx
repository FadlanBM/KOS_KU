import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { KosListing } from "@/components/features/kos-listing";
import { KosFilter } from "@/components/features/kos-filter";
import type { KosData } from "@/components/features/dashboard/kos-card";
import { HeroHeader } from "@/components/header";
import { FilteredKosList } from "@/components/features/filtered-kos-list";
import { KosListingSkeleton } from "@/components/loading/kos-skeleton";

async function KosListData() {
  const supabase = await createClient();
  // Fetch semua data kos yang tersedia (available_rooms > 0)
  const { data: kosData, error } = await supabase
    .from("kos")
    .select("*")
    .gt("available_rooms", 0) // Hanya kos yang masih ada kamar tersedia
    .order("created_at", { ascending: false })
    .limit(100); // Limit untuk performa

  // Handle error
  if (error) {
    console.error("Error fetching kos:", error);
  }

  // Map data dari database ke format KosData
  const kosList: KosData[] =
    kosData?.map((kos) => ({
      id: kos.id,
      name: kos.name,
      address: kos.address,
      city: kos.city,
      price: kos.price,
      roomType: kos.room_type,
      facilities: kos.facilities || "",
      description: kos.description || "",
      availableRooms: kos.available_rooms,
      totalRooms: kos.total_rooms,
    })) || [];

  // Fetch user likes if logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let likedKosIds: Set<string> | undefined;

  if (user) {
    const { data: userLikes } = await supabase
      .from("user_likes")
      .select("kos_id")
      .eq("user_id", user.id);

    likedKosIds = new Set(userLikes?.map((like) => like.kos_id) || []);
  }

  if (kosList.length === 0) {
    return (
      <div className="rounded-lg border p-12 text-center">
        <p className="text-muted-foreground mb-4">
          Belum ada kos yang tersedia saat ini.
        </p>
      </div>
    );
  }

  return (
    <FilteredKosList
      initialKosList={kosList}
      likedKosIds={likedKosIds}
      user={user}
    />
  );
}

export default async function ListingsPage() {
  return (
    <>
      <HeroHeader />
      <main className="container mx-auto px-4 py-12 pt-24">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Daftar Kos Tersedia
          </h1>
          <p className="text-muted-foreground">
            Temukan kos yang sesuai dengan kebutuhan Anda
          </p>
        </div>

        <Suspense fallback={<KosListingSkeleton count={6} />}>
          <KosListData />
        </Suspense>
      </main>
    </>
  );
}
