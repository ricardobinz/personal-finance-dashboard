import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // This will help during local dev if env vars are missing
  console.warn('Supabase env vars are missing. Define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in client/.env')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')
