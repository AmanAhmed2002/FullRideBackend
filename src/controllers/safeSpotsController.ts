import { Request, Response } from 'express'
import { 
  findSafeSpotByName,
  findSafeSpotByAddress,
  findNearestSafeSpot
} from '../services/safeSpotService'

export const getNearestSafeSpot = async (req: Request, res: Response): Promise<void> => {
  const lat = parseFloat(req.query.lat as string)
  const lng = parseFloat(req.query.lng as string)
  const radius = req.query.radius
    ? parseInt(req.query.radius as string, 10)
    : 500

  if (isNaN(lat) || isNaN(lng)) {
    res.status(400).json({ message: 'Invalid or missing lat/lng parameters' })
    return
  }

  try {
    console.log(`📍 Received proximity search request: (${lat}, ${lng}) within ${radius}m`);
    const spot = await findNearestSafeSpot(lat, lng, radius)
    if (spot) {
      res.json(spot)
    } else {
      res.status(404).json({ message: 'No safe spot found within radius' })
    }
  } catch (err) {
    console.error('❌ getNearestSafeSpot controller error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const getSafeSpotByName = async (req: Request, res: Response): Promise<void> => {
  const name = String(req.query.name || '').trim()
  
  if (!name) {
    res.status(400).json({ message: 'Missing name parameter' })
    return
  }

  try {
    console.log(`🔍 Received name search request: ${name}`);
    const spot = await findSafeSpotByName(name)
    if (spot) {
      res.json(spot)
    } else {
      res.status(404).json({ message: 'No safe spot found with that name' })
    }
  } catch (err) {
    console.error('❌ getSafeSpotByName controller error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const getSafeSpotByAddress = async (req: Request, res: Response): Promise<void> => {
  const address = String(req.query.address || '').trim()
  
  if (!address) {
    res.status(400).json({ message: 'Missing address parameter' })
    return
  }

  try {
    console.log(`🏠 Received address search request: ${address}`);
    const spot = await findSafeSpotByAddress(address)
    if (spot) {
      res.json(spot)
    } else {
      res.status(404).json({ message: 'No safe spot found with that address' })
    }
  } catch (err) {
    console.error('❌ getSafeSpotByAddress controller error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
}
