import { Router } from 'express'
import {
  upsertEventHandler,
  createEventHandler,
  listEventsHandler,
} from '../controllers/eventController'

const router = Router()

router.post('/', upsertEventHandler)
router.post('/create', createEventHandler)
router.get('/', listEventsHandler)

export default router
