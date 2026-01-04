"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export function LoginAlert() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get("login") === "success") {
      // Tampilkan toast
      toast.success("Login berhasil!", {
        description: "Selamat datang kembali di Web Kosku",
        duration: 4000,
      });

      // Bersihkan URL parameter tanpa refresh halaman
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("login");

      router.replace(`${pathname}?${newSearchParams.toString()}`, {
        scroll: false,
      });
    }
  }, [searchParams, router, pathname]);

  return null;
}
