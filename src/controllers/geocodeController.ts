import { Request, Response } from 'express'
import { geocode } from '../utils/geocode'

/**
 * GET /api/geocode?place=...
 * Returns { lat, lng } or 400/500 on error.
 */
export const geocodePlace = async (req: Request, res: Response): Promise<void> => {
  const place = String(req.query.place || '').trim()
  if (!place) {
    res.status(400).json({ error: 'Missing place query parameter' })
    return
  }
  try {
    const { lat, lng } = await geocode(place)
    res.json({ lat, lng })
  } catch (err: any) {
    console.error('Geocoding failure:', err)
    res.status(500).json({ error: 'Failed to geocode place' })
  }
}

