"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Plus, Trash, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getUser } from "@/lib/supabase";

interface ImageType {
  id: string;
  name: string;
}

interface SelectedImage {
  id?: string; // Untuk gambar yang sudah ada di DB
  file?: File; // Untuk gambar baru
  themeId: string;
  themeName: string;
  previewUrl: string;
  url?: string; // Untuk gambar yang sudah ada di DB
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

export default function EditKosPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const supabase = createClient();

        // Fetch Image Types
        const { data: typesData } = await supabase
          .from("tipe_gambar")
          .select("id, name")
          .order("name");

        if (typesData) {
          setImageTypes(typesData);
          if (typesData.length > 0) setCurrentThemeId(typesData[0].id);
        }

        // Fetch Kos Data
        const { data: kosData, error: fetchError } = await supabase
          .from("kos")
          .select("*, gambar_kos(*, tipe_gambar(name))")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (fetchError || !kosData) {
          setError("Gagal memuat data kos.");
          setLoading(false);
          return;
        }

        // Map data ke state
        setFormData({
          userId: kosData.user_id || "",
          name: kosData.name || "",
          address: kosData.address || "",
          location:
            typeof kosData.location === "object" && kosData.location !== null
              ? (kosData.location as any).text || ""
              : kosData.location || "",
          description: kosData.description || "",
          genderType: kosData.gender_type || "mixed",
          availableRooms: kosData.available_rooms?.toString() || "",
          totalRooms: kosData.total_rooms?.toString() || "",
          monthlyPrice: kosData.monthly_price?.toString() || "",
          yearlyPrice: kosData.yearly_price?.toString() || "",
          depositPrice: kosData.deposit_price?.toString() || "",
          adminFee: kosData.admin_fee?.toString() || "",
          electricityType: kosData.electricity_type || "",
          waterType: kosData.water_type || "",
          minStayDuration: kosData.min_stay_duration?.toString() || "",
          roomSize: kosData.room_size?.toString() || "",
          certificateType: kosData.certificate_type || "",
          yearBuilt: kosData.year_built?.toString() || "",
          buildingFloors: kosData.building_floors?.toString() || "",
          propertyStatus: kosData.property_status || "active",
          isFeatured: kosData.is_featured || false,
          viewCount: kosData.view_count?.toString() || "",
          ratingAverage: kosData.rating_average?.toString() || "",
          totalReviews: kosData.total_reviews?.toString() || "",
          nearestCampus: kosData.nearest_campus || "",
          distanceToCampus: kosData.distance_to_campus?.toString() || "",
        });

        // Map fasilitas
        if (kosData.fasilitas_kos)
          setFacilityList(kosData.fasilitas_kos.split("|"));
        if (kosData.fasilitas_kamar)
          setRoomFacilityList(kosData.fasilitas_kamar.split("|"));
        if (kosData.fasilitas_kamar_mandi)
          setBathroomFacilityList(kosData.fasilitas_kamar_mandi.split("|"));
        if (kosData.fasilitas_parkir)
          setParkingFacilityList(kosData.fasilitas_parkir.split("|"));
        if (kosData.peraturan_kos)
          setRegulationList(kosData.peraturan_kos.split("|"));

        // Map Gambar
        if (kosData.gambar_kos) {
          const mappedImages: SelectedImage[] = kosData.gambar_kos.map(
            (img: any) => ({
              id: img.id,
              themeId: img.tipe_gambar_id,
              themeName: img.tipe_gambar?.name || "Lainnya",
              previewUrl: img.url_gambar,
              url: img.url_gambar,
            })
          );
          setSelectedImages(mappedImages);
        }

