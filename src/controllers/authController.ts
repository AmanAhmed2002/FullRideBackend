// server/src/controllers/authController.ts
import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { signUpUser, signInUser } from '../services/authService'

const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  accepted_tos: z.boolean(),
})

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function signUpHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = SignUpSchema.parse(req.body)
    const user = await signUpUser(email, password)
    res.status(201).json({ user })
  } catch (err) {
    next(err)
  }
}

export async function signInHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = SignInSchema.parse(req.body)
    const session = await signInUser(email, password)
    res.status(200).json({ session })
  } catch (err) {
    next(err)
  }
}

