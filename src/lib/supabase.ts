import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Get environment variables with proper fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tujaxamxrdkkdvwnjcxh.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1amF4YW14cmRra2R2d25qY3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NjY1NTIsImV4cCI6MjA3MDI0MjU1Mn0.GFYUmFzn0kbPSym0JZjadpqUwEwvwHfjo59K2VEm6eA";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
