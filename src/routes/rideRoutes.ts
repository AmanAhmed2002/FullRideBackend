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
import { RequestHandler } from 'express'; // Fixed import

const router = Router();

router.post('/', createRideHandler as RequestHandler);
router.get('/match', matchRidesHandler as RequestHandler);
router.get('/:ride_id', getRideHandler as RequestHandler);
router.get('/:ride_id/matches', getMatchesHandler as RequestHandler);
router.post('/:ride_id/join', joinRideHandler as RequestHandler);
router.post('/:ride_id/cancel', cancelRideHandler as RequestHandler);
router.post('/:ride_id/start', startRideHandler as RequestHandler);

export default router;
