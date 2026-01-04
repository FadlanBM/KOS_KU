"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { redirect, useRouter } from "next/navigation";
import { User } from "@supabase/auth-js";

interface LikeButtonProps {
  kosId: string;
  initialIsLiked: boolean;
  user: User | null;
}

export function LikeButton({ kosId, initialIsLiked, user }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsLiked(initialIsLiked);
  }, [initialIsLiked]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); // Mencegah navigasi card

    if (isLoading) return;

    if (!user) {
      redirect("/login");
    }

    // Optimistic update
    const previousState = isLiked;
    setIsLiked(!isLiked);
    setIsLoading(true);

    try {
      const response = await fetch("/api/kos/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ kosId }),
      });

      if (!response.ok) {
        throw new Error("Failed to like");
      }

      const data = await response.json();

      // Sync dengan return value jika perlu, atau biarkan optimistic
      // setIsLiked(data.liked);
      router.refresh(); // Refresh untuk update stats jika ada
    } catch (error) {
      // Revert jika gagal
      setIsLiked(previousState);
      toast.error("Gagal mengubah status like");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-4 right-4 z-10 rounded-full bg-white/80 hover:bg-white shadow-sm backdrop-blur-sm dark:bg-black/50 dark:hover:bg-black/70"
      onClick={handleLike}
      disabled={isLoading}
    >
      <Heart
        className={cn(
          "size-5 transition-colors",
          isLiked
            ? "fill-red-500 text-red-500"
            : "text-gray-600 dark:text-gray-200"
        )}
      />
    </Button>
  );
}
