import { supabase } from '../utils/supabaseClient'
import { lookupWithSafeSpot } from '../utils/geocode'

export interface NewRideInput {
  creator_id: string
  event_id?: string
  leave_immediately: boolean
  scheduled_time?: string
  allow_stops: boolean
  party_size: number
  mixed_gender_ok: boolean
  departure_address: string
  destination_address: string
}

export async function createRide(data: NewRideInput) {
  console.log('Creating ride with data:', data)
  
  const dep = await lookupWithSafeSpot(data.departure_address, data.event_id)
  const dst = await lookupWithSafeSpot(data.destination_address, data.event_id)
  
  console.log('Departure info:', dep)
  console.log('Destination info:', dst)

  const { data: ride, error } = await supabase
    .from('rides')
    .insert({
      creator_id:          data.creator_id,
      event_id:            data.event_id,
      leave_immediately:   data.leave_immediately,
      scheduled_time:      data.scheduled_time,
      allow_stops:         data.allow_stops,
      party_size:          data.party_size,
      mixed_gender_ok:     data.mixed_gender_ok,
      departure_address:   data.departure_address,
      departure_lat:       dep.lat,
      departure_lng:       dep.lng,
      departure_spot_id:   dep.spot?.id,
      destination_address: data.destination_address,
      destination_lat:     dst.lat,
      destination_lng:     dst.lng,
      destination_spot_id: dst.spot?.id,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Ride creation error:', error)
    throw error
  }
  
  console.log('Ride created with ID:', ride.id)
  return ride.id
}

export async function getRideById(rideId: string) {
  console.log('Fetching ride by ID:', rideId)
  
  const { data: ride, error } = await supabase
    .from('rides')
    .select(`
      *,
      departure_spot: safe_spots!departure_spot_id (
        id, name, address
      ),
      destination_spot: safe_spots!destination_spot_id (
        id, name, address
      )
    `)
    .eq('id', rideId)
    .single()

  if (error) {
    console.error('Ride fetch error:', error)
    throw error
  }
  
  console.log('Fetched ride:', ride)
  return ride
}

export async function getMatchesForRide(rideId: string) {
  throw new Error('getMatchesForRide not yet implemented')
}
