-- Replace practices_near with a version that includes review stats
DROP FUNCTION IF EXISTS practices_near(float, float, float);

CREATE FUNCTION practices_near(
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
  distance_km   float,
  review_count  bigint,
  avg_overall   numeric
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    sub.*,
    COALESCE(s.review_count, 0) AS review_count,
    s.avg_overall
  FROM (
    SELECT
      p.id, p.slug, p.name, p.address_line1, p.city, p.postcode,
      p.practice_type, p.phone, p.website, p.latitude, p.longitude,
      (
        6371 * acos(
          LEAST(1.0,
            cos(radians(lat)) * cos(radians(p.latitude::float)) *
            cos(radians(p.longitude::float) - radians(lng)) +
            sin(radians(lat)) * sin(radians(p.latitude::float))
          )
        )
      ) AS distance_km
    FROM practices p
    WHERE p.latitude IS NOT NULL AND p.longitude IS NOT NULL
  ) sub
  LEFT JOIN practice_rating_summary s ON s.practice_id = sub.id
  WHERE sub.distance_km <= radius_km
  ORDER BY sub.distance_km
  LIMIT 30;
$$;
