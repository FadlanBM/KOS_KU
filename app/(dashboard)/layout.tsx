import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MobileDashboardWrapper } from "@/components/layout/dashboard/mobile-wrapper";
import { isAdmin } from "@/lib/supabase/roles";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if user is logged in
  if (!user) {
    redirect("/login");
  }

  // Check if user has admin role
  const userIsAdmin = await isAdmin(user.id);

  if (!userIsAdmin) {
    redirect("/unauthorized");
  }

  return (
    <MobileDashboardWrapper user={user}>{children}</MobileDashboardWrapper>
  );
}

