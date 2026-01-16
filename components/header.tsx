"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Home", href: "/" },
  { name: "Kos", href: "/user-dashboard/kos" },
];

export const HeroHeader = () => {
  const pathname = usePathname();
  const [menuState, setMenuState] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"admin" | "pemilik" | "user" | null>(null);

  const fetchUserRole = useCallback(async () => {
    try {
      const response = await fetch("/api/users/check-role");
      if (response.ok) {
        const data = await response.json();
        if (data.isAdmin) {
          setUserRole("admin");
        } else if (data.isPemilik) {
          setUserRole("pemilik");
        } else if (data.isUser) {
          setUserRole("user");
        } else {
          setUserRole(null);
        }
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      setUserRole(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    // Check user role immediately if user is already present
    const checkRole = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          fetchUserRole();
        }
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    checkRole();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      const currentUser = session?.user ?? null;

      // Only update and fetch role if user changed or it's a specific relevant event
      // Avoid fetching role on TOKEN_REFRESHED to prevent infinite loops
      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "USER_UPDATED"
      ) {
        setUser(currentUser);
        if (currentUser) {
          fetchUserRole();
        } else {
          setUserRole(null);
        }
      } else if (event === "INITIAL_SESSION" || !user) {
        // Handle initial session or if user state is missing
        if (currentUser?.id !== user?.id) {
          setUser(currentUser);
          if (currentUser) {
            fetchUserRole();
          } else {
            setUserRole(null);
          }
        }
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserRole]);

  return (
    <header className="sticky top-0 z-50 w-full">
      <nav
        data-state={menuState && "active"}
        className="bg-background/50 w-full border-b backdrop-blur-3xl"
      >
        <div className="mx-auto max-w-6xl px-6 transition-all duration-300">
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full items-center justify-between gap-12 lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <Logo />
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>

              {/* <div className="hidden lg:block">
                <ul className="flex gap-8 text-sm">
                  {menuItems.map((item, index) => {
                    const isActive =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href);
                    return (
                      <li key={index}>
                        <Link
                          href={item.href}
                          className={cn(
                            "block duration-150",
                            isActive
                              ? "text-accent-foreground font-medium"
                              : "text-muted-foreground hover:text-accent-foreground"
                          )}
                        >
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div> */}
            </div>

            <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => {
                    const isActive =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href);
                    return (
                      <li key={index}>
                        <Link
                          href={item.href}
                          className={cn(
                            "block duration-150",
                            isActive
                              ? "text-accent-foreground font-medium"
                              : "text-muted-foreground hover:text-accent-foreground"
                          )}
                        >
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
                    <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
                  </div>
                ) : user ? (
                  <Button asChild size="sm">
                    <Link
                      href={
                        userRole === "admin" ? "/dashboard" : "/user-dashboard"
                      }
                    >
                      <LayoutDashboard className="size-4" />
                      <span>Dashboard</span>
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/login">
                        <span>Login</span>
                      </Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href="/register">
                        <span>Sign Up</span>
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
