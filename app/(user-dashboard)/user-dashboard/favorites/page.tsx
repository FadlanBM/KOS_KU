import { createClient } from "@/lib/supabase/server";
import { KosListing } from "@/components/features/kos-listing";
import type { KosData } from "@/components/features/dashboard/kos-card";

export default async function UserFavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch liked kos
  const { data: likedData, error } = await supabase
    .from("user_likes")
    .select(
      `
      kos_id,
      kos:kos (*)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching favorites:", error);
  }

  // Transform data
  const kosList: KosData[] =
    likedData
      ?.map((item) => {
        const kos = item.kos;
        // Handle case where kos might be null (deleted) or not match generic type perfectly
        if (!kos || Array.isArray(kos)) return null;

        // Supabase types might verify strict shape, so we cast if needed or map carefully
        const k = kos as any;

        return {
          id: k.id,
          name: k.name,
          address: k.address,
          city: k.city,
          price: k.price,
          roomType: k.room_type,
          facilities: k.facilities || "",
          description: k.description || "",
          availableRooms: k.available_rooms,
          totalRooms: k.total_rooms,
        };
      })
      .filter((item): item is KosData => item !== null) || [];

  // Create set of IDs for the heart icon state (all displayed here are liked)
  const likedKosIds = new Set(kosList.map((k) => k.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kos Favorit</h1>
        <p className="text-muted-foreground">
          Kelola kos yang telah Anda simpan sebagai favorit
        </p>
      </div>

      {kosList.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground mb-4">
            Belum ada kos yang disimpan sebagai favorit
          </p>
          <p className="text-sm text-muted-foreground">
            Mulai cari kos dan simpan yang Anda suka!
          </p>
        </div>
      ) : (
        <KosListing user={user} kosList={kosList} likedKosIds={likedKosIds} />
      )}
    </div>
  );
}
