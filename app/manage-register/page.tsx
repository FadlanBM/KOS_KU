"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpWithEmail } from "@/lib/supabase";

export default function AdminRegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validasi password
    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await signUpWithEmail(
        email,
        password,
        {
          data: {
            name: name || undefined,
          },
        }
      );

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Assign role "admin" ke user baru
        try {
          const response = await fetch("/api/users/assign-admin-role", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: data.user.id }),
          });

          if (!response.ok) {
            console.error("Failed to assign admin role");
          }
        } catch (error) {
          console.error("Error assigning admin role:", error);
        }

        setSuccess(true);
        // Redirect ke login admin setelah 2 detik
        setTimeout(() => {
          router.push("/manage-login");
        }, 2000);
      }
    } catch {
      setError("Terjadi kesalahan saat mendaftar. Silakan coba lagi.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className="bg-green-50 dark:bg-green-950 p-8 rounded-lg border border-green-200 dark:border-green-900 max-w-md">
          <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
            Registrasi Berhasil!
          </h2>
          <p className="text-muted-foreground mb-4">
            Akun Admin Anda telah berhasil dibuat. Anda akan diarahkan ke
            halaman login dalam beberapa detik...
          </p>
          <Button asChild>
            <Link href="/manage-login">Ke Halaman Login Admin</Link>
          </Button>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold">Registrasi Admin</h1>
                <p className="text-balance text-sm text-muted-foreground">
                  Masukkan email dan password untuk mendaftar sebagai Admin
                </p>
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nama Anda"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Mendaftar..." : "Daftar sebagai Admin"}
                </Button>
              </div>
              <div className="text-center text-sm">
                Sudah punya akun admin?{" "}
                <Link
                  href="/manage-login"
                  className="underline underline-offset-4"
                >
                  Login Admin
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary p-12 text-primary-foreground">
          <h2 className="text-3xl font-bold mb-4">Admin Dashboard</h2>
          <p className="text-center text-lg opacity-90">
            Kelola properti kos, pantau transaksi, dan berikan layanan terbaik
            untuk penyewa Anda melalui dashboard admin eksklusif.
          </p>
        </div>
      </div>
    </div>
  );
}
