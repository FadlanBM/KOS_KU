import { Settings } from "lucide-react";

export default function UserSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">
          Kelola pengaturan akun Anda
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="size-5" />
          <h2 className="text-lg font-semibold">Pengaturan Akun</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Fitur pengaturan akan segera hadir
        </p>
      </div>
    </div>
  );
}

