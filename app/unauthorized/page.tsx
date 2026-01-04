import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroHeader } from "@/components/header";
import { ShieldX, Home, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <>
      <HeroHeader />
      <main className="container mx-auto px-4 py-24 pt-32">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-destructive/10 p-6">
              <ShieldX className="size-16 text-destructive" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Akses Ditolak</h1>
          <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
            Hanya Admin yang Diizinkan
          </h2>
          <p className="text-muted-foreground mb-8">
            Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. Hanya
            pengguna dengan role admin yang dapat mengakses dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/">
                <Home className="size-4 mr-2" />
                Kembali ke Beranda
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/listings">
                <ArrowLeft className="size-4 mr-2" />
                Lihat Daftar Kos
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}

