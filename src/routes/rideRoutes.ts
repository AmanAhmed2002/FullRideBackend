// src/routes/rideRoutes.ts
import { Router } from 'express';
import {
  createRideHandler,
  getRideHandler,
  getMatchesHandler,
  matchRidesHandler,
  joinRideHandler,
  cancelRideHandler,
  startRideHandler
} from '../controllers/rideController';

const router = Router();

router.post('/', createRideHandler);
router.get('/:ride_id', getRideHandler);
router.get('/:ride_id/matches', getMatchesHandler);
router.get('/match', matchRidesHandler); // New matching endpoint
router.post('/:ride_id/join', joinRideHandler); // Join endpoint
router.post('/:ride_id/cancel', cancelRideHandler); // Cancel endpoint
router.post('/:ride_id/start', startRideHandler); // Start ride endpoint


export default router;

