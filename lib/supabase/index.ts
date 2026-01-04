// Export Supabase clients
// NOTE: createServerClient harus di-import langsung dari "./server" 
// untuk menghindari error di client components
export { createClient } from "./client";
export { updateSession } from "./middleware";

// Export auth helpers (hanya untuk client-side)
export * from "./auth";
