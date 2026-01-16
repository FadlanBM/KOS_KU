"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithEmail } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/client";

export default function PemilikLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const resolveNextStepAndRedirect = async (userId: string) => {
    // Step 1: Profile
    const { data: profile } = await supabase
      .from("profile_penyedia")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!profile) {
      router.push("/register/complete-profile");
      return;
    }
    
    // Step 2: KTP
    const { data: ktp } = await supabase
      .from("penyedia_ktp")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!ktp) {
      router.push("/register/verify-ktp");
      return;
    }
    
    // Step 3: NPWP
    const { data: npwp } = await supabase
      .from("penyedia_npwp")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!npwp) {
      router.push("/register/verify-npwp");
      return;
    }
    
    // Step 4: Bank
    const { data: bank } = await supabase
      .from("penyedia_bank")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!bank) {
      router.push("/register/add-bank");
      return;
    }

    // All steps done -> Dashboard
    router.push("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await signInWithEmail(
        email,
        password
      );

      if (signInError) {
        setError("Email atau password salah");
        setLoading(false);
        return;
      }

      if (data.user) {
        // Cek role user
        try {
          const response = await fetch("/api/users/check-role");
          const roleData = await response.json();

          if (roleData.isPemilik) {
            await resolveNextStepAndRedirect(data.user.id);
          } else {
            setError("Akun ini bukan akun Pemilik.");
            setLoading(false);
          }
        } catch (error) {
          console.error("Error checking role:", error);
          await resolveNextStepAndRedirect(data.user.id); // Fallback to step resolution
        }
      }
    } catch {
      setError("Terjadi kesalahan saat login. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <span className="text-xs font-bold">K</span>
            </div>
            Web Kosku
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Login Pemilik</h1>
                <p className="text-balance text-sm text-muted-foreground">
                  Masukkan email dan password pemilik Anda
                </p>
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="pemilik@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Memproses..." : "Login Pemilik"}
                </Button>
              </div>
              <div className="text-center text-sm">
                Belum punya akun pemilik?{" "}
                <Link
                  href="/manage-register"
                  className="underline underline-offset-4"
                >
                  Daftar di sini
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary p-12 text-primary-foreground">
          <h2 className="text-3xl font-bold mb-4">Pemilik Access</h2>
          <p className="text-center text-lg opacity-90">
            Masuk untuk mengelola seluruh ekosistem properti kos Anda dengan
            efisien dan aman.
          </p>
        </div>
      </div>
    </div>
  );
}
