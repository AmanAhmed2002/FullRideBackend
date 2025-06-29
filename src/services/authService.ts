import { supabase } from '../utils/supabaseClient'

export async function signUpUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: process.env.VERIFY_REDIRECT_URL,
    },
  })
  if (error) throw error
  return data.user!
}

export async function signInUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data.session!
}

