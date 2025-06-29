import { Router, RequestHandler } from 'express'
import {
  createProfileHandler,
  getProfileHandler,
  updateProfileHandler,
} from '../controllers/profileController'

const router = Router()

router.post('/', createProfileHandler as RequestHandler)
router.get('/:user_id', getProfileHandler as RequestHandler)
router.patch('/:user_id', updateProfileHandler as RequestHandler)

export default router

