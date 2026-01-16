"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { RegistrationStepper } from "@/components/registration-stepper";

export default function CompleteProfilePenyedia() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(
    null
  );

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    whatsapp_number: "",
    email: "",
    gender: "",
    date_of_birth: "",
    address: "",
    emergency_contact: "",
    emergency_contact_relation: "",
    business_name: "",
    business_address: "",
    bio: "",
  });

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Anda harus login untuk melengkapi profil");
        router.push("/login");
        return;
      }
      setUserId(user.id);
      setFormData((prev) => ({ ...prev, email: user.email || "" }));

      const { data: profile } = await supabase
        .from("profile_penyedia")
        .select("user_id")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        toast.info("Anda sudah melengkapi profil");
        router.push("/register/verify-ktp");
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProfilePhotoFile(file);
    if (file) {
      setProfilePhotoPreview(URL.createObjectURL(file));
    } else {
      setProfilePhotoPreview(null);
    }
  };

  const uploadProfilePhoto = async (file: File, userId: string) => {
    const bucket = "profile_photos";
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${userId}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (
      !formData.full_name ||
      !formData.phone_number ||
      !formData.gender ||
      !formData.date_of_birth ||
      !formData.address ||
      !formData.emergency_contact
    ) {
      toast.error("Mohon lengkapi semua field yang wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      let uploadedProfilePhotoUrl: string | null = null;

      if (profilePhotoFile && userId) {
        uploadedProfilePhotoUrl = await uploadProfilePhoto(
          profilePhotoFile,
          userId
        );
      }

      const { error } = await supabase.from("profile_penyedia").insert({
        user_id: userId,
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        whatsapp_number: formData.whatsapp_number || formData.phone_number,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        address: formData.address,
        emergency_contact: formData.emergency_contact,
        emergency_contact_relation: formData.emergency_contact_relation,
        business_name: formData.business_name,
        business_address: formData.business_address,
        bio: formData.bio,
        profile_photo_url: uploadedProfilePhotoUrl,
        verification_status: "pending",
        is_verified: false,
      });

      if (error) throw error;

      toast.success("Profil berhasil disimpan!");
      router.push("/register/verify-ktp");
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error(error.message || "Gagal menyimpan profil");
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
    <div className="container max-w-3xl mx-auto py-10 px-4">
      <RegistrationStepper currentStep={1} />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Lengkapi Profil Penyedia Kos
          </CardTitle>
          <CardDescription>
            Silakan lengkapi data diri Anda untuk mulai mengelola kos di
            platform kami.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="profile_photo">Foto Profil</Label>
              <Input
                id="profile_photo"
                name="profile_photo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {profilePhotoPreview && (
                <div className="mt-2">
                  <img
                    src={profilePhotoPreview}
                    alt="Preview foto profil"
                    className="h-24 w-24 rounded-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nama Lengkap *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  placeholder="Nama sesuai KTP"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  disabled
                  value={formData.email}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone_number">Nomor Telepon *</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  placeholder="Contoh: 081234567890"
                  required
                  value={formData.phone_number}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp_number">Nomor WhatsApp</Label>
                <Input
                  id="whatsapp_number"
                  name="whatsapp_number"
                  placeholder="Kosongkan jika sama dengan nomor telepon"
                  value={formData.whatsapp_number}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gender">Jenis Kelamin *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(val) => handleSelectChange("gender", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Laki-laki</SelectItem>
                    <SelectItem value="female">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Tanggal Lahir *</Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  required
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Alamat Lengkap *</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Alamat sesuai KTP"
                required
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact">
                  Kontak Darurat (Nama & No. HP) *
                </Label>
                <Input
                  id="emergency_contact"
                  name="emergency_contact"
                  placeholder="Contoh: Budi - 0812..."
                  required
                  value={formData.emergency_contact}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_relation">
                  Hubungan Kontak Darurat
                </Label>
                <Input
                  id="emergency_contact_relation"
                  name="emergency_contact_relation"
                  placeholder="Contoh: Orang Tua, Saudara, dll"
                  value={formData.emergency_contact_relation}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">
                Informasi Bisnis (Opsional)
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Nama Bisnis / Brand Kos</Label>
                  <Input
                    id="business_name"
                    name="business_name"
                    placeholder="Contoh: Kos Barokah"
                    value={formData.business_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_address">Alamat Bisnis</Label>
                  <Input
                    id="business_address"
                    name="business_address"
                    placeholder="Alamat operasional bisnis"
                    value={formData.business_address}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio Singkat</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Ceritakan sedikit tentang Anda atau bisnis kos Anda"
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Profil & Lanjutkan"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
