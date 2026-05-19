import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is not defined. Check your environment variables.');
  throw new Error('supabaseUrl is required. Add VITE_SUPABASE_URL to your environment variables.');
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not defined. Check your environment variables.');
  throw new Error('supabaseAnonKey is required. Add VITE_SUPABASE_ANON_KEY to your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
