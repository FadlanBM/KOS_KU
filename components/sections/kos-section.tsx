import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { KosListing } from "@/components/features/kos-listing";
import { KosListingSkeleton } from "@/components/loading/kos-skeleton";
import type { KosData } from "@/components/features/dashboard/kos-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function KosListingContent() {
  const supabase = await createClient();

  // Fetch data kos yang tersedia (available_rooms > 0), limit 6 untuk preview
  const { data: kosData, error } = await supabase
    .from("kos")
    .select("*")
    .gt("available_rooms", 0) // Hanya kos yang masih ada kamar tersedia
    .order("created_at", { ascending: false })
    .limit(6); // Limit 6 untuk preview di landing page

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

  if (kosList.length === 0) {
    return null; // Jangan tampilkan section jika tidak ada data
  }

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

  return (
    <KosListing
      user={user}
      kosList={kosList}
      limit={6}
      likedKosIds={likedKosIds}
    />
  );
}

export async function KosSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
            List Kos
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Temukan kos yang sesuai dengan kebutuhan Anda. Pilih dari berbagai
            pilihan kos dengan fasilitas lengkap dan harga terjangkau.
          </p>
        </div>

        <Suspense fallback={<KosListingSkeleton count={6} />}>
          <KosListingContent />
        </Suspense>

        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link href="/user-dashboard/kos">
              Lihat Semua Kos
              <span className="ml-2">→</span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
