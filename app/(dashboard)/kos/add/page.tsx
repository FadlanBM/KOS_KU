"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getUser } from "@/lib/supabase";
import { useEffect } from "react";

interface ImageType {
  id: string;
  name: string;
}

interface SelectedImage {
  file: File;
  themeId: string;
  themeName: string;
  previewUrl: string;
}

const kosSchema = z
  .object({
    name: z.string().min(1, "Nama kos harus diisi."),
    address: z.string().min(1, "Alamat harus diisi."),
    location: z.string().min(1, "Lokasi harus diisi."),
    description: z.string().min(1, "Deskripsi harus diisi."),
    genderType: z.enum(["male", "female", "mixed"], {
      message: "Tipe kos harus diisi (male/female/mixed).",
    }),
    availableRooms: z
      .string()
      .min(1, "Kamar tersedia harus diisi.")
      .transform((val) => Number(val))
      .refine((val) => Number.isInteger(val) && val >= 0, {
        message: "Kamar tersedia tidak boleh negatif.",
      }),
    totalRooms: z
      .string()
      .min(1, "Total kamar harus diisi.")
      .transform((val) => Number(val))
      .refine((val) => Number.isInteger(val) && val > 0, {
        message: "Total kamar harus lebih dari 0.",
      }),
    monthlyPrice: z
      .string()
      .min(1, "Harga per bulan harus diisi.")
      .transform((val) => Number(val))
      .refine((val) => !Number.isNaN(val) && val > 0, {
        message:
          "Harga per bulan harus berupa angka yang valid dan lebih dari 0.",
      }),
    yearlyPrice: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!Number.isNaN(Number(val)) && Number(val) > 0),
        {
          message:
            "Harga per tahun harus berupa angka yang valid dan lebih dari 0.",
        }
      ),
    depositPrice: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!Number.isNaN(Number(val)) && Number(val) >= 0),
        {
          message: "Deposit harus berupa angka yang valid dan tidak negatif.",
        }
      ),
    adminFee: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!Number.isNaN(Number(val)) && Number(val) >= 0),
        {
          message:
            "Biaya admin harus berupa angka yang valid dan tidak negatif.",
        }
      ),
    electricityType: z
      .string()
      .optional()
      .refine(
        (val) =>
          !val || ["included", "token", "postpaid"].includes(val as string),
        {
          message: "Tipe listrik harus included / token / postpaid.",
        }
      ),
    waterType: z
      .string()
      .optional()
      .refine((val) => !val || ["included", "meter"].includes(val as string), {
        message: "Tipe air harus included / meter.",
      }),
    minStayDuration: z
      .string()
      .optional()
      .refine(
        (val) => !val || (Number.isInteger(Number(val)) && Number(val) >= 1),
        {
          message: "Minimum lama sewa harus angka dan minimal 1 bulan.",
        }
      ),
    roomSize: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!Number.isNaN(Number(val)) && Number(val) > 0),
        {
          message:
            "Ukuran kamar harus berupa angka yang valid dan lebih dari 0.",
        }
      ),
    certificateType: z.string().optional(),
    yearBuilt: z
      .string()
      .optional()
      .refine(
        (val) => !val || (Number.isInteger(Number(val)) && Number(val) > 0),
        {
          message: "Tahun dibangun harus berupa angka tahun yang valid.",
        }
      ),
    buildingFloors: z
      .string()
      .optional()
      .refine(
        (val) => !val || (Number.isInteger(Number(val)) && Number(val) > 0),
        {
          message: "Jumlah lantai harus berupa angka dan lebih dari 0.",
        }
      ),
    propertyStatus: z.enum(["active", "inactive", "maintenance", "full"], {
      message: "Status properti tidak valid.",
    }),
    isFeatured: z.boolean().optional(),
    viewCount: z
      .string()
      .optional()
      .refine(
        (val) => !val || (Number.isInteger(Number(val)) && Number(val) >= 0),
        {
          message: "View count harus berupa angka dan tidak negatif.",
        }
      ),
    ratingAverage: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!Number.isNaN(Number(val)) && Number(val) >= 0),
        {
          message: "Rating harus berupa angka yang valid.",
        }
      ),
    totalReviews: z
      .string()
      .optional()
      .refine(
        (val) => !val || (Number.isInteger(Number(val)) && Number(val) >= 0),
        {
          message: "Total review harus berupa angka dan tidak negatif.",
        }
      ),
    nearestCampus: z.string().optional(),
    distanceToCampus: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!Number.isNaN(Number(val)) && Number(val) >= 0),
        {
          message:
            "Jarak ke kampus harus berupa angka yang valid dan tidak negatif.",
        }
      ),
    facilities: z
      .array(z.string().min(1))
      .min(1, "Minimal satu fasilitas harus diisi."),
    roomFacilities: z
      .array(z.string().min(1))
      .min(1, "Minimal satu fasilitas kamar harus diisi."),
    bathroomFacilities: z
      .array(z.string().min(1))
      .min(1, "Minimal satu fasilitas kamar mandi harus diisi."),
    parkingFacilities: z
      .array(z.string().min(1))
      .min(1, "Minimal satu fasilitas parkir harus diisi."),
    regulations: z
      .array(z.string().min(1))
      .min(1, "Minimal satu peraturan kos harus diisi."),
  })
  .superRefine((val, ctx) => {
    if (val.availableRooms > val.totalRooms) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["availableRooms"],
        message: "Kamar tersedia tidak boleh lebih dari total kamar.",
      });
    }
  });

