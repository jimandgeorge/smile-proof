-- RPC: find practices within radius_km of a lat/lng point
-- Uses Haversine formula — no extensions required
CREATE OR REPLACE FUNCTION practices_near(
  lat  float,
  lng  float,
  radius_km float DEFAULT 10
)
RETURNS TABLE (
  id            uuid,
  slug          text,
  name          text,
  address_line1 text,
  city          text,
  postcode      text,
  practice_type text,
  phone         text,
  website       text,
  latitude      numeric,
  longitude     numeric,
  distance_km   float
)
LANGUAGE sql
STABLE
AS $$
  SELECT * FROM (
    SELECT
      id, slug, name, address_line1, city, postcode,
      practice_type, phone, website, latitude, longitude,
      (
        6371 * acos(
          LEAST(1.0,
            cos(radians(lat)) * cos(radians(latitude::float)) *
            cos(radians(longitude::float) - radians(lng)) +
            sin(radians(lat)) * sin(radians(latitude::float))
          )
        )
      ) AS distance_km
    FROM practices
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL
  ) sub
  WHERE distance_km <= radius_km
  ORDER BY distance_km
  LIMIT 30;
$$;
