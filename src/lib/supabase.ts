import { createClient } from '@supabase/supabase-js';
<<<<<<< HEAD
import { Database } from '../types/supabase';
=======
>>>>>>> eead2da (Small Changes)

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

<<<<<<< HEAD
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
=======
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
>>>>>>> eead2da (Small Changes)
