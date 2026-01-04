import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MobileUserDashboardWrapper } from "@/components/layout/user-dashboard/mobile-wrapper";
import { isUser } from "@/lib/supabase/roles";

export default async function UserDashboardLayout({
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

  // Check if user has user role
  const userHasUserRole = await isUser(user.id);
  console.log(userHasUserRole);

  if (!userHasUserRole) {
    redirect("/unauthorized");
  }

  return (
    <MobileUserDashboardWrapper user={user}>
      {children}
    </MobileUserDashboardWrapper>
  );
}
