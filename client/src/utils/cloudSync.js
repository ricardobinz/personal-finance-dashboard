import { supabase } from '../lib/supabase.js'

const TABLE = 'pf_data'

export async function loadUserData(userId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('data')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
    throw error
  }

  return data?.data ?? null
}

export async function saveUserData(userId, payload) {
  const row = {
    user_id: userId,
    data: payload,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from(TABLE)
    .upsert(row, { onConflict: 'user_id' })

  if (error) throw error
  return true
}
