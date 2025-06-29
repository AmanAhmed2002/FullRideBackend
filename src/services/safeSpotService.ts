import { supabase } from '../utils/supabaseClient'

export interface SafeSpot {
  id: string
  name: string
  address: string
  location_lat: number
  location_lng: number
}

export async function findSafeSpotByName(name: string): Promise<SafeSpot | null> {
  try {
    const { data, error } = await supabase
      .from('safe_spots')
      .select('*')
      .ilike('name', `%${name}%`)
      .limit(1)
      .single()

    if (error || !data) return null
    return data as SafeSpot
  } catch (err) {
    console.error('findSafeSpotByName error:', err)
    return null
  }
}

export async function findSafeSpotByAddress(address: string): Promise<SafeSpot | null> {
  try {
    const { data, error } = await supabase
      .from('safe_spots')
      .select('*')
      .ilike('address', `%${address}%`)
      .limit(1)
      .single()

    if (error || !data) return null
    return data as SafeSpot
  } catch (err) {
    console.error('findSafeSpotByAddress error:', err)
    return null
  }
}

export async function findNearestSafeSpot(lat: number, lng: number, radius: number): Promise<SafeSpot | null> {
  try {
    console.log(`🔍 [Proximity Search] Searching near (${lat}, ${lng}) within ${radius}m radius...`);
    
    const { data, error } = await supabase
      .rpc('find_nearest_safe_spot_v2', {
        latitude: lat,
        longitude: lng,
        max_distance: radius
      })
      .single()

    if (error) {
      console.error('❌ [Proximity Search] RPC error:', error);
      return null;
    }
    
    if (!data) {
      console.log('ℹ️ [Proximity Search] No safe spots found');
      return null;
    }
    
    const result = data as {
      id: string;
      name: string;
      address: string;
      location_lat: number;
      location_lng: number;
    };
    
    console.log(`✅ [Proximity Search] Found: ${result.name} (${result.address})`);
    
    return {
      id: result.id,
      name: result.name,
      address: result.address,
      location_lat: result.location_lat,
      location_lng: result.location_lng
    };
  } catch (err) {
    console.error('❌ [Proximity Search] Error:', err);
    return null;
  }
}
