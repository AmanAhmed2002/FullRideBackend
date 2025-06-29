import { supabase } from '../utils/supabaseClient';
import { geocode } from '../utils/geocode';

async function backfillSafeSpots() {
  // Fetch ALL safe spots regardless of existing coordinates
  const { data: safeSpots, error } = await supabase
    .from('safe_spots')
    .select('id, name, address, location_lat, location_lng');

  if (error) {
    console.error('Error fetching safe spots:', error);
    return;
  }

  console.log(`Processing ${safeSpots.length} safe spots...`);

  for (const [index, spot] of safeSpots.entries()) {
    try {
      console.log(`[${index + 1}/${safeSpots.length}] Geocoding: ${spot.name} - ${spot.address}`);
      
      // Get accurate coordinates from Mapbox
      const { lat, lng } = await geocode(spot.address);
      
      // Update with new coordinates
      const { error: updateError } = await supabase
        .from('safe_spots')
        .update({ 
          location_lat: lat, 
          location_lng: lng 
        })
        .eq('id', spot.id);

      if (updateError) {
        console.error(`Update failed for ${spot.id}:`, updateError);
      } else {
        console.log(`✓ Updated coordinates for "${spot.name}" (${lat}, ${lng})`);
      }
      
      // Respect Mapbox rate limits (100 req/min free tier)
      await new Promise(resolve => setTimeout(resolve, 650));
    } catch (err) {
      console.error(`❌ Failed to geocode ${spot.address}:`, err);
    }
  }

  console.log('Backfill complete!');
}

backfillSafeSpots();
