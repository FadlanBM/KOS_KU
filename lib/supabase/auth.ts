import { createClient } from "./client";
import type { User, Session } from "@supabase/supabase-js";

/**
 * Get current user session (client-side)
 */
export async function getSession(): Promise<Session | null> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Get current user (client-side)
 */
export async function getUser(): Promise<User | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  options?: {
    data?: Record<string, any>;
    redirectTo?: string;
    phone?: string;
  }
) {
  const supabase = createClient();
  const { phone, ...otherOptions } = options || {};
  return await supabase.auth.signUp({
    email,
    password,
    phone,
    options: otherOptions,
  });
}

/**
 * Sign out current user
 */
export async function signOut() {
  const supabase = createClient();
  return await supabase.auth.signOut();
}

/**
 * Reset password with email
 */
export async function resetPassword(email: string, redirectTo?: string) {
  const supabase = createClient();
  const redirectUrl =
    redirectTo ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/auth/reset-password`
      : `${process.env.NEXT_PUBLIC_SITE_URL || ""}/auth/reset-password`);
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  const supabase = createClient();
  return await supabase.auth.updateUser({
    password: newPassword,
  });
}