        setLoading(false);
      } catch (err) {
        setError("Terjadi kesalahan saat memuat data.");
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

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
        setError(parsed.error.issues[0]?.message || "Data tidak valid.");
        setSaving(false);
        return;
      }

      const data = parsed.data;
      const user = await getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const supabase = createClient();

      const updateData = {
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

      const { error: updateError } = await supabase
        .from("kos")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // Handle Hapus Gambar
      if (imagesToDelete.length > 0) {
        // 1. Ambil nama file gambar dan tema untuk dihapus dari Storage
        const { data: images } = await supabase
          .from("gambar_kos")
          .select("name_image, tipe_gambar(name)")
          .in("id", imagesToDelete);

        if (images && images.length > 0) {
          const filesToDelete = images
            .map((img: any) => {
              if (img.name_image && img.tipe_gambar?.name) {
                return `${img.tipe_gambar.name}/${img.name_image}`;
              }
              return null;
            })
            .filter((path): path is string => path !== null);

          if (filesToDelete.length > 0) {
            try {
              const { error: storageError } = await supabase.storage
                .from("profile_photos")
                .remove(filesToDelete);
              if (storageError) {
                console.error(
                  "Error removing files from bucket during edit:",
                  storageError
                );
              }
            } catch (err) {
              console.error(
                "Unexpected error deleting from storage during edit:",
                err
              );
            }
          }
        }

        // 2. Hapus data dari database
        await supabase.from("gambar_kos").delete().in("id", imagesToDelete);
      }

      // Handle Upload Gambar Baru
      const newImages = selectedImages.filter((img) => !img.id);
      if (newImages.length > 0) {
        for (const img of newImages) {
          if (!img.file) continue;
          const fileExt = img.file.name.split(".").pop();
          const fileName = `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2)}.${fileExt}`;
          const filePath = `${img.themeName}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("profile_photos")
            .upload(filePath, img.file);

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from("profile_photos")
              .getPublicUrl(filePath);

            await supabase.from("gambar_kos").insert([
              {
                kos_id: id,
                name_image: fileName,
                url_gambar: publicUrlData.publicUrl,
                tipe_gambar_id: img.themeId,
              },
            ]);
          }
        }
      }

      router.push("/kos");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan data.");
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handlers untuk fasilitas
  const handleAddFacility = () => {
    const v = facilityInput.trim();
    if (v && !facilityList.includes(v)) {
      setFacilityList([...facilityList, v]);
      setFacilityInput("");
    }
  };
  const handleAddRoomFacility = () => {
    const v = roomFacilityInput.trim();
    if (v && !roomFacilityList.includes(v)) {
      setRoomFacilityList([...roomFacilityList, v]);
      setRoomFacilityInput("");
    }
  };
  const handleAddBathroomFacility = () => {
    const v = bathroomFacilityInput.trim();
    if (v && !bathroomFacilityList.includes(v)) {
      setBathroomFacilityList([...bathroomFacilityList, v]);
      setBathroomFacilityInput("");
    }
  };
  const handleAddParkingFacility = () => {
    const v = parkingFacilityInput.trim();
    if (v && !parkingFacilityList.includes(v)) {
      setParkingFacilityList([...parkingFacilityList, v]);
      setParkingFacilityInput("");
    }
  };
  const handleAddRegulation = () => {
    const v = regulationInput.trim();
    if (v && !regulationList.includes(v)) {
      setRegulationList([...regulationList, v]);
      setRegulationInput("");
    }
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
    const img = selectedImages[index];
    if (img.id) {
      setImagesToDelete([...imagesToDelete, img.id]);
    } else {
      URL.revokeObjectURL(img.previewUrl);
    }
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
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
        <Button variant="ghost" size="icon" asChild>
          <Link href="/kos">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Properti Kos</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informasi Dasar */}
        <div className="rounded-lg border p-6 space-y-6">
          <h2 className="text-lg font-semibold">Informasi Dasar</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Kos *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genderType">Tipe Kos *</Label>
              <Input
                id="genderType"
                name="genderType"
                value={formData.genderType}
                onChange={handleChange}
                placeholder="male / female / mixed"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyPrice">Harga per Bulan *</Label>
              <Input
                id="monthlyPrice"
                name="monthlyPrice"
                type="number"
                value={formData.monthlyPrice}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalRooms">Total Kamar *</Label>
              <Input
                id="totalRooms"
                name="totalRooms"
                type="number"
                value={formData.totalRooms}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availableRooms">Kamar Tersedia *</Label>
              <Input
                id="availableRooms"
                name="availableRooms"
                type="number"
                value={formData.availableRooms}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Lokasi */}
        <div className="rounded-lg border p-6 space-y-6">
          <h2 className="text-lg font-semibold">Lokasi</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Alamat Lengkap *</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Detail Lokasi *</Label>
              <Textarea
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                rows={3}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nearestCampus">Kampus Terdekat</Label>
                <Input
                  id="nearestCampus"
                  name="nearestCampus"
                  value={formData.nearestCampus}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="distanceToCampus">Jarak ke Kampus (km)</Label>
                <Input
                  id="distanceToCampus"
                  name="distanceToCampus"
                  type="number"
                  step="0.1"
                  value={formData.distanceToCampus}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fasilitas */}
        <div className="rounded-lg border p-6 space-y-6">
          <h2 className="text-lg font-semibold">Fasilitas & Deskripsi</h2>

          {/* Fasilitas Umum */}
          <div className="space-y-2">
            <Label>Fasilitas Kos</Label>
            <div className="flex gap-2">
              <Input
                value={facilityInput}
                onChange={(e) => setFacilityInput(e.target.value)}
                placeholder="WiFi, AC, dll"
              />
              <Button type="button" onClick={handleAddFacility}>
                Tambah
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {facilityList.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm"
                >
                  {f}{" "}
                  <X
                    className="size-3 cursor-pointer"
                    onClick={() =>
                      setFacilityList(facilityList.filter((i) => i !== f))
                    }
                  />
                </span>
              ))}
            </div>
          </div>

          {/* Fasilitas Kamar */}
          <div className="space-y-2">
            <Label>Fasilitas Kamar</Label>
            <div className="flex gap-2">
              <Input
                value={roomFacilityInput}
                onChange={(e) => setRoomFacilityInput(e.target.value)}
              />
              <Button type="button" onClick={handleAddRoomFacility}>
                Tambah
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {roomFacilityList.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm"
                >
                  {f}{" "}
                  <X
                    className="size-3 cursor-pointer"
                    onClick={() =>
                      setRoomFacilityList(
                        roomFacilityList.filter((i) => i !== f)
                      )
                    }
                  />
                </span>
              ))}
            </div>
          </div>

          {/* Fasilitas Kamar Mandi */}
          <div className="space-y-2">
            <Label>Fasilitas Kamar Mandi</Label>
            <div className="flex gap-2">
              <Input
                value={bathroomFacilityInput}
                onChange={(e) => setBathroomFacilityInput(e.target.value)}
              />
              <Button type="button" onClick={handleAddBathroomFacility}>
                Tambah
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {bathroomFacilityList.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm"
                >
                  {f}{" "}
                  <X
                    className="size-3 cursor-pointer"
                    onClick={() =>
                      setBathroomFacilityList(
                        bathroomFacilityList.filter((i) => i !== f)
                      )
                    }
                  />
                </span>
              ))}
            </div>
          </div>

          {/* Fasilitas Parkir */}
          <div className="space-y-2">
            <Label>Fasilitas Parkir</Label>
            <div className="flex gap-2">
              <Input
                value={parkingFacilityInput}
                onChange={(e) => setParkingFacilityInput(e.target.value)}
              />
              <Button type="button" onClick={handleAddParkingFacility}>
                Tambah
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {parkingFacilityList.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm"
                >
                  {f}{" "}
                  <X
                    className="size-3 cursor-pointer"
                    onClick={() =>
                      setParkingFacilityList(
                        parkingFacilityList.filter((i) => i !== f)
                      )
                    }
                  />
                </span>
              ))}
            </div>
          </div>

          {/* Peraturan */}
          <div className="space-y-2">
            <Label>Peraturan Kos</Label>
            <div className="flex gap-2">
              <Input
                value={regulationInput}
                onChange={(e) => setRegulationInput(e.target.value)}
              />
              <Button type="button" onClick={handleAddRegulation}>
                Tambah
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {regulationList.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm"
                >
                  {f}{" "}
                  <X
                    className="size-3 cursor-pointer"
                    onClick={() =>
                      setRegulationList(regulationList.filter((i) => i !== f))
                    }
                  />
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
            />
          </div>
        </div>

        {/* Utilitas & Foto (Disingkat untuk ringkasan, mengikuti pola add/page.tsx) */}
        <div className="rounded-lg border p-6 space-y-6">
          <h2 className="text-lg font-semibold">Foto Properti</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={currentThemeId}
              onChange={(e) => setCurrentThemeId(e.target.value)}
            >
              {imageTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mt-4">
            {selectedImages.map((img, i) => (
              <div
                key={i}
                className="group relative aspect-square rounded-lg border bg-muted overflow-hidden"
              >
                <img
                  src={img.previewUrl}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeSelectedImage(i)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-red-800">{error}</div>
        )}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/kos")}
          >
            Batal
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
