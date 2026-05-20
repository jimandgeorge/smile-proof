-- ============================================================
-- Security fixes for Supabase Security Advisor warnings
-- ============================================================

-- ── 1. Enable RLS on tables that were missing it ─────────────

ALTER TABLE practices           ENABLE ROW LEVEL SECURITY;
ALTER TABLE dentists            ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_dentists   ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_responses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_flags        ENABLE ROW LEVEL SECURITY;

-- practices: public read; owner can update their own listing (all writes use service role in practice)
DROP POLICY IF EXISTS "practices_public_read" ON practices;
CREATE POLICY "practices_public_read"
  ON practices FOR SELECT USING (true);

DROP POLICY IF EXISTS "practices_owner_update" ON practices;
CREATE POLICY "practices_owner_update"
  ON practices FOR UPDATE TO authenticated
  USING (claimed_by_user_id = (select auth.uid()));

-- dentists / practice_dentists / treatments: reference data, public read only
DROP POLICY IF EXISTS "dentists_public_read" ON dentists;
CREATE POLICY "dentists_public_read"
  ON dentists FOR SELECT USING (true);

DROP POLICY IF EXISTS "practice_dentists_public_read" ON practice_dentists;
CREATE POLICY "practice_dentists_public_read"
  ON practice_dentists FOR SELECT USING (true);

DROP POLICY IF EXISTS "treatments_public_read" ON treatments;
CREATE POLICY "treatments_public_read"
  ON treatments FOR SELECT USING (true);

-- practice_responses: public read (responses to reviews are visible); writes via service role
DROP POLICY IF EXISTS "practice_responses_public_read" ON practice_responses;
CREATE POLICY "practice_responses_public_read"
  ON practice_responses FOR SELECT USING (true);

-- review_flags: anyone can insert a flag; no SELECT for anon/authenticated (admin reads via service role)
DROP POLICY IF EXISTS "review_flags_anyone_insert" ON review_flags;
CREATE POLICY "review_flags_anyone_insert"
  ON review_flags FOR INSERT WITH CHECK (true);


-- ── 2. Fix Auth RLS Initialization Plan on reviews ──────────
-- Replace bare auth.uid() with (select auth.uid()) so it is evaluated
-- once per statement rather than once per row.

DROP POLICY IF EXISTS "Users insert their own reviews"  ON reviews;
DROP POLICY IF EXISTS "Users edit their own recent reviews" ON reviews;
DROP POLICY IF EXISTS "Users can claim reviews by email" ON reviews;

CREATE POLICY "Users insert their own reviews"
  ON reviews FOR INSERT TO authenticated
  WITH CHECK (reviewer_user_id = (select auth.uid()));

CREATE POLICY "Users edit their own recent reviews"
  ON reviews FOR UPDATE TO authenticated
  USING (
    reviewer_user_id = (select auth.uid())
    AND created_at > now() - interval '30 days'
  );

CREATE POLICY "Users can claim reviews by email"
  ON reviews FOR UPDATE TO authenticated
  USING (
    reviewer_email = (SELECT email FROM auth.users WHERE id = (select auth.uid()))
    AND reviewer_user_id IS NULL
  )
  WITH CHECK (reviewer_user_id = (select auth.uid()));


-- ── 3. Fix Security Definer Views ───────────────────────────
-- Recreate both aggregated views with security_invoker = true so they
-- respect the caller's RLS context rather than the definer's privileges.

CREATE OR REPLACE VIEW practice_rating_summary
  WITH (security_invoker = true)
AS
SELECT
  practice_id,
  COUNT(*) FILTER (WHERE moderation_status = 'published') AS review_count,
  COUNT(*) FILTER (WHERE moderation_status = 'published' AND verification_status = 'verified') AS verified_count,
  ROUND(
    (COALESCE(SUM(rating_overall) FILTER (WHERE moderation_status = 'published'), 0) + 7 * 3.5) /
    (COUNT(*) FILTER (WHERE moderation_status = 'published') + 7)::numeric, 2
  ) AS avg_overall,
  ROUND(
    (COALESCE(SUM(rating_pain_management) FILTER (WHERE moderation_status = 'published'), 0) + 7 * 3.5) /
    (COUNT(rating_pain_management) FILTER (WHERE moderation_status = 'published') + 7)::numeric, 2
  ) AS avg_pain,
  ROUND(
    (COALESCE(SUM(rating_communication) FILTER (WHERE moderation_status = 'published'), 0) + 7 * 3.5) /
    (COUNT(rating_communication) FILTER (WHERE moderation_status = 'published') + 7)::numeric, 2
  ) AS avg_communication,
  ROUND(
    (COALESCE(SUM(rating_cost_transparency) FILTER (WHERE moderation_status = 'published'), 0) + 7 * 3.5) /
    (COUNT(rating_cost_transparency) FILTER (WHERE moderation_status = 'published') + 7)::numeric, 2
  ) AS avg_cost,
  ROUND(
    (COALESCE(SUM(rating_cleanliness) FILTER (WHERE moderation_status = 'published'), 0) + 7 * 3.5) /
    (COUNT(rating_cleanliness) FILTER (WHERE moderation_status = 'published') + 7)::numeric, 2
  ) AS avg_cleanliness,
  ROUND(
    (COALESCE(SUM(rating_anxiety_handling) FILTER (WHERE moderation_status = 'published'), 0) + 7 * 3.5) /
    (COUNT(rating_anxiety_handling) FILTER (WHERE moderation_status = 'published') + 7)::numeric, 2
  ) AS avg_anxiety
FROM reviews
GROUP BY practice_id
HAVING COUNT(*) FILTER (WHERE moderation_status = 'published') > 0;

CREATE OR REPLACE VIEW practice_price_summary
  WITH (security_invoker = true)
AS
SELECT
  pr.practice_id,
  pr.treatment_id,
  t.name        AS treatment_name,
  t.category    AS treatment_category,
  t.nhs_band    AS treatment_nhs_band,
  pr.payment_type,
  COUNT(*)::integer                                  AS report_count,
  ROUND(AVG(pr.amount_pence)::numeric, 0)::integer   AS avg_pence,
  MIN(pr.amount_pence)                               AS min_pence,
  MAX(pr.amount_pence)                               AS max_pence
FROM price_reports pr
JOIN treatments t ON t.id = pr.treatment_id
GROUP BY pr.practice_id, pr.treatment_id, t.name, t.category, t.nhs_band, pr.payment_type;


-- ── 4. Fix Function Search Path Mutable ─────────────────────
-- Recreate practices_near with a fixed search_path to prevent
-- search_path injection attacks.

DROP FUNCTION IF EXISTS practices_near(float, float, float);

CREATE FUNCTION practices_near(
  lat       float,
  lng       float,
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
SET search_path = public, pg_catalog
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
