"use client";

import { useState } from "react";
import { KosListing } from "./kos-listing";
import { KosFilter } from "./kos-filter";
import type { KosData } from "./dashboard/kos-card";
import { User } from "@supabase/auth-js";

interface FilteredKosListProps {
  initialKosList: KosData[];
  likedKosIds?: Set<string>;
  user: User | null;
}

export function FilteredKosList({
  initialKosList,
  likedKosIds,
  user,
}: FilteredKosListProps) {
  const [filteredKos, setFilteredKos] = useState<KosData[]>(initialKosList);

  return (
    <>
      <KosFilter kosList={initialKosList} onFilteredChange={setFilteredKos} />
      {filteredKos.length === 0 ? (
        <div className="rounded-lg border p-12 text-center">
          <p className="text-muted-foreground mb-4">
            Tidak ada kos yang sesuai dengan filter Anda.
          </p>
        </div>
      ) : (
        <KosListing
          kosList={filteredKos}
          likedKosIds={likedKosIds}
          user={user}
        />
      )}
    </>
  );
}
