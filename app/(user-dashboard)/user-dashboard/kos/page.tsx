import { createClient } from "@/lib/supabase/server";
import { KosListing } from "@/components/features/kos-listing";
import { KosFilter } from "@/components/features/kos-filter";
import { FilteredKosList } from "@/components/features/filtered-kos-list";
import type { KosData } from "@/components/features/dashboard/kos-card";

export default async function UserKosPage() {
  const supabase = await createClient();

  // Fetch user data
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  // Fetch liked kos IDs by user
  const { data: userLikes } = await supabase
    .from("user_likes")
    .select("kos_id")
    .eq("user_id", (await supabase.auth.getUser()).data.user?.id || "");

  const likedKosIds = new Set(userLikes?.map((like) => like.kos_id) || []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cari Kos</h1>
        <p className="text-muted-foreground">
          Temukan kos yang sesuai dengan kebutuhan Anda
        </p>
      </div>

      {kosList.length === 0 ? (
        <div className="rounded-lg border p-12 text-center">
          <p className="text-muted-foreground mb-4">
            Belum ada kos yang tersedia saat ini.
          </p>
        </div>
      ) : (
        <FilteredKosList
          initialKosList={kosList}
          likedKosIds={likedKosIds}
          user={user}
        />
      )}
    </div>
  );
}
