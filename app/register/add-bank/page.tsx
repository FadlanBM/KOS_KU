"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Landmark, CreditCard, User, Building2, Loader2 } from "lucide-react";
import { RegistrationStepper } from "@/components/registration-stepper";

const BANKS = [
  { name: "Bank BCA", code: "014" },
  { name: "Bank Mandiri", code: "008" },
  { name: "Bank BNI", code: "009" },
  { name: "Bank BRI", code: "002" },
  { name: "Bank Syariah Indonesia (BSI)", code: "451" },
  { name: "Bank CIMB Niaga", code: "022" },
  { name: "Bank Danamon", code: "011" },
  { name: "Bank Permata", code: "013" },
  { name: "Bank BTN", code: "200" },
  { name: "Bank Maybank", code: "016" },
];

export default function AddBankPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    bank_name: "",
    bank_code: "",
    account_number: "",
    account_holder_name: "",
    branch_name: "",
    is_primary: true,
  });

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return;
      }
      setUserId(user.id);

      // Check if user already has a bank account
      const { data: bankData } = await supabase
        .from("penyedia_bank_accounts")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (bankData) {
        toast.info("Anda sudah menambahkan akun bank");
        router.push("/dashboard");
        return;
      }

      setLoading(false);
    };

    checkUser();
  }, [router, supabase]);

  const handleBankChange = (value: string) => {
    const selectedBank = BANKS.find((b) => b.name === value);
    setFormData({
      ...formData,
      bank_name: value,
      bank_code: selectedBank?.code || "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (
      !formData.bank_name ||
      !formData.account_number ||
      !formData.account_holder_name
    ) {
      toast.error("Mohon lengkapi data bank yang wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("penyedia_bank_accounts").insert({
        user_id: userId,
        bank_name: formData.bank_name,
        bank_code: formData.bank_code,
        account_number: formData.account_number,
        account_holder_name: formData.account_holder_name,
        branch_name: formData.branch_name,
        is_primary: formData.is_primary,
      });

      if (error) throw error;

      toast.success("Akun bank berhasil ditambahkan!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error saving bank:", error);
      toast.error(error.message || "Gagal menyimpan data bank");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <RegistrationStepper currentStep={4} />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Landmark className="h-6 w-6 text-primary" />
            Informasi Rekening Bank
          </CardTitle>
          <CardDescription>
            Data ini akan digunakan untuk pencairan dana hasil sewa properti
            Anda.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Bank Name */}
              <div className="space-y-2">
                <Label htmlFor="bank_name" className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-primary" />
                  Nama Bank *
                </Label>
                <Select
                  onValueChange={handleBankChange}
                  value={formData.bank_name}
                >
                  <SelectTrigger id="bank_name">
                    <SelectValue placeholder="Pilih Bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {BANKS.map((bank) => (
                      <SelectItem key={bank.name} value={bank.name}>
                        {bank.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Account Number */}
              <div className="space-y-2">
                <Label
                  htmlFor="account_number"
                  className="flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4 text-primary" />
                  Nomor Rekening *
                </Label>
                <Input
                  id="account_number"
                  type="text"
                  required
                  value={formData.account_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      account_number: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  placeholder="Contoh: 1234567890"
                />
              </div>

              {/* Account Holder Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="account_holder_name"
                  className="flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-primary" />
                  Nama Pemilik Rekening *
                </Label>
                <Input
                  id="account_holder_name"
                  type="text"
                  required
                  value={formData.account_holder_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      account_holder_name: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="Sesuai yang tertera di buku tabungan"
                />
              </div>

              {/* Branch Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="branch_name"
                  className="flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-primary" />
                  Kantor Cabang (Opsional)
                </Label>
                <Input
                  id="branch_name"
                  type="text"
                  value={formData.branch_name}
                  onChange={(e) =>
                    setFormData({ ...formData, branch_name: e.target.value })
                  }
                  placeholder="Contoh: KCP Sudirman Jakarta"
                />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50">
              <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                <strong>Catatan:</strong> Pastikan nama pemilik rekening sama
                dengan nama di profil atau KTP Anda untuk mempermudah proses
                verifikasi.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/dashboard")}
              >
                Lewati (Nanti Saja)
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan & Selesai"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