export default function AddKosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facilityInput, setFacilityInput] = useState("");
  const [facilityList, setFacilityList] = useState<string[]>([]);
  const [roomFacilityInput, setRoomFacilityInput] = useState("");
  const [roomFacilityList, setRoomFacilityList] = useState<string[]>([]);
  const [bathroomFacilityInput, setBathroomFacilityInput] = useState("");
  const [bathroomFacilityList, setBathroomFacilityList] = useState<string[]>(
    []
  );
  const [parkingFacilityInput, setParkingFacilityInput] = useState("");
  const [parkingFacilityList, setParkingFacilityList] = useState<string[]>([]);
  const [regulationInput, setRegulationInput] = useState("");
  const [regulationList, setRegulationList] = useState<string[]>([]);

  // State untuk Gambar
  const [imageTypes, setImageTypes] = useState<ImageType[]>([]);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [currentThemeId, setCurrentThemeId] = useState("");

  useEffect(() => {
    const fetchImageTypes = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tipe_gambar")
        .select("id, name")
        .order("name");

      if (!error && data) {
        setImageTypes(data);
        if (data.length > 0) setCurrentThemeId(data[0].id);
      }
    };

    fetchImageTypes();
  }, []);

  const [formData, setFormData] = useState({
    userId: "",
    name: "",
    address: "",
    location: "",
    description: "",
    genderType: "mixed",
    availableRooms: "",
    totalRooms: "",
    monthlyPrice: "",
    yearlyPrice: "",
    depositPrice: "",
    adminFee: "",
    electricityType: "",
    waterType: "",
    minStayDuration: "",
    roomSize: "",
    certificateType: "",
    yearBuilt: "",
    buildingFloors: "",
    propertyStatus: "active",
    isFeatured: false,
    viewCount: "",
    ratingAverage: "",
    totalReviews: "",
    nearestCampus: "",
    distanceToCampus: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const parsed = kosSchema.safeParse({
        ...formData,
        facilities: facilityList,
        roomFacilities: roomFacilityList,
        bathroomFacilities: bathroomFacilityList,
        parkingFacilities: parkingFacilityList,
        regulations: regulationList,
      });
      if (!parsed.success) {
        const firstError = parsed.error.issues[0]?.message;
        setError(
          firstError ||
            "Data tidak valid. Mohon periksa kembali input yang Anda masukkan."
        );
        setLoading(false);
        return;
      }

      const data = parsed.data;

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

      const insertData = {
        user_id: user.id,
        name: data.name.trim(),
        address: data.address.trim(),
        location: data.location.trim(),
        description: data.description.trim(),
        gender_type: data.genderType,
        available_rooms: data.availableRooms,
        total_rooms: data.totalRooms,
        monthly_price: data.monthlyPrice,
        yearly_price: data.yearlyPrice ? Number(data.yearlyPrice) : null,
        deposit_price: data.depositPrice ? Number(data.depositPrice) : null,
        admin_fee: data.adminFee ? Number(data.adminFee) : null,
        electricity_type: data.electricityType || null,
        water_type: data.waterType || null,
        min_stay_duration: data.minStayDuration
          ? Number(data.minStayDuration)
          : 1,
        room_size: data.roomSize ? Number(data.roomSize) : null,
        certificate_type: data.certificateType || null,
        year_built: data.yearBuilt ? Number(data.yearBuilt) : null,
        building_floors: data.buildingFloors
          ? Number(data.buildingFloors)
          : null,
        property_status: data.propertyStatus,
        is_featured: data.isFeatured ?? false,
        view_count: data.viewCount ? Number(data.viewCount) : undefined,
        rating_average: data.ratingAverage
          ? Number(data.ratingAverage)
          : undefined,
        total_reviews: data.totalReviews
          ? Number(data.totalReviews)
          : undefined,
        nearest_campus: data.nearestCampus || null,
        distance_to_campus: data.distanceToCampus
          ? Number(data.distanceToCampus)
          : null,
        fasilitas_kos: facilityList.join("|"),
        fasilitas_kamar: roomFacilityList.join("|"),
        fasilitas_kamar_mandi: bathroomFacilityList.join("|"),
        fasilitas_parkir: parkingFacilityList.join("|"),
        peraturan_kos: regulationList.join("|"),
      };

      const { data: insertDataResult, error: insertError } = await supabase
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

      const kosId = insertDataResult.id;

      // Handle Upload Gambar ke Storage dan Insert ke gambar_kos
      if (selectedImages.length > 0) {
        for (const img of selectedImages) {
          const fileExt = img.file.name.split(".").pop();
          const fileName = `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2)}.${fileExt}`;
          const filePath = `${img.themeName}/${fileName}`;

          // 1. Upload ke Supabase Storage (bucket: profile_photos)
          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from("profile_photos")
              .upload(filePath, img.file);

          if (uploadError) {
            console.error(
              `Error uploading image ${img.file.name}:`,
              uploadError
            );
            continue;
          }

          // 2. Dapatkan URL Publik
          const { data: publicUrlData } = supabase.storage
            .from("profile_photos")
            .getPublicUrl(filePath);

          // 3. Insert ke tabel gambar_kos
          const { error: imgDbError } = await supabase
            .from("gambar_kos")
            .insert([
              {
                kos_id: kosId,
                name_image: fileName,
                url_gambar: publicUrlData.publicUrl,
                tipe_gambar_id: img.themeId,
              },
            ]);

          if (imgDbError) {
            console.error(
              `Error inserting image record for ${img.file.name}:`,
              imgDbError
            );
          }
        }
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

  const handleAddFacility = () => {
    const value = facilityInput.trim();
    if (!value) return;
    if (facilityList.includes(value)) return;
    setFacilityList((prev) => [...prev, value]);
    setFacilityInput("");
  };

  const handleRemoveFacility = (name: string) => {
    setFacilityList((prev) => prev.filter((item) => item !== name));
  };

  const handleAddRoomFacility = () => {
    const value = roomFacilityInput.trim();
    if (!value) return;
    if (roomFacilityList.includes(value)) return;
    setRoomFacilityList((prev) => [...prev, value]);
    setRoomFacilityInput("");
  };

  const handleRemoveRoomFacility = (name: string) => {
    setRoomFacilityList((prev) => prev.filter((item) => item !== name));
  };

  const handleAddBathroomFacility = () => {
    const value = bathroomFacilityInput.trim();
    if (!value) return;
    if (bathroomFacilityList.includes(value)) return;
    setBathroomFacilityList((prev) => [...prev, value]);
    setBathroomFacilityInput("");
  };

  const handleRemoveBathroomFacility = (name: string) => {
    setBathroomFacilityList((prev) => prev.filter((item) => item !== name));
  };

  const handleAddParkingFacility = () => {
    const value = parkingFacilityInput.trim();
    if (!value) return;
    if (parkingFacilityList.includes(value)) return;
    setParkingFacilityList((prev) => [...prev, value]);
    setParkingFacilityInput("");
  };

  const handleRemoveParkingFacility = (name: string) => {
    setParkingFacilityList((prev) => prev.filter((item) => item !== name));
  };

  const handleAddRegulation = () => {
    const value = regulationInput.trim();
    if (!value) return;
    if (regulationList.includes(value)) return;
    setRegulationList((prev) => [...prev, value]);
    setRegulationInput("");
  };

  const handleRemoveRegulation = (name: string) => {
    setRegulationList((prev) => prev.filter((item) => item !== name));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const theme = imageTypes.find((t) => t.id === currentThemeId);

      if (!theme) return;

      const newImages: SelectedImage[] = files.map((file) => ({
        file,
        themeId: theme.id,
        themeName: theme.name,
        previewUrl: URL.createObjectURL(file),
      }));

      setSelectedImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].previewUrl);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/kos">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Jual Properti Kos</h1>
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
              <Label htmlFor="genderType">
                Tipe Kos (Pria/Wanita/Campur) *
              </Label>
              <Input
                id="genderType"
                name="genderType"
                type="text"
                required
                value={formData.genderType}
                onChange={handleChange}
                placeholder="male / female / mixed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyPrice">Harga per Bulan (Rp) *</Label>
              <Input
                id="monthlyPrice"
                name="monthlyPrice"
                type="number"
                required
                value={formData.monthlyPrice}
                onChange={handleChange}
                placeholder="Contoh: 500000"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearlyPrice">Harga per Tahun (Rp)</Label>
              <Input
                id="yearlyPrice"
                name="yearlyPrice"
                type="number"
                value={formData.yearlyPrice}
                onChange={handleChange}
                placeholder="Contoh: 6000000"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="depositPrice">Deposit (Rp)</Label>
              <Input
                id="depositPrice"
                name="depositPrice"
                type="number"
                value={formData.depositPrice}
                onChange={handleChange}
                placeholder="Contoh: 1000000"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminFee">Biaya Admin (Rp)</Label>
              <Input
                id="adminFee"
                name="adminFee"
                type="number"
                value={formData.adminFee}
                onChange={handleChange}
                placeholder="Contoh: 50000"
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

            <div className="space-y-2">
              <Label htmlFor="minStayDuration">Minimal Lama Sewa (bulan)</Label>
              <Input
                id="minStayDuration"
                name="minStayDuration"
                type="number"
                value={formData.minStayDuration}
                onChange={handleChange}
                placeholder="Contoh: 1"
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomSize">Ukuran Kamar (m²)</Label>
              <Input
                id="roomSize"
                name="roomSize"
                type="number"
                value={formData.roomSize}
                onChange={handleChange}
                placeholder="Contoh: 3.5"
                min="0"
                step="0.1"
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

          <div className="space-y-4">
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
              <Label htmlFor="location">Detail Lokasi *</Label>
              <Textarea
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="Contoh: Dekat kampus X, gang Y, patokan Z"
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nearestCampus">Kampus Terdekat</Label>
                <Input
                  id="nearestCampus"
                  name="nearestCampus"
                  type="text"
                  value={formData.nearestCampus}
                  onChange={handleChange}
                  placeholder="Contoh: Universitas Indonesia"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="distanceToCampus">Jarak ke Kampus (km)</Label>
                <Input
                  id="distanceToCampus"
                  name="distanceToCampus"
                  type="number"
                  value={formData.distanceToCampus}
                  onChange={handleChange}
                  placeholder="Contoh: 1.5"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
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
            <Label htmlFor="facilityInput">Fasilitas Kos</Label>
            <div className="flex gap-2">
              <Input
                id="facilityInput"
                name="facilityInput"
                type="text"
                value={facilityInput}
                onChange={(e) => setFacilityInput(e.target.value)}
                placeholder="Contoh: WiFi, AC, Parkir Luas"
              />
              <Button type="button" onClick={handleAddFacility}>
                Tambah
              </Button>
            </div>
            {facilityList.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {facilityList.map((facility) => (
                  <span
                    key={facility}
                    className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm"
                  >
                    {facility}
                    <button
                      type="button"
                      onClick={() => handleRemoveFacility(facility)}
                      className="text-xs text-muted-foreground hover:text-red-500"
                    >
                      Hapus
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomFacilityInput">Fasilitas Kamar</Label>
            <div className="flex gap-2">
              <Input
                id="roomFacilityInput"
                name="roomFacilityInput"
                type="text"
                value={roomFacilityInput}
                onChange={(e) => setRoomFacilityInput(e.target.value)}
                placeholder="Contoh: Kamar Mandi Dalam, Kasur, Lemari"
              />
              <Button type="button" onClick={handleAddRoomFacility}>
                Tambah
              </Button>
            </div>
            {roomFacilityList.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {roomFacilityList.map((facility) => (
                  <span
                    key={facility}
                    className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm"
                  >
                    {facility}
                    <button
                      type="button"
                      onClick={() => handleRemoveRoomFacility(facility)}
                      className="text-xs text-muted-foreground hover:text-red-500"
                    >
                      Hapus
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Fasilitas kamar akan disimpan ke tabel fasilitas_kamar (id, name,
              created_at, updated_at).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bathroomFacilityInput">Fasilitas Kamar Mandi</Label>
            <div className="flex gap-2">
              <Input
                id="bathroomFacilityInput"
                name="bathroomFacilityInput"
                type="text"
                value={bathroomFacilityInput}
                onChange={(e) => setBathroomFacilityInput(e.target.value)}
                placeholder="Contoh: Shower, Kloset Duduk, Water Heater"
              />
              <Button type="button" onClick={handleAddBathroomFacility}>
                Tambah
              </Button>
            </div>
            {bathroomFacilityList.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {bathroomFacilityList.map((facility) => (
                  <span
                    key={facility}
                    className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm"
                  >
                    {facility}
                    <button
                      type="button"
                      onClick={() => handleRemoveBathroomFacility(facility)}
                      className="text-xs text-muted-foreground hover:text-red-500"
                    >
                      Hapus
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Fasilitas kamar mandi akan disimpan ke tabel fasilitas_kamar_mandi
              (id, name, created_at, updated_at).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parkingFacilityInput">Fasilitas Parkir</Label>
            <div className="flex gap-2">
              <Input
                id="parkingFacilityInput"
                name="parkingFacilityInput"
                type="text"
                value={parkingFacilityInput}
                onChange={(e) => setParkingFacilityInput(e.target.value)}
                placeholder="Contoh: Parkir Mobil, Parkir Motor, Parkir Sepeda"
              />
              <Button type="button" onClick={handleAddParkingFacility}>
                Tambah
              </Button>
            </div>
            {parkingFacilityList.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {parkingFacilityList.map((facility) => (
                  <span
                    key={facility}
                    className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm"
                  >
                    {facility}
                    <button
                      type="button"
                      onClick={() => handleRemoveParkingFacility(facility)}
                      className="text-xs text-muted-foreground hover:text-red-500"
                    >
                      Hapus
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Fasilitas parkir akan disimpan ke tabel fasilitas_parking (id,
              name, created_at, updated_at).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="regulationInput">Peraturan Kos</Label>
            <div className="flex gap-2">
              <Input
                id="regulationInput"
                name="regulationInput"
                type="text"
                value={regulationInput}
                onChange={(e) => setRegulationInput(e.target.value)}
                placeholder="Contoh: Tidak boleh bawa lawan jenis ke kamar, Jam malam 22.00"
              />
              <Button type="button" onClick={handleAddRegulation}>
                Tambah
              </Button>
            </div>
            {regulationList.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {regulationList.map((regulation) => (
                  <span
                    key={regulation}
                    className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm"
                  >
                    {regulation}
                    <button
                      type="button"
                      onClick={() => handleRemoveRegulation(regulation)}
                      className="text-xs text-muted-foreground hover:text-red-500"
                    >
                      Hapus
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Peraturan akan disimpan ke tabel kos_regulation (id, name,
              created_at, updated_at).
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

        <div className="rounded-lg border p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Utilitas & Properti</h2>
            <p className="text-sm text-muted-foreground">
              Informasi listrik, air, dan detail bangunan
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="electricityType">Tipe Listrik</Label>
              <Input
                id="electricityType"
                name="electricityType"
                type="text"
                value={formData.electricityType}
                onChange={handleChange}
                placeholder="included / token / postpaid"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waterType">Tipe Air</Label>
              <Input
                id="waterType"
                name="waterType"
                type="text"
                value={formData.waterType}
                onChange={handleChange}
                placeholder="included / meter"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificateType">Tipe Sertifikat</Label>
              <Input
                id="certificateType"
                name="certificateType"
                type="text"
                value={formData.certificateType}
                onChange={handleChange}
                placeholder="Contoh: SHM, HGB"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearBuilt">Tahun Dibangun</Label>
              <Input
                id="yearBuilt"
                name="yearBuilt"
                type="number"
                value={formData.yearBuilt}
                onChange={handleChange}
                placeholder="Contoh: 2015"
                min="1900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buildingFloors">Jumlah Lantai</Label>
              <Input
                id="buildingFloors"
                name="buildingFloors"
                type="number"
                value={formData.buildingFloors}
                onChange={handleChange}
                placeholder="Contoh: 2"
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyStatus">Status Properti</Label>
              <Input
                id="propertyStatus"
                name="propertyStatus"
                type="text"
                value={formData.propertyStatus}
                onChange={handleChange}
                placeholder="active / inactive / maintenance / full"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="isFeatured"
                name="isFeatured"
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isFeatured: e.target.checked,
                  }))
                }
                className="h-4 w-4"
              />
              <Label htmlFor="isFeatured">Jadikan kos unggulan</Label>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Statistik Awal (Opsional)</h2>
            <p className="text-sm text-muted-foreground">
              Biarkan kosong jika tidak ingin mengatur statistik secara manual
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="viewCount">Jumlah Dilihat</Label>
              <Input
                id="viewCount"
                name="viewCount"
                type="number"
                value={formData.viewCount}
                onChange={handleChange}
                placeholder="Contoh: 0"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ratingAverage">Rating Rata-rata</Label>
              <Input
                id="ratingAverage"
                name="ratingAverage"
                type="number"
                value={formData.ratingAverage}
                onChange={handleChange}
                placeholder="Contoh: 0"
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalReviews">Total Review</Label>
              <Input
                id="totalReviews"
                name="totalReviews"
                type="number"
                value={formData.totalReviews}
                onChange={handleChange}
                placeholder="Contoh: 0"
                min="0"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-950">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="rounded-lg border p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Foto Properti</h2>
            <p className="text-sm text-muted-foreground">
              Unggah foto-foto properti kos Anda (Kamar, Kamar Mandi, Tampak
              Depan, dll)
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="imageTheme">Pilih Tema Foto</Label>
                <select
                  id="imageTheme"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={currentThemeId}
                  onChange={(e) => setCurrentThemeId(e.target.value)}
                >
                  {imageTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">Unggah Gambar</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {selectedImages.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {selectedImages.map((img, index) => (
                  <div
                    key={index}
                    className="group relative aspect-square rounded-lg border bg-muted overflow-hidden"
                  >
                    <img
                      src={img.previewUrl}
                      alt={`Preview ${index}`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                      <p className="text-[10px] text-white font-medium truncate w-full mb-1">
                        {img.themeName}
                      </p>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="size-7"
                        onClick={() => removeSelectedImage(index)}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedImages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-lg bg-muted/30">
                <Upload className="size-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Belum ada foto yang dipilih
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pilih tema lalu unggah foto
                </p>
              </div>
            )}
          </div>
        </div>

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
