import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing:', { supabaseUrl, supabaseAnonKey });
  throw new Error('Supabase URL and Anon Key are required');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'Prefer': 'return=representation',
    },
  },
});

export type Database = {
  public: {
    Tables: {
      trades: {
        Row: {
          id: string;
          ticket: string;
          item: string;
          side: string;
          size: number;
          open_time: string;
          open_price: number;
          close_time: string;
          close_price: number;
          commission: number;
          swap: number;
          profit: number;
          pips: number;
          sl: number | null;
          tp: number | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['trades']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['trades']['Insert']>;
      };
      daily_notes: {
        Row: {
          id: string;
          date_key: string;
          title: string;
          good: string;
          improve: string;
          next_promise: string;
          free: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['daily_notes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['daily_notes']['Insert']>;
      };
      trade_notes: {
        Row: {
          id: string;
          ticket: string;
          entry_emotion: string;
          entry_basis: string[];
          tech_set: string[];
          market_set: string[];
          fund_set: string[];
          fund_note: string;
          exit_triggers: string[];
          exit_emotion: string;
          note_right: string;
          note_wrong: string;
          note_next: string;
          note_free: string;
          tags: string[];
          images: Array<{ id: string; url: string }>;
          ai_advice: string;
          ai_advice_pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['trade_notes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['trade_notes']['Insert']>;
      };
    };
  };
};
