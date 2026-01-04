"use client";

import { useState } from "react";
import { UserDashboardSidebar } from "./sidebar";
import { UserDashboardHeader } from "./header";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface MobileUserDashboardWrapperProps {
  user: SupabaseUser;
  children: React.ReactNode;
}

export function MobileUserDashboardWrapper({
  user,
  children,
}: MobileUserDashboardWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <UserDashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col md:ml-0">
        <UserDashboardHeader
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-3 sm:p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
