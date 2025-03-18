export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_preferences: {
        Row: {
          id: string
          user_id: string
          family_size: number
          ages: string | null
          dietary_restrictions: string | null
          food_preferences: string | null
          menu_days: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          family_size?: number
          ages?: string | null
          dietary_restrictions?: string | null
          food_preferences?: string | null
          menu_days?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          family_size?: number
          ages?: string | null
          dietary_restrictions?: string | null
          food_preferences?: string | null
          menu_days?: number
          created_at?: string
          updated_at?: string
        }
      }
      shopping_lists: {
        Row: {
          id: string
          user_id: string
          name: string
          items: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          items?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          items?: Json
          created_at?: string
          updated_at?: string
        }
      }
      menu_plans: {
        Row: {
          id: string
          user_id: string
          start_date: string
          end_date: string
          meals: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          start_date: string
          end_date: string
          meals?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          start_date?: string
          end_date?: string
          meals?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}