"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getUser } from "@/lib/supabase";

export default function AddKosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

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
        setLoading(false);
        return;
      }

      // Validasi angka
      const price = parseInt(formData.price);
      const totalRooms = parseInt(formData.totalRooms);
      const availableRooms = parseInt(formData.availableRooms);

      if (isNaN(price) || price < 0) {
        setError("Harga harus berupa angka yang valid dan tidak negatif.");
        setLoading(false);
        return;
      }

      if (isNaN(totalRooms) || totalRooms < 1) {
        setError("Total kamar harus lebih dari 0.");
        setLoading(false);
        return;
      }

      if (isNaN(availableRooms) || availableRooms < 0) {
        setError("Kamar tersedia tidak boleh negatif.");
        setLoading(false);
        return;
      }

      if (availableRooms > totalRooms) {
        setError("Kamar tersedia tidak boleh lebih dari total kamar.");
        setLoading(false);
        return;
      }

      // Validasi nomor telepon (minimal 10 digit, angka saja/plus di depan)
      const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
      if (!phoneRegex.test(formData.nomorPemilik.replace(/\s/g, ""))) {
        setError("Nomor pemilik tidak valid (minimal 10-13 digit).");
        setLoading(false);
        return;
      }

      // Get current user
      const user = await getUser();
      if (!user) {
        setError("Anda harus login untuk menambahkan kos.");
        setLoading(false);
        router.push("/login");
        return;
      }

      // Create Supabase client
      const supabase = createClient();

      // Prepare data untuk insert (mapping field form ke database)
      const insertData = {
        user_id: user.id,
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

      // Insert ke Supabase
      const { error: insertError } = await supabase
        .from("kos")
        .insert([insertData])
        .select()
        .single();

      if (insertError) {
        console.error("Error inserting kos:", insertError);
        setError(
          insertError.message ||
            "Terjadi kesalahan saat menyimpan data. Silakan coba lagi."
        );
        setLoading(false);
        return;
      }

      // Redirect ke halaman kos setelah berhasil
      router.push("/kos");
      router.refresh();
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Terjadi kesalahan saat menyimpan data. Silakan coba lagi.");
      setLoading(false);
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
            Tambah Ruangan Kos
          </h1>
          <p className="text-muted-foreground">
            Tambahkan informasi ruangan kos baru
          </p>
        </div>
      </div>

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

        {error && (
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-950">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-4">
          <Link href="/kos">
            <Button type="button" variant="outline">
              Batal
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
