import { NextFunction, Request, Response } from 'express'
import * as rideService from '../services/rideService'
import { supabase } from '../utils/supabaseClient'

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

// Matching handler
export async function matchRidesHandler(req: Request, res: Response) {
  try {
    // Pass all query parameters directly
    const matches = await rideService.findMatchingRides(req.query)
    res.json({ matches })
  } catch (err: any) {
    console.error('Matching error:', err)
    res.status(500).json({ error: err.message || 'Matching failed' })
  }
}

// Join ride handler
export async function joinRideHandler(req: Request, res: Response) {
  try {
    const rideId = req.params.ride_id
    const { user_id, party_count } = req.body
    
    // Join the ride
    await rideService.joinRide(rideId, user_id, party_count)
    
    // Check if ride is now full
    const ride = await rideService.getRideById(rideId)
    const totalParticipants = ride.participants.reduce(
      (sum: number, p: any) => sum + p.party_count, 0
    )
    
    console.log(`Total participants after join: ${totalParticipants}`)
    
    if (totalParticipants >= 4) {
      console.log(`Ride ${rideId} is now full`)
      await supabase
        .from('rides')
        .update({ status: 'full' })
        .eq('id', rideId)
    }
    
    res.json({ success: true })
  } catch (err: any) {
    console.error('Join error:', err)
    res.status(400).json({ error: err.message || 'Join failed' })
  }
}

// Cancel ride handler
export async function cancelRideHandler(req: Request, res: Response) {
  try {
    const rideId = req.params.ride_id
    console.log(`Cancelling ride ${rideId}`)
    
    await supabase
      .from('rides')
      .update({ status: 'cancelled' })
      .eq('id', rideId)
    
    res.json({ success: true })
  } catch (err: any) {
    console.error('Cancel error:', err)
    res.status(500).json({ error: err.message || 'Cancellation failed' })
  }
}

// Start ride handler
export async function startRideHandler(req: Request, res: Response) {
  try {
    const rideId = req.params.ride_id
    console.log(`Starting ride ${rideId}`)
    
    await supabase
      .from('rides')
      .update({ status: 'active' })
      .eq('id', rideId)
    
    res.json({ success: true })
  } catch (err: any) {
    console.error('Start error:', err)
    res.status(500).json({ error: err.message || 'Failed to start ride' })
  }
}
