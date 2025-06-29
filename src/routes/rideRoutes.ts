// src/routes/rideRoutes.ts
import { Router } from 'express';
import {
  createRideHandler,
  getRideHandler,
  getMatchesHandler,
} from '../controllers/rideController';

const router = Router();

router.post('/', createRideHandler);
router.get('/:ride_id', getRideHandler);
router.get('/:ride_id/matches', getMatchesHandler);

export default router;

