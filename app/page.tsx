import Features from "@/components/features-4";
import { HeroHeader } from "@/components/header";
import HeroSection from "@/components/hero-section";
import IntegrationsSection from "@/components/integrations-3";
import StatsSection from "@/components/stats";
import { KosSection } from "@/components/sections/kos-section";
import FooterSection from "@/components/footer";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/supabase/roles";
import { redirect } from "next/navigation";

/**
 * Home Page
 *
 * Halaman utama aplikasi Web Kosku.
 * Struktur:
 * - HeroHeader: Navigation bar di bagian atas
 * - HeroSection: Konten utama dengan hero content dan customer logos
 * - KosSection: Menampilkan daftar kos yang tersedia
 * - StatsSection: Statistik
 * - IntegrationsSection: Integrasi
 * - Features: Fitur-fitur aplikasi
 */
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const adminStatus = await isAdmin(user.id);
    if (adminStatus) {
      redirect("/dashboard");
    }
  }

  return (
    <>
      <HeroHeader />
      <HeroSection />
      <StatsSection />
      {/* <Features /> */}
      <KosSection />
      <FooterSection />
    </>
  );
}
