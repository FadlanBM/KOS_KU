"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getUser } from "@/lib/supabase";

export default function EditKosPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    price: "",
    roomType: "",
    facilities: "",
    description: "",
    availableRooms: "",
    totalRooms: "",
    nomorPemilik: "",
  });

  // Fetch data kos saat component mount
  useEffect(() => {
    const fetchKosData = async () => {
      try {
        const user = await getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const supabase = createClient();
        const { data: kosData, error: fetchError } = await supabase
          .from("kos")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id) // Pastikan hanya bisa edit kos milik sendiri
          .single();

        if (fetchError) {
          console.error("Error fetching kos:", fetchError);
          setError(
            "Gagal memuat data kos. Kos tidak ditemukan atau Anda tidak memiliki akses."
          );
          setLoading(false);
          return;
        }

        if (!kosData) {
          setError("Kos tidak ditemukan.");
          setLoading(false);
          return;
        }

        // Map data dari database ke form (snake_case ke camelCase)
        setFormData({
          name: kosData.name || "",
          address: kosData.address || "",
          city: kosData.city || "",
          price: kosData.price?.toString() || "",
          roomType: kosData.room_type || "",
          facilities: kosData.facilities || "",
          description: kosData.description || "",
          availableRooms: kosData.available_rooms?.toString() || "",
          totalRooms: kosData.total_rooms?.toString() || "",
          nomorPemilik: kosData.nomor_pemilik || "",
        });

        setLoading(false);
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Terjadi kesalahan saat memuat data.");
        setLoading(false);
      }
    };

    if (id) {
      fetchKosData();
    }
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      // Validasi data
      if (
        !formData.name ||
        !formData.address ||
        !formData.city ||
        !formData.price ||
        !formData.roomType ||
        !formData.totalRooms ||
        !formData.nomorPemilik ||
        formData.availableRooms === ""
      ) {
        setError("Mohon lengkapi semua field yang wajib diisi.");
        setSaving(false);
        return;
      }

      // Validasi angka
      const price = parseInt(formData.price);
      const totalRooms = parseInt(formData.totalRooms);
      const availableRooms = parseInt(formData.availableRooms);

      if (isNaN(price) || price < 0) {
        setError("Harga harus berupa angka yang valid dan tidak negatif.");
        setSaving(false);
        return;
      }

      if (isNaN(totalRooms) || totalRooms < 1) {
        setError("Total kamar harus lebih dari 0.");
        setSaving(false);
        return;
      }

      if (isNaN(availableRooms) || availableRooms < 0) {
        setError("Kamar tersedia tidak boleh negatif.");
        setSaving(false);
        return;
      }

      if (availableRooms > totalRooms) {
        setError("Kamar tersedia tidak boleh lebih dari total kamar.");
        setSaving(false);
        return;
      }

      // Validasi nomor telepon (minimal 10 digit, angka saja/plus di depan)
      const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
      if (!phoneRegex.test(formData.nomorPemilik.replace(/\s/g, ""))) {
        setError("Nomor pemilik tidak valid (minimal 10-13 digit).");
        setSaving(false);
        return;
      }

      // Get current user
      const user = await getUser();
      if (!user) {
        setError("Anda harus login untuk mengedit kos.");
        setSaving(false);
        router.push("/login");
        return;
      }

      // Create Supabase client
      const supabase = createClient();

      // Prepare data untuk update (mapping field form ke database)
      const updateData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        price: price,
        room_type: formData.roomType.trim(),
        facilities: formData.facilities.trim() || null,
        description: formData.description.trim() || null,
        available_rooms: availableRooms,
        total_rooms: totalRooms,
        nomor_pemilik: formData.nomorPemilik.trim(),
      };

      // Update ke Supabase
      const { error: updateError } = await supabase
        .from("kos")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id); // Pastikan hanya bisa update kos milik sendiri

      if (updateError) {
        console.error("Error updating kos:", updateError);
        setError(
          updateError.message ||
            "Terjadi kesalahan saat menyimpan perubahan. Silakan coba lagi."
        );
        setSaving(false);
        return;
      }

      // Redirect ke halaman kos setelah berhasil
      router.push("/kos");
      router.refresh();
    } catch (err) {
      console.error("Unexpected error:", err);
      setError(
        "Terjadi kesalahan saat menyimpan perubahan. Silakan coba lagi."
      );
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="size-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Memuat data kos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/kos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit Ruangan Kos
          </h1>
          <p className="text-muted-foreground">Ubah informasi ruangan kos</p>
        </div>
      </div>

      {error && !loading && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-950">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Informasi Dasar</h2>
            <p className="text-sm text-muted-foreground">
              Masukkan informasi dasar tentang kos
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Kos *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Contoh: Kos Nyaman Sejahtera"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomorPemilik">Nomor WhatsApp Pemilik *</Label>
              <Input
                id="nomorPemilik"
                name="nomorPemilik"
                type="tel"
                required
                value={formData.nomorPemilik}
                onChange={handleChange}
                placeholder="Contoh: 081234567890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomType">Tipe Kamar *</Label>
              <Input
                id="roomType"
                name="roomType"
                type="text"
                required
                value={formData.roomType}
                onChange={handleChange}
                placeholder="Contoh: Kamar Mandi Dalam, Kamar Mandi Luar"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Harga per Bulan (Rp) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                required
                value={formData.price}
                onChange={handleChange}
                placeholder="Contoh: 500000"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalRooms">Total Kamar *</Label>
              <Input
                id="totalRooms"
                name="totalRooms"
                type="number"
                required
                value={formData.totalRooms}
                onChange={handleChange}
                placeholder="Contoh: 10"
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availableRooms">Kamar Tersedia *</Label>
              <Input
                id="availableRooms"
                name="availableRooms"
                type="number"
                required
                value={formData.availableRooms}
                onChange={handleChange}
                placeholder="Contoh: 5"
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Lokasi</h2>
            <p className="text-sm text-muted-foreground">
              Informasi lokasi kos
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Alamat Lengkap *</Label>
            <Textarea
              id="address"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="Masukkan alamat lengkap kos"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Kota/Kabupaten *</Label>
            <Input
              id="city"
              name="city"
              type="text"
              required
              value={formData.city}
              onChange={handleChange}
              placeholder="Contoh: Jakarta Selatan"
            />
          </div>
        </div>

        <div className="rounded-lg border p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Fasilitas & Deskripsi</h2>
            <p className="text-sm text-muted-foreground">
              Informasi fasilitas dan deskripsi kos
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facilities">Fasilitas</Label>
            <Textarea
              id="facilities"
              name="facilities"
              value={formData.facilities}
              onChange={handleChange}
              placeholder="Contoh: WiFi, AC, Kasur, Lemari, Meja, Kursi"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Pisahkan setiap fasilitas dengan koma
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Masukkan deskripsi lengkap tentang kos"
              rows={5}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link href="/kos">
            <Button type="button" variant="outline" disabled={saving}>
              Batal
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
