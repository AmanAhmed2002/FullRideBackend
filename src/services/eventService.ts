import { supabase } from '../utils/supabaseClient'
import geocode from '../utils/geocode'

export interface EventInput {
  name: string
  address: string
}

export async function getOrCreateEvent(input: EventInput) {
  console.log(`Getting or creating event: ${input.name}`)
  
  const { data: existing, error: fetchErr } = await supabase
    .from('events')
    .select('*')
    .eq('name', input.name)
    .maybeSingle()
    
  if (fetchErr) {
    console.error('Event fetch error:', fetchErr)
    throw fetchErr
  }
  
  if (existing) {
    console.log('Found existing event:', existing)
    return existing
  }

  console.log('Creating new event...')
  return createEvent(input)
}

export async function createEvent(input: EventInput) {
  console.log(`Creating event: ${input.name} at ${input.address}`)
  
  const { lat, lng } = await geocode(input.address)
  
  console.log(`Event location: ${lat}, ${lng}`)

  const { data: created, error } = await supabase
    .from('events')
    .insert({ 
      name: input.name, 
      address: input.address,
      location_lat: lat, 
      location_lng: lng 
    })
    .select('id')
    .single()

  if (error) {
    console.error('Event creation error:', error)
    throw error
  }
  
  console.log('Event created with ID:', created.id)
  return created
}

export async function listEvents() {
  console.log('Listing events...')
  
  const { data, error } = await supabase
    .from('events')
    .select('id, name')
    
  if (error) {
    console.error('Events list error:', error)
    throw error
  }
  
  console.log(`Found ${data.length} events`)
  return data
}
