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
      name: kos.name,
      address: kos.address,
      city: kos.city,
      price: kos.price,
      roomType: kos.room_type, // room_type -> roomType
      facilities: kos.facilities || "",
      description: kos.description || "",
      availableRooms: kos.available_rooms, // available_rooms -> availableRooms
      totalRooms: kos.total_rooms, // total_rooms -> totalRooms
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
            Tambah Ruangan Kos
          </Button>
        </Link>
      </div>

      {kosList.length === 0 ? (
        <div className="rounded-lg border p-12 text-center">
          <p className="text-muted-foreground mb-4">
            Belum ada data kos. Tambahkan kos pertama Anda!
          </p>
          <Link href="/kos/add">
            <Button>Tambah Kos</Button>
          </Link>
        </div>
      ) : (
        <KosList kosList={kosList} />
      )}
    </div>
  );
}
