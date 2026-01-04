"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KosCard, type KosData } from "./kos-card";
import { createClient } from "@/lib/supabase/client";
import { getUser } from "@/lib/supabase";

interface KosListProps {
  kosList: KosData[];
}

export function KosList({ kosList }: KosListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    router.push(`/kos/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    // Konfirmasi sebelum delete
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus kos ini? Tindakan ini tidak dapat dibatalkan."
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setError(null);

    try {
      // Get current user untuk validasi
      const user = await getUser();
      if (!user) {
        setError("Anda harus login untuk menghapus kos.");
        setDeletingId(null);
        router.push("/login");
        return;
      }

      // Create Supabase client
      const supabase = createClient();

      // Delete dari Supabase
      const { error: deleteError } = await supabase
        .from("kos")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id); // Pastikan hanya bisa delete kos milik sendiri

      if (deleteError) {
        console.error("Error deleting kos:", deleteError);
        setError(
          deleteError.message || "Gagal menghapus kos. Silakan coba lagi."
        );
        setDeletingId(null);
        return;
      }

      // Refresh halaman untuk menampilkan data terbaru
      router.refresh();
    } catch (err) {
      console.error("Unexpected error deleting kos:", err);
      setError("Terjadi kesalahan saat menghapus kos. Silakan coba lagi.");
      setDeletingId(null);
    }
  };

  if (kosList.length === 0) {
    return null;
  }

  return (
    <>
      {error && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-950 mb-6">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
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
    </>
  );
}

