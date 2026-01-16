"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload, Camera, FileText } from "lucide-react";
import Image from "next/image";
import { RegistrationStepper } from "@/components/registration-stepper";

export default function VerifyKTP() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    ktp_number: "",
    ktp_name: "",
    ktp_address: "",
    ktp_province: "",
    ktp_city: "",
    ktp_district: "",
    ktp_photo_url: "",
  });

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Anda harus login untuk verifikasi KTP");
        return;
      }
      setUserId(user.id);

      // Check if KTP already exists
      const { data: ktpData } = await supabase
        .from("penyedia_ktp")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (ktpData) {
        toast.info("Anda sudah mengirimkan data KTP");
        router.push("/register/verify-npwp");
        return;
      }

      setLoading(false);
    };

    checkUser();
  }, [router, supabase]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    // Basic validation
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }

    setUploading(true);
    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}_${Math.random()}.${fileExt}`;
      const filePath = `ktp/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profile_photos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("profile_photos").getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, ktp_photo_url: publicUrl }));
      toast.success("Foto KTP berhasil diunggah");
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast.error(error.message || "Gagal mengunggah foto");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (
      !formData.ktp_number ||
      !formData.ktp_name ||
      !formData.ktp_address ||
      !formData.ktp_photo_url
    ) {
      toast.error("Mohon lengkapi data KTP dan unggah foto KTP");
      return;
    }

    if (formData.ktp_number.length !== 16) {
      toast.error("Nomor KTP harus 16 digit");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("penyedia_ktp").insert({
        user_id: userId,
        ktp_number: formData.ktp_number,
        ktp_name: formData.ktp_name,
        ktp_address: formData.ktp_address,
        ktp_province: formData.ktp_province,
        ktp_city: formData.ktp_city,
        ktp_district: formData.ktp_district,
        ktp_photo_url: formData.ktp_photo_url,
      });

      if (error) throw error;

      toast.success("Data KTP berhasil dikirim untuk verifikasi!");
      router.push("/register/verify-npwp");
    } catch (error: any) {
      console.error("Error saving KTP:", error);
      toast.error(error.message || "Gagal menyimpan data KTP");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <RegistrationStepper currentStep={2} />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <FileText className="size-6 text-primary" />
            Verifikasi Identitas (KTP)
          </CardTitle>
          <CardDescription>
            Unggah foto KTP Anda untuk keperluan verifikasi keamanan penyedia
            kos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label>Foto KTP *</Label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center min-h-[200px] transition-colors ${
                  previewUrl
                    ? "border-primary/50 bg-primary/5"
                    : "border-muted-foreground/20 hover:border-primary/50"
                }`}
              >
                {previewUrl ? (
                  <div className="relative w-full aspect-[1.6/1] rounded-lg overflow-hidden">
                    <Image
                      src={previewUrl}
                      alt="KTP Preview"
                      fill
                      className="object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Label
                        htmlFor="ktp_photo"
                        className="cursor-pointer bg-white text-black px-4 py-2 rounded-md font-medium flex items-center gap-2"
                      >
                        <Camera className="size-4" /> Ganti Foto
                      </Label>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                      <Upload className="size-8 text-primary" />
                    </div>
                    <p className="text-sm font-medium mb-1">
                      Klik atau seret foto KTP ke sini
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                      Pastikan foto jelas, tidak blur, dan data terbaca dengan
                      baik (Max 2MB)
                    </p>
                    <Label
                      htmlFor="ktp_photo"
                      className="absolute inset-0 cursor-pointer"
                    >
                      <span className="sr-only">Upload KTP</span>
                    </Label>
                  </>
                )}
                <Input
                  id="ktp_photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                {uploading && (
                  <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center rounded-xl">
                    <Loader2 className="size-6 animate-spin text-primary mb-2" />
                    <p className="text-sm">Mengunggah...</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="ktp_number">
                  NIK (Nomor Induk Kependudukan) *
                </Label>
                <Input
                  id="ktp_number"
                  name="ktp_number"
                  placeholder="16 digit nomor NIK"
                  required
                  maxLength={16}
                  value={formData.ktp_number}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                    setFormData((prev) => ({ ...prev, ktp_number: val }));
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ktp_name">Nama Sesuai KTP *</Label>
                <Input
                  id="ktp_name"
                  name="ktp_name"
                  placeholder="Tuliskan nama lengkap sesuai KTP"
                  required
                  value={formData.ktp_name}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ktp_address">Alamat Sesuai KTP *</Label>
                <Textarea
                  id="ktp_address"
                  name="ktp_address"
                  placeholder="Tuliskan alamat lengkap sesuai KTP"
                  required
                  value={formData.ktp_address}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="ktp_province">Provinsi</Label>
                  <Input
                    id="ktp_province"
                    name="ktp_province"
                    placeholder="Contoh: Jawa Barat"
                    value={formData.ktp_province}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ktp_city">Kota/Kabupaten</Label>
                  <Input
                    id="ktp_city"
                    name="ktp_city"
                    placeholder="Contoh: Bandung"
                    value={formData.ktp_city}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ktp_district">Kecamatan</Label>
                  <Input
                    id="ktp_district"
                    name="ktp_district"
                    placeholder="Contoh: Coblong"
                    value={formData.ktp_district}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg border border-yellow-100 dark:border-yellow-900/50">
              <p className="text-xs text-yellow-800 dark:text-yellow-300 leading-relaxed">
                <strong>Catatan:</strong> Data KTP hanya digunakan untuk proses
                verifikasi akun. Kami menjamin kerahasiaan data Anda dan tidak
                akan menyalahgunakannya sesuai kebijakan privasi kami.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={submitting || uploading}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                "Kirim Verifikasi KTP"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
