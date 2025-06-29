import fetch from 'cross-fetch'
import { supabase } from './supabaseClient'
import { 
  findSafeSpotByName,
  findSafeSpotByAddress,
  findNearestSafeSpot
} from '../services/safeSpotService'

const token = process.env.MAPBOX_TOKEN
if (!token) {
  throw new Error('Missing MAPBOX_TOKEN in environment')
}

export async function geocode(address: string): Promise<{ lat: number; lng: number }> {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    address,
  )}.json?access_token=${token}&limit=1`

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Geocoding request failed: ${res.statusText}`)
  }

  const data = await res.json()
  if (!data.features?.length) {
    throw new Error(`No geocoding results for "${address}"`)
  }

  const [lng, lat] = data.features[0].geometry.coordinates
  return { lat, lng }
}

export async function lookupWithSafeSpot(
  address: string,
  eventId?: string
): Promise<{
  lat: number
  lng: number
  spot: { id: string; name: string; address: string } | null
}> {
  try {
    // First try name match
    const nameSpot = await findSafeSpotByName(address)
    if (nameSpot) {
      return { 
        lat: nameSpot.location_lat, 
        lng: nameSpot.location_lng, 
        spot: {
          id: nameSpot.id,
          name: nameSpot.name,
          address: nameSpot.address
        }
      }
    }

    // Then try address match
    const addressSpot = await findSafeSpotByAddress(address)
    if (addressSpot) {
      return { 
        lat: addressSpot.location_lat, 
        lng: addressSpot.location_lng, 
        spot: {
          id: addressSpot.id,
          name: addressSpot.name,
          address: addressSpot.address
        }
      }
    }

    // Fallback to geocoding
    const { lat, lng } = await geocode(address)
    
    // Find nearest safe spot using coordinates
    const nearestSpot = await findNearestSafeSpot(lat, lng, 500)
    if (nearestSpot) {
      return {
        lat: nearestSpot.location_lat,
        lng: nearestSpot.location_lng,
        spot: {
          id: nearestSpot.id,
          name: nearestSpot.name,
          address: nearestSpot.address
        }
      }
    }

    return { lat, lng, spot: null }
  } catch (error) {
    console.error(`Safe spot lookup failed for ${address}:`, error)
    throw error
  }
}

export default geocode
