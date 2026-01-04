import { createClient } from "@/lib/supabase/server";
import { User } from "lucide-react";

export default async function UserProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Kelola informasi profil Anda
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="rounded-full bg-primary/10 p-4">
            <User className="size-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {user?.email?.split("@")[0] || "User"}
            </h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Email
            </label>
            <p className="mt-1 text-sm">{user?.email}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              User ID
            </label>
            <p className="mt-1 text-sm font-mono text-xs">{user?.id}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Terdaftar Sejak
            </label>
            <p className="mt-1 text-sm">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

