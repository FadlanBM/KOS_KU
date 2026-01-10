"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function StatsSection() {
  const [counts, setCounts] = useState({
    kos: 0,
    rented: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      const supabase = createClient();

      try {
        // Count total kos
        const { count: kosCount, error: kosError } = await supabase
          .from("kos")
          .select("*", { count: "exact", head: true });

        // Count rented (this depends on your table structure, assuming 'is_available' column or a separate 'bookings' table)
        // For now, let's count where is_available is false if that exists, or just use a dummy for now
        // Let's also count users from profiles table if you have one
        const { count: usersCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        setCounts({
          kos: kosCount || 0,
          rented: Math.floor((kosCount || 0) * 0.8), // Example logic
          users: usersCount || 0,
        });
      } catch (error) {
        console.error("Error fetching counts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();
  }, []);

  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
        <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center">
          <h2 className="text-4xl font-medium lg:text-5xl">
            Total Kos yang ada di web kami
          </h2>
          <p>
            Kami terus memperbarui daftar kos yang tersedia untuk memastikan
            Anda mendapatkan informasi yang akurat dan terkini dalam mencari
            tempat tinggal yang nyaman.
          </p>
        </div>

        <div className="grid gap-12 divide-y *:text-center md:grid-cols-3 md:gap-2 md:divide-x md:divide-y-0">
          <div className="space-y-4">
            <div className="text-5xl font-bold">
              {loading ? "..." : `+${counts.kos}`}
            </div>
            <p>Kos Tersedia</p>
          </div>
          <div className="space-y-4">
            <div className="text-5xl font-bold">
              {loading ? "..." : counts.rented}
            </div>
            <p>Total Kos yang Disewa</p>
          </div>
          <div className="space-y-4">
            <div className="text-5xl font-bold">
              {loading ? "..." : `+${counts.users}`}
            </div>
            <p>User yang Terdaftar</p>
          </div>
        </div>
      </div>
    </section>
  );
}
