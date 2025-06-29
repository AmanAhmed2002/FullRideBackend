import { NextFunction, Request, Response } from 'express'
import * as rideService from '../services/rideService'

export async function createRideHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = await rideService.createRide(req.body)
    res.status(201).json({ id })
  } catch (err) {
    next(err)
  }
}

export async function getRideHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const ride = await rideService.getRideById(req.params.ride_id)
    res.json(ride)
  } catch (err) {
    next(err)
  }
}

export async function getMatchesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await rideService.getMatchesForRide(req.params.ride_id)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

