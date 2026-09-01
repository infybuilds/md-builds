/**
 * Hand-written mirror of the SQL in `supabase/migrations/`.
 *
 * Replace with `supabase gen types typescript` output once the Supabase CLI is
 * part of the workflow — the shape below is deliberately generator-compatible.
 */

export type Role = "user" | "admin";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: Role;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: Role;
        };
        Update: {
          email?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
        };
        Relationships: [];
      };
      workshops: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          published?: boolean;
        };
        Update: {
          title?: string;
          slug?: string;
          description?: string | null;
          published?: boolean;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          content: string;
          category_id: string | null;
          workshop_id: string | null;
          published: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          content?: string;
          category_id?: string | null;
          workshop_id?: string | null;
          published?: boolean;
          sort_order?: number;
        };
        Update: {
          title?: string;
          slug?: string;
          description?: string | null;
          content?: string;
          category_id?: string | null;
          workshop_id?: string | null;
          published?: boolean;
          sort_order?: number;
        };
        // Needed for embedded selects like `.select("*, categories(name)")` to
        // type-check; mirrors what `supabase gen types` emits for these FKs.
        Relationships: [
          {
            foreignKeyName: "documents_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_workshop_id_fkey";
            columns: ["workshop_id"];
            isOneToOne: false;
            referencedRelation: "workshops";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Workshop = Database["public"]["Tables"]["workshops"]["Row"];
export type Document = Database["public"]["Tables"]["documents"]["Row"];
