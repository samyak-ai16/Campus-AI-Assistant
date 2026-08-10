import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  const message = "Missing Supabase environment variables. Make sure you have a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.";
  console.error(`[Supabase] ${message}`);
  throw new Error(message);
}

// This line fixes your first error by properly exporting the client!
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);