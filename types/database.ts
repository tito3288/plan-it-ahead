export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      alerts: {
        Row: {
          category: string;
          created_at: string;
          description: string | null;
          id: string;
          last_seen_at: string;
          nps_alert_id: string | null;
          park_id: string;
          title: string;
          updated_at: string;
          url: string | null;
        };
        Insert: {
          category: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          last_seen_at?: string;
          nps_alert_id?: string | null;
          park_id: string;
          title: string;
          updated_at?: string;
          url?: string | null;
        };
        Update: {
          category?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          last_seen_at?: string;
          nps_alert_id?: string | null;
          park_id?: string;
          title?: string;
          updated_at?: string;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "alerts_park_id_fkey";
            columns: ["park_id"];
            isOneToOne: false;
            referencedRelation: "parks";
            referencedColumns: ["id"];
          }
        ];
      };
      daily_forecast: {
        Row: {
          confidence: "high" | "medium" | "low";
          created_at: string;
          daily_plan: Json | null;
          forecast_date: string;
          generated_at: string;
          headline: string | null;
          hourly_status: number[];
          id: string;
          lot_predictions: Json;
          park_id: string;
          source: "prediction" | "live" | "mixed";
          updated_at: string;
          weather_summary: string | null;
        };
        Insert: {
          confidence: "high" | "medium" | "low";
          created_at?: string;
          daily_plan?: Json | null;
          forecast_date: string;
          generated_at?: string;
          headline?: string | null;
          hourly_status: number[];
          id?: string;
          lot_predictions?: Json;
          park_id: string;
          source: "prediction" | "live" | "mixed";
          updated_at?: string;
          weather_summary?: string | null;
        };
        Update: {
          confidence?: "high" | "medium" | "low";
          created_at?: string;
          daily_plan?: Json | null;
          forecast_date?: string;
          generated_at?: string;
          headline?: string | null;
          hourly_status?: number[];
          id?: string;
          lot_predictions?: Json;
          park_id?: string;
          source?: "prediction" | "live" | "mixed";
          updated_at?: string;
          weather_summary?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "daily_forecast_park_id_fkey";
            columns: ["park_id"];
            isOneToOne: false;
            referencedRelation: "parks";
            referencedColumns: ["id"];
          }
        ];
      };
      lots: {
        Row: {
          created_at: string;
          display_order: number;
          id: string;
          name: string;
          note: string | null;
          park_id: string;
          typical_fill_hour: number | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_order?: number;
          id?: string;
          name: string;
          note?: string | null;
          park_id: string;
          typical_fill_hour?: number | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_order?: number;
          id?: string;
          name?: string;
          note?: string | null;
          park_id?: string;
          typical_fill_hour?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lots_park_id_fkey";
            columns: ["park_id"];
            isOneToOne: false;
            referencedRelation: "parks";
            referencedColumns: ["id"];
          }
        ];
      };
      parks: {
        Row: {
          blurb: string | null;
          created_at: string;
          data_tier: number;
          full_name: string;
          gradient: string;
          id: string;
          is_active: boolean;
          latitude: number;
          longitude: number;
          name: string;
          nps_park_code: string;
          requires_reservation: boolean;
          reservation_note: string | null;
          ridb_facility_ids: string[] | null;
          slug: string;
          state: string;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          blurb?: string | null;
          created_at?: string;
          data_tier: number;
          full_name: string;
          gradient: string;
          id?: string;
          is_active?: boolean;
          latitude: number;
          longitude: number;
          name: string;
          nps_park_code: string;
          requires_reservation?: boolean;
          reservation_note?: string | null;
          ridb_facility_ids?: string[] | null;
          slug: string;
          state: string;
          timezone: string;
          updated_at?: string;
        };
        Update: {
          blurb?: string | null;
          created_at?: string;
          data_tier?: number;
          full_name?: string;
          gradient?: string;
          id?: string;
          is_active?: boolean;
          latitude?: number;
          longitude?: number;
          name?: string;
          nps_park_code?: string;
          requires_reservation?: boolean;
          reservation_note?: string | null;
          ridb_facility_ids?: string[] | null;
          slug?: string;
          state?: string;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      saved_trips: {
        Row: {
          created_at: string;
          end_date: string | null;
          id: string;
          park_id: string;
          start_date: string;
          title: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          end_date?: string | null;
          id?: string;
          park_id: string;
          start_date: string;
          title?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          end_date?: string | null;
          id?: string;
          park_id?: string;
          start_date?: string;
          title?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_trips_park_id_fkey";
            columns: ["park_id"];
            isOneToOne: false;
            referencedRelation: "parks";
            referencedColumns: ["id"];
          }
        ];
      };
      visitation_history: {
        Row: {
          created_at: string;
          dow: number;
          id: string;
          month: number;
          park_id: string;
          relative_busyness: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          dow: number;
          id?: string;
          month: number;
          park_id: string;
          relative_busyness: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          dow?: number;
          id?: string;
          month?: number;
          park_id?: string;
          relative_busyness?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "visitation_history_park_id_fkey";
            columns: ["park_id"];
            isOneToOne: false;
            referencedRelation: "parks";
            referencedColumns: ["id"];
          }
        ];
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
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database["public"];

export type Tables<
  TableName extends keyof PublicSchema["Tables"]
> = PublicSchema["Tables"][TableName]["Row"];

export type TablesInsert<
  TableName extends keyof PublicSchema["Tables"]
> = PublicSchema["Tables"][TableName]["Insert"];

export type TablesUpdate<
  TableName extends keyof PublicSchema["Tables"]
> = PublicSchema["Tables"][TableName]["Update"];
