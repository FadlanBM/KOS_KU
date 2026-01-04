import Features from "@/components/features-4";
import { HeroHeader } from "@/components/header";
import HeroSection from "@/components/hero-section";
import IntegrationsSection from "@/components/integrations-3";
import StatsSection from "@/components/stats";
import { KosSection } from "@/components/sections/kos-section";
import FooterSection from "@/components/footer";

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
export default function Home() {
  return (
    <>
      <HeroHeader />
      <HeroSection />
      <StatsSection />
      <IntegrationsSection />
      <Features />
      <KosSection />
      <FooterSection />
    </>
  );
}
