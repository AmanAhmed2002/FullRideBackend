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
 // console.log ('Ride data to insert:', rideData)
  const { data: ride, error } = await supabase
    .from('rides')
    .insert({
      creator_id:          data.creator_id,
      event_id:            data.event_id || null,
      leave_immediately:   data.leave_immediately,
      scheduled_time:      data.leave_immediately ? null : data.scheduled_time,
      allow_stops:         data.allow_stops,
      party_size:          data.party_size,
      mixed_gender_ok:     data.mixed_gender_ok,
      departure_address:   data.departure_address,
      departure_lat:       dep.lat,
      departure_lng:       dep.lng,
      departure_spot_id:   dep.spot?.id || null,
      destination_address: data.destination_address,
      destination_lat:     dst.lat,
      destination_lng:     dst.lng,
      destination_spot_id: dst.spot?.id || null,
      status:              'waiting'
    })
    .select('id')
    .single()

  if (error) {
    console.error('Ride creation error:', JSON.stringify(error, null, 2))
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
      participants: ride_participants (user_id, party_count),
      creator: profiles!creator_id (user_id, gender, quiet_rides, conversation_preference, music_preference),
      departure_spot: safe_spots!departure_spot_id (id, name, address),
      destination_spot: safe_spots!destination_spot_id (id, name, address)
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

export async function joinRide(rideId: string, userId: string, partyCount: number) {
  console.log(`Joining ride ${rideId} with user ${userId}, party: ${partyCount}`)
  
  const { error } = await supabase
    .from('ride_participants')
    .insert({
      ride_id: rideId,
      user_id: userId,
      party_count: partyCount
    })

  if (error) {
    console.error('Join ride error:', error)
    throw error
  }
  
  console.log('Join successful')
}

export async function findMatchingRides(criteria: any) {
  // Parse parameters with proper type conversion
  const departure_lat = parseFloat(criteria.departure_lat)
  const departure_lng = parseFloat(criteria.departure_lng)
  const destination_lat = parseFloat(criteria.destination_lat)
  const destination_lng = parseFloat(criteria.destination_lng)
  const leave_immediately = criteria.leave_immediately === 'true'
  const allow_stops = criteria.allow_stops === 'true'
  const mixed_gender_ok = criteria.mixed_gender_ok === 'true'
  const party_size = parseInt(criteria.party_size, 10)
  const user_id = criteria.user_id
  const event_id = criteria.event_id

  // Validate required parameters
  if (isNaN(departure_lat)) throw new Error('Invalid departure_lat')
  if (isNaN(departure_lng)) throw new Error('Invalid departure_lng')
  if (isNaN(destination_lat)) throw new Error('Invalid destination_lat')
  if (isNaN(destination_lng)) throw new Error('Invalid destination_lng')
  if (isNaN(party_size)) throw new Error('Invalid party_size')

  console.log('Searching for matching rides with criteria:', {
    departure_lat,
    departure_lng,
    destination_lat,
    destination_lng,
    leave_immediately,
    allow_stops,
    mixed_gender_ok,
    party_size,
    user_id,
    event_id
  })

  // Get active rides (within 10 min window)
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  
  let query = supabase
    .from('rides')
    .select(`
      *,
      participants: ride_participants (user_id, party_count),
      creator: profiles!creator_id (user_id, gender, quiet_rides, conversation_preference, music_preference),
      departure_spot: safe_spots!departure_spot_id (id, name, address),
      destination_spot: safe_spots!destination_spot_id (id, name, address)
    `)
    .gte('created_at', tenMinutesAgo)
    .eq('status', 'waiting')
    .eq('leave_immediately', leave_immediately)
    .eq('allow_stops', allow_stops)
    .eq('mixed_gender_ok', mixed_gender_ok)

  if (event_id && event_id !== 'none') {
    query = query.eq('event_id', event_id)
  }

  const { data: rides, error } = await query

  if (error) {
    console.error('Ride query error:', error)
    throw error
  }
  
  if (!rides || rides.length === 0) {
    console.log('No active rides found')
    return []
  }

  console.log(`Found ${rides.length} potential rides before filtering`)

  // Get joiner's gender for matching
  const { data: joinerProfile } = await supabase
    .from('profiles')
    .select('gender')
    .eq('user_id', user_id)
    .single()

  const joinerGender = joinerProfile?.gender || ''
  console.log(`Joiner gender: ${joinerGender}`)

  // Filter rides by proximity and capacity
  const filteredRides = rides.filter(ride => {
    // Calculate distance using Haversine formula
    const depDistance = calculateDistance(
      departure_lat, departure_lng,
      ride.departure_lat, ride.departure_lng
    )
    
    const destDistance = calculateDistance(
      destination_lat, destination_lng,
      ride.destination_lat, ride.destination_lng
    )
    
    // Check proximity (500m threshold)
    if (depDistance > 500 || destDistance > 500) {
      console.log(`Ride ${ride.id} failed proximity check: ${depDistance}m, ${destDistance}m`)
      return false
    }

    // Calculate total participants
    const totalParticipants = ride.participants?.reduce(
      (sum: number, p: any) => sum + p.party_count, 0
    ) || 0
    
    // Check capacity
    if (totalParticipants + party_size > 4) {
      console.log(`Ride ${ride.id} failed capacity check: ${totalParticipants} + ${party_size} > 4`)
      return false
    }

    // Check gender preference if strict
    if (!mixed_gender_ok && ride.creator?.gender !== joinerGender) {
      console.log(`Ride ${ride.id} failed gender check: ${ride.creator?.gender} vs ${joinerGender}`)
      return false
    }

    console.log(`Ride ${ride.id} passed all checks`)
    return true
  })

  console.log(`Found ${filteredRides.length} matching rides`)
  return filteredRides
}

// Haversine distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3 // Earth radius in meters
  const φ1 = lat1 * Math.PI/180
  const φ2 = lat2 * Math.PI/180
  const Δφ = (lat2 - lat1) * Math.PI/180
  const Δλ = (lon2 - lon1) * Math.PI/180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c
}
