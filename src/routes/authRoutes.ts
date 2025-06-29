// server/src/routes/authRoutes.ts
import { Router } from 'express'
import { signUpHandler, signInHandler } from '../controllers/authController'

const router = Router()
router.post('/signup', signUpHandler)
router.post('/signin', signInHandler)
export default router

