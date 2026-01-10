import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroHeader } from "@/components/header";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <HeroHeader />
      <main className="container mx-auto px-4 py-24 pt-32">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Kos Tidak Ditemukan</h2>
          <p className="text-muted-foreground mb-8">
            Maaf, kos yang Anda cari tidak ditemukan atau mungkin sudah tidak
            tersedia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/user-dashboard/kos">
                <ArrowLeft className="size-4 mr-2" />
                Kembali ke Daftar Kos
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="size-4 mr-2" />
                Kembali ke Beranda
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
