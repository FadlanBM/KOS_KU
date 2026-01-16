import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MobileDashboardWrapper } from "@/components/layout/dashboard/mobile-wrapper";
import { isAdmin, isPemilik } from "@/lib/supabase/roles";

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

  // Check if user has admin or pemilik role
  const [userIsAdmin, userIsPemilik] = await Promise.all([
    isAdmin(user.id),
    isPemilik(user.id),
  ]);

  if (!userIsAdmin && !userIsPemilik) {
    redirect("/unauthorized");
  }

  return (
    <MobileDashboardWrapper user={user}>{children}</MobileDashboardWrapper>
  );
}

