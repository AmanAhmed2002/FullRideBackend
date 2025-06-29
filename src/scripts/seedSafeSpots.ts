// server/src/scripts/seedSafeSpots.ts
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { geocode } from '../utils/geocode';

//
// 1) Explicitly load the .env that lives at the root of the `server/` folder.
//    __dirname here === server/src/scripts
dotenv.config({ path: resolve(__dirname, '../../.env') });

interface SafeSpot {
  name: string;
  address: string;
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) throw new Error('Missing SUPABASE_URL in .env');
if (!supabaseKey) throw new Error('Missing SUPABASE_KEY in .env');

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedSafeSpots() {
  const jsonPath = resolve(__dirname, 'safeSpots.json');
  const safeSpots: SafeSpot[] = JSON.parse(
    readFileSync(jsonPath, 'utf-8')
  );

  for (const { name, address } of safeSpots) {
    try {
      const { lat, lng } = await geocode(address);
      const { error } = await supabase
        .from('safe_spots')
        .insert({
          name,
          address,
          location_lat: lat,
          location_lng: lng,
          description: ''
        });
      if (error) {
        console.error(`❌ Insert failed for "${name}":`, error.message);
      } else {
        console.log(`✅ Inserted "${name}"`);
      }
    } catch (e) {
      console.error(`⚠️ Geocode failed for "${name}":`, (e as Error).message);
    }
  }

  console.log('✅ Done seeding safe_spots.');
  process.exit(0);
}

seedSafeSpots();

