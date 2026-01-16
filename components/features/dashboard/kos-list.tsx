"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KosCard, type KosData } from "./kos-card";
import { createClient } from "@/lib/supabase/client";
import { getUser } from "@/lib/supabase";
import { toast } from "sonner";

interface KosListProps {
  kosList: KosData[];
}

export function KosList({ kosList }: KosListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    router.push(`/kos/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);

    try {
      // Get current user untuk validasi
      const user = await getUser();
      if (!user) {
        toast.error("Anda harus login untuk menghapus kos.");
        setDeletingId(null);
        router.push("/login");
        return;
      }

      // Create Supabase client
      const supabase = createClient();

      // 1. Ambil daftar gambar kos untuk dihapus dari storage
      const { data: images } = await supabase
        .from("gambar_kos")
        .select("name_image, tipe_gambar(name)")
        .eq("kos_id", id);

      if (images && images.length > 0) {
        const filesToDelete = images
          .map((img: any) => {
            if (img.name_image && img.tipe_gambar?.name) {
              return `${img.tipe_gambar.name}/${img.name_image}`;
            }
            return null;
          })
          .filter((path): path is string => path !== null);

        if (filesToDelete.length > 0) {
          try {
            const { error: storageError } = await supabase.storage
              .from("profile_photos")
              .remove(filesToDelete);
            if (storageError) {
              console.error("Error removing files from bucket:", storageError);
            }
          } catch (err) {
            console.error("Unexpected error deleting from storage:", err);
          }
        }
      }

      // 2. Delete dari Supabase (kos)
      // Tabel gambar_kos akan terhapus otomatis karena ON DELETE CASCADE di database
      const { error: deleteError } = await supabase
        .from("kos")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id); // Pastikan hanya bisa delete kos milik sendiri

      if (deleteError) {
        console.error("Error deleting kos:", deleteError);
        toast.error(
          deleteError.message || "Gagal menghapus kos. Silakan coba lagi."
        );
        setDeletingId(null);
        return;
      }

      toast.success("Kos berhasil dihapus");
      // Refresh halaman untuk menampilkan data terbaru
      router.refresh();
    } catch (err) {
      console.error("Unexpected error deleting kos:", err);
      toast.error("Terjadi kesalahan saat menghapus kos. Silakan coba lagi.");
    } finally {
      setDeletingId(null);
    }
  };

  if (kosList.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {kosList.map((kos) => (
        <KosCard
          key={kos.id}
          kos={kos}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeleting={deletingId === kos.id}
        />
      ))}
    </div>
  );
}
