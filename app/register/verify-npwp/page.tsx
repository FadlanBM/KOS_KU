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
import { Loader2, Upload, Camera, CreditCard } from "lucide-react";
import Image from "next/image";
import { RegistrationStepper } from "@/components/registration-stepper";

export default function VerifyNPWP() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    npwp_number: "",
    npwp_name: "",
    npwp_address: "",
    npwp_photo_url: "",
  });

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Anda harus login untuk verifikasi NPWP");
        return;
      }
      setUserId(user.id);

      // Check if NPWP already exists
      const { data: npwpData } = await supabase
        .from("penyedia_npwp")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (npwpData) {
        toast.info("Anda sudah mengirimkan data NPWP");
        router.push("/register/add-bank");
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}_npwp_${Math.random()}.${fileExt}`;
      const filePath = `npwp/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profile_photos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("profile_photos").getPublicUrl(filePath);
      setFormData((prev) => ({ ...prev, npwp_photo_url: publicUrl }));
      toast.success("Foto NPWP berhasil diunggah");
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
      !formData.npwp_number ||
      !formData.npwp_name ||
      !formData.npwp_photo_url
    ) {
      toast.error("Mohon lengkapi data NPWP dan unggah foto NPWP");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("penyedia_npwp").insert({
        user_id: userId,
        npwp_number: formData.npwp_number,
        npwp_name: formData.npwp_name,
        npwp_address: formData.npwp_address,
        npwp_photo_url: formData.npwp_photo_url,
      });

      if (error) throw error;

      toast.success("Data NPWP berhasil dikirim untuk verifikasi!");
      router.push("/register/add-bank");
    } catch (error: any) {
      console.error("Error saving NPWP:", error);
      toast.error(error.message || "Gagal menyimpan data NPWP");
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
      <RegistrationStepper currentStep={3} />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <CreditCard className="size-6 text-primary" />
            Verifikasi NPWP
          </CardTitle>
          <CardDescription>
            Unggah foto NPWP Anda untuk keperluan verifikasi pajak penyedia kos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label>Foto NPWP *</Label>
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
                      alt="NPWP Preview"
                      fill
                      className="object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Label
                        htmlFor="npwp_photo"
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
                      Klik atau seret foto NPWP ke sini
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                      Pastikan foto jelas, tidak blur, dan data terbaca dengan
                      baik (Max 2MB)
                    </p>
                    <Label
                      htmlFor="npwp_photo"
                      className="absolute inset-0 cursor-pointer"
                    >
                      <span className="sr-only">Upload NPWP</span>
                    </Label>
                  </>
                )}
                <Input
                  id="npwp_photo"
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
                <Label htmlFor="npwp_number">Nomor NPWP *</Label>
                <Input
                  id="npwp_number"
                  name="npwp_number"
                  placeholder="Masukkan nomor NPWP Anda"
                  required
                  value={formData.npwp_number}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d.-]/g, "");
                    setFormData((prev) => ({ ...prev, npwp_number: val }));
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="npwp_name">Nama Sesuai NPWP *</Label>
                <Input
                  id="npwp_name"
                  name="npwp_name"
                  placeholder="Tuliskan nama lengkap sesuai kartu NPWP"
                  required
                  value={formData.npwp_name}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="npwp_address">Alamat Sesuai NPWP</Label>
                <Textarea
                  id="npwp_address"
                  name="npwp_address"
                  placeholder="Tuliskan alamat lengkap sesuai kartu NPWP"
                  value={formData.npwp_address}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50">
              <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                <strong>Catatan:</strong> Data NPWP digunakan untuk keperluan
                pelaporan pajak sesuai peraturan yang berlaku. Kami menjamin
                kerahasiaan data Anda.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/manage-register/add-bank")}
              >
                Lewati (Nanti Saja)
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={submitting || uploading}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  "Kirim Verifikasi NPWP"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
