import { Router } from 'express'
import { geocodePlace } from '../controllers/geocodeController'

const router = Router()

// Corrected endpoint path
router.get('/', geocodePlace)

export default router
