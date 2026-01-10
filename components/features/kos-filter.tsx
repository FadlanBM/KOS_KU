"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { X, Search, Filter, SlidersHorizontal } from "lucide-react";
import type { KosData } from "@/components/features/dashboard/kos-card";

interface KosFilterProps {
  kosList: KosData[];
  onFilteredChange?: (filtered: KosData[]) => void;
}

export function KosFilter({ kosList, onFilteredChange }: KosFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active filters from URL (applied filters)
  const [activeFilters, setActiveFilters] = useState({
    city: searchParams.get("city") || "",
    roomType: searchParams.get("roomType") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    search: searchParams.get("search") || "",
  });

  // Form values (temporary, not applied yet)
  const [formValues, setFormValues] = useState({
    city: searchParams.get("city") || "",
    roomType: searchParams.get("roomType") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    search: searchParams.get("search") || "",
  });

  // Update form values and active filters when URL params change (e.g., browser back/forward)
  useEffect(() => {
    const urlFilters = {
      city: searchParams.get("city") || "",
      roomType: searchParams.get("roomType") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      search: searchParams.get("search") || "",
    };
    setActiveFilters(urlFilters);
    setFormValues(urlFilters);
  }, [searchParams]);

  // Get unique cities and room types for filter options
  const uniqueCities = useMemo(() => {
    const cities = new Set(kosList.map((kos) => kos.city));
    return Array.from(cities).sort();
  }, [kosList]);

  const uniqueRoomTypes = useMemo(() => {
    const types = new Set(kosList.map((kos) => kos.roomType));
    return Array.from(types).sort();
  }, [kosList]);

  // Filter logic - menggunakan activeFilters (yang sudah diterapkan)
  const filteredKos = useMemo(() => {
    let filtered = [...kosList];

    // Search filter
    if (activeFilters.search) {
      const searchLower = activeFilters.search.toLowerCase();
      filtered = filtered.filter(
        (kos) =>
          kos.name.toLowerCase().includes(searchLower) ||
          kos.address.toLowerCase().includes(searchLower) ||
          kos.city.toLowerCase().includes(searchLower) ||
          kos.description.toLowerCase().includes(searchLower) ||
          kos.facilities.toLowerCase().includes(searchLower)
      );
    }

    // City filter
    if (activeFilters.city) {
      filtered = filtered.filter((kos) => kos.city === activeFilters.city);
    }

    // Room type filter
    if (activeFilters.roomType) {
      filtered = filtered.filter((kos) => kos.roomType === activeFilters.roomType);
    }

    // Price filter
    if (activeFilters.minPrice) {
      const minPrice = parseInt(activeFilters.minPrice);
      if (!isNaN(minPrice)) {
        filtered = filtered.filter((kos) => kos.price >= minPrice);
      }
    }

    if (activeFilters.maxPrice) {
      const maxPrice = parseInt(activeFilters.maxPrice);
      if (!isNaN(maxPrice)) {
        filtered = filtered.filter((kos) => kos.price <= maxPrice);
      }
    }

    return filtered;
  }, [kosList, activeFilters]);

  // Apply filters - update URL and active filters
  const applyFilters = () => {
    setActiveFilters(formValues);
    const params = new URLSearchParams();
    
    Object.entries(formValues).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    const queryString = params.toString();
    router.push(`/user-dashboard/kos${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  };

  // Handle form input changes (only update form values, not active filters)
  const handleFormChange = (key: keyof typeof formValues, value: string) => {
    setFormValues({ ...formValues, [key]: value });
  };

  // Clear all filters
  const clearFilters = () => {
    const emptyFilters = {
      city: "",
      roomType: "",
      minPrice: "",
      maxPrice: "",
      search: "",
    };
    setFormValues(emptyFilters);
    setActiveFilters(emptyFilters);
    router.push("/user-dashboard/kos", { scroll: false });
  };

  const hasActiveFilters =
    activeFilters.city ||
    activeFilters.roomType ||
    activeFilters.minPrice ||
    activeFilters.maxPrice ||
    activeFilters.search;

  // Check if form values differ from active filters
  const hasChanges = JSON.stringify(formValues) !== JSON.stringify(activeFilters);

  // Notify parent component of filtered results
  useEffect(() => {
    onFilteredChange?.(filteredKos);
  }, [filteredKos, onFilteredChange]);

  return (
    <div className="rounded-lg border bg-card p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="size-5" />
        <h3 className="text-lg font-semibold">Filter Pencarian</h3>
        <div className="ml-auto flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
            >
              <X className="size-4" />
              Reset
            </Button>
          )}
          <Button
            size="sm"
            onClick={applyFilters}
            disabled={!hasChanges}
            className={hasChanges ? "" : "opacity-50"}
          >
            <SlidersHorizontal className="size-4" />
            Terapkan Filter
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Search */}
        <div className="lg:col-span-2 space-y-2">
          <Label htmlFor="search">Cari Kos</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="Cari nama, alamat, atau deskripsi..."
              value={formValues.search}
              onChange={(e) => handleFormChange("search", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyFilters();
                }
              }}
              className="pl-9"
            />
          </div>
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">Kota</Label>
          <Select
            id="city"
            value={formValues.city}
            onChange={(e) => handleFormChange("city", e.target.value)}
          >
            <option value="">Semua Kota</option>
            {uniqueCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </Select>
        </div>

        {/* Room Type */}
        <div className="space-y-2">
          <Label htmlFor="roomType">Tipe Kamar</Label>
          <Select
            id="roomType"
            value={formValues.roomType}
            onChange={(e) => handleFormChange("roomType", e.target.value)}
          >
            <option value="">Semua Tipe</option>
            {uniqueRoomTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label htmlFor="minPrice">Harga Min (Rp)</Label>
          <Input
            id="minPrice"
            type="number"
            placeholder="Min"
            value={formValues.minPrice}
            onChange={(e) => handleFormChange("minPrice", e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                applyFilters();
              }
            }}
            min="0"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mt-4">
        <div className="lg:col-span-4"></div>
        <div className="space-y-2">
          <Label htmlFor="maxPrice">Harga Max (Rp)</Label>
          <Input
            id="maxPrice"
            type="number"
            placeholder="Max"
            value={formValues.maxPrice}
            onChange={(e) => handleFormChange("maxPrice", e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                applyFilters();
              }
            }}
            min="0"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Menampilkan {filteredKos.length} dari {kosList.length} kos
          </p>
        </div>
      )}
    </div>
  );
}

