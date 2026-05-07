// scripts/seed-sample.ts
// Inserts sample UK dental practices for local testing.
// Run: npx tsx scripts/seed-sample.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const practices = [
  // London
  { slug: 'central-dental-london', name: 'Central Dental Care', address_line1: '12 Oxford Street', city: 'London', postcode: 'W1D 1BS', latitude: 51.5152, longitude: -0.1418, practice_type: 'mixed', phone: '020 7123 4567' },
  { slug: 'smile-studio-soho', name: 'Smile Studio Soho', address_line1: '45 Wardour Street', city: 'London', postcode: 'W1F 8HX', latitude: 51.5128, longitude: -0.1337, practice_type: 'private', phone: '020 7234 5678' },
  { slug: 'kings-road-dental', name: "King's Road Dental", address_line1: '188 Kings Road', city: 'London', postcode: 'SW3 5XP', latitude: 51.4882, longitude: -0.1706, practice_type: 'private', phone: '020 7345 6789' },
  { slug: 'islington-dental-practice', name: 'Islington Dental Practice', address_line1: '72 Upper Street', city: 'London', postcode: 'N1 0NY', latitude: 51.5362, longitude: -0.1027, practice_type: 'nhs', phone: '020 7456 7890' },
  { slug: 'brixton-dental-centre', name: 'Brixton Dental Centre', address_line1: '34 Coldharbour Lane', city: 'London', postcode: 'SE5 9NR', latitude: 51.4614, longitude: -0.1157, practice_type: 'mixed', phone: '020 7567 8901' },
  { slug: 'hackney-smile-clinic', name: 'Hackney Smile Clinic', address_line1: '101 Mare Street', city: 'London', postcode: 'E8 4RU', latitude: 51.5440, longitude: -0.0554, practice_type: 'nhs', phone: '020 7678 9012' },

  // Manchester
  { slug: 'manchester-dental-studio', name: 'Manchester Dental Studio', address_line1: '5 Deansgate', city: 'Manchester', postcode: 'M3 2FF', latitude: 53.4793, longitude: -2.2467, practice_type: 'mixed', phone: '0161 123 4567' },
  { slug: 'northern-quarter-dental', name: 'Northern Quarter Dental', address_line1: '22 Tib Street', city: 'Manchester', postcode: 'M4 1LA', latitude: 53.4843, longitude: -2.2323, practice_type: 'private', phone: '0161 234 5678' },
  { slug: 'didsbury-dental-care', name: 'Didsbury Dental Care', address_line1: '14 Wilmslow Road', city: 'Manchester', postcode: 'M20 2RN', latitude: 53.4136, longitude: -2.2286, practice_type: 'mixed', phone: '0161 345 6789' },

  // Birmingham
  { slug: 'birmingham-city-dental', name: 'Birmingham City Dental', address_line1: '88 New Street', city: 'Birmingham', postcode: 'B2 4BA', latitude: 52.4796, longitude: -1.8990, practice_type: 'mixed', phone: '0121 123 4567' },
  { slug: 'harborne-dental-practice', name: 'Harborne Dental Practice', address_line1: '103 High Street', city: 'Birmingham', postcode: 'B17 9PT', latitude: 52.4661, longitude: -1.9572, practice_type: 'nhs', phone: '0121 234 5678' },
  { slug: 'jewellery-quarter-smiles', name: 'Jewellery Quarter Smiles', address_line1: '17 Vyse Street', city: 'Birmingham', postcode: 'B18 6LT', latitude: 52.4882, longitude: -1.9127, practice_type: 'private', phone: '0121 345 6789' },

  // Leeds
  { slug: 'leeds-city-dental', name: 'Leeds City Dental', address_line1: '3 Albion Street', city: 'Leeds', postcode: 'LS1 5ER', latitude: 53.7996, longitude: -1.5491, practice_type: 'mixed', phone: '0113 123 4567' },
  { slug: 'headingley-dental', name: 'Headingley Dental Practice', address_line1: '56 Otley Road', city: 'Leeds', postcode: 'LS6 2AL', latitude: 53.8214, longitude: -1.5768, practice_type: 'nhs', phone: '0113 234 5678' },

  // Edinburgh
  { slug: 'edinburgh-dental-institute', name: 'Edinburgh Dental Institute', address_line1: '30 Lauriston Place', city: 'Edinburgh', postcode: 'EH3 9DZ', latitude: 55.9435, longitude: -3.1972, practice_type: 'nhs', phone: '0131 123 4567' },
  { slug: 'new-town-dental-edinburgh', name: 'New Town Dental', address_line1: '42 George Street', city: 'Edinburgh', postcode: 'EH2 2LE', latitude: 55.9531, longitude: -3.1993, practice_type: 'private', phone: '0131 234 5678' },

  // Bristol
  { slug: 'bristol-dental-rooms', name: 'Bristol Dental Rooms', address_line1: '10 Park Street', city: 'Bristol', postcode: 'BS1 5HX', latitude: 51.4528, longitude: -2.5997, practice_type: 'private', phone: '0117 123 4567' },
  { slug: 'clifton-dental-studio', name: 'Clifton Dental Studio', address_line1: '92 Whiteladies Road', city: 'Bristol', postcode: 'BS8 2QN', latitude: 51.4631, longitude: -2.6090, practice_type: 'mixed', phone: '0117 234 5678' },

  // Cardiff
  { slug: 'cardiff-bay-dental', name: 'Cardiff Bay Dental', address_line1: '8 Mermaid Quay', city: 'Cardiff', postcode: 'CF10 5BZ', latitude: 51.4638, longitude: -3.1644, practice_type: 'mixed', phone: '029 2012 3456' },
  { slug: 'cathays-dental-centre', name: 'Cathays Dental Centre', address_line1: '67 Crwys Road', city: 'Cardiff', postcode: 'CF24 4NN', latitude: 51.4936, longitude: -3.1729, practice_type: 'nhs', phone: '029 2023 4567' },

  // Liverpool
  { slug: 'liverpool-one-dental', name: 'Liverpool ONE Dental', address_line1: '5 South John Street', city: 'Liverpool', postcode: 'L1 8BN', latitude: 53.4020, longitude: -2.9836, practice_type: 'mixed', phone: '0151 123 4567' },
  { slug: 'lark-lane-dental', name: 'Lark Lane Dental', address_line1: '44 Lark Lane', city: 'Liverpool', postcode: 'L17 8UU', latitude: 53.3801, longitude: -2.9530, practice_type: 'private', phone: '0151 234 5678' },
];

async function main() {
  console.log(`Inserting ${practices.length} sample practices…`);
  const { error } = await supabase.from('practices').upsert(practices, { onConflict: 'slug' });
  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
  console.log('Done.');
}

main();
