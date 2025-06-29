import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { createProfile, getProfile, updateProfile } from '../services/profileService'
import { supabase } from '../utils/supabaseClient'

// Compute integer age from birthdate string
function computeAge(dateString: string): number {
  const b = new Date(dateString)
  const today = new Date()
  let age = today.getFullYear() - b.getFullYear()
  const m = today.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--
  return age
}

// Creation schema: expect birthdate instead of age
const ProfileCreateSchema = z.object({
  user_id: z.string().uuid(),
  gender: z.string(),
  birthdate: z.string().refine(s => !isNaN(Date.parse(s)), { message: 'Invalid date format' }),
  quiet_rides: z.boolean(),
  conversation_preference: z.boolean(),
  music_preference: z.boolean(),
  accepted_tos: z.boolean(),
  onboarded: z.boolean(),
})

// Update schema: only the three preferences
const ProfileUpdateSchema = z.object({
  quiet_rides: z.boolean(),
  conversation_preference: z.boolean(),
  music_preference: z.boolean(),
})

export async function createProfileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = ProfileCreateSchema.parse(req.body)
    const age = computeAge(input.birthdate)
    const profile = await createProfile({ ...input, age })
    res.status(201).json({ profile })
  } catch (err) {
    next(err)
  }
}

export async function getProfileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user_id = req.params.user_id
    const profile = await getProfile(user_id)

    const { data: adminData, error: userError } = await supabase.auth.admin.getUserById(user_id)
    if (userError) throw userError

    res.json({
      user: { email: adminData.user.email },
      profile,
    })
  } catch (err: any) {
    if (err.code === 'PGRST116' || /No rows found/.test(err.message)) {
      return res.status(404).send()
    }
    next(err)
  }
}

export async function updateProfileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user_id = req.params.user_id
    const updates = ProfileUpdateSchema.parse(req.body)
    const updated = await updateProfile(user_id, updates)
    res.json({ profile: updated })
  } catch (err) {
    next(err)
  }
}

