// Database types
// Generate types dengan command:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
// atau
// npx supabase gen types typescript --local > lib/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      kos: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          address: string;
          city: string;
          price: number;
          room_type: string;
          facilities: string | null;
          description: string | null;
          available_rooms: number;
          total_rooms: number;
          nomor_pemilik: string | null; // Added field
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          address: string;
          city: string;
          price: number;
          room_type: string;
          facilities?: string | null;
          description?: string | null;
          available_rooms?: number;
          total_rooms?: number;
          nomor_pemilik?: string | null; // Added field
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          address?: string;
          city?: string;
          price?: number;
          room_type?: string;
          facilities?: string | null;
          description?: string | null;
          available_rooms?: number;
          total_rooms?: number;
          nomor_pemilik?: string | null; // Added field
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          kos_id: string;
          start_date: string;
          duration_months: number;
          total_price: number;
          ktp_number: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          kos_id: string;
          start_date: string;
          duration_months: number;
          total_price: number;
          ktp_number: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          kos_id?: string;
          start_date?: string;
          duration_months?: number;
          total_price?: number;
          ktp_number?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
