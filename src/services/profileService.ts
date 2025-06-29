import { supabase } from '../utils/supabaseClient'

export interface ProfileInput {
  user_id: string
  gender: string
  age: number
  birthdate: string      // ISO date string YYYY-MM-DD
  quiet_rides: boolean
  conversation_preference: boolean
  music_preference: boolean
  accepted_tos: boolean
  onboarded: boolean
}

export async function createProfile(input: ProfileInput) {
  const { data, error } = await supabase
    .from('profiles')
    .insert([input])
    .select()
  if (error) throw error
  return data?.[0]
}

export async function getProfile(user_id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user_id)
    .single()
  if (error) throw error
  return data
}

export interface ProfileUpdates {
  quiet_rides: boolean
  conversation_preference: boolean
  music_preference: boolean
}

export async function updateProfile(user_id: string, updates: ProfileUpdates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', user_id)
    .select()
  if (error) throw error
  return data?.[0]
}

