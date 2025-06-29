import { Router } from 'express'
import { 
  getNearestSafeSpot,
  getSafeSpotByName,
  getSafeSpotByAddress
} from '../controllers/safeSpotsController'

const router = Router()

router.get('/nearest', getNearestSafeSpot)
router.get('/by-name', getSafeSpotByName)
router.get('/by-address', getSafeSpotByAddress)

export default router
