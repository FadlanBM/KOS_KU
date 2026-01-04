"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
  Settings,
  Home,
  Search,
  Heart,
  CreditCard,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  {
    name: "Dashboard",
    href: "/user-dashboard",
    icon: LayoutDashboard,
  },

  {
    name: "Favorit",
    href: "/user-dashboard/favorites",
    icon: Heart,
  },
  {
    name: "Transaksi",
    href: "/user-dashboard/transactions",
    icon: CreditCard,
  },
  {
    name: "Profile",
    href: "/user-dashboard/profile",
    icon: User,
  },
  {
    name: "Pengaturan",
    href: "/user-dashboard/settings",
    icon: Settings,
  },
];

interface UserDashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function UserDashboardSidebar({
  isOpen = false,
  onClose,
}: UserDashboardSidebarProps) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r bg-background transition-transform duration-300 ease-in-out md:relative md:z-auto md:translate-x-0 md:flex md:flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link
            href="/user-dashboard"
            className="flex items-center gap-2 font-medium"
            onClick={handleLinkClick}
          >
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <span className="text-xs font-bold">K</span>
            </div>
            <span className="hidden sm:inline">Web Kosku</span>
            <span className="sm:hidden">WK</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onClose}
          >
            <X className="size-5" />
          </Button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navigation.map((item) => {
            const isActive =
              item.href === "/user-dashboard"
                ? pathname === "/user-dashboard"
                : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="size-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
