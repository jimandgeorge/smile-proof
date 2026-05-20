-- Add Treatment Results as a 6th review dimension.
-- Existing columns are relabelled (label changes only, no column renames):
--   avg_cleanliness   → "Staff Friendliness"
--   avg_communication → "Communication"
-- New column replaces Cleanliness in the review form and summary view.

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS rating_treatment_results SMALLINT CHECK (rating_treatment_results BETWEEN 1 AND 5);

-- Rebuild summary view to include avg_treatment_results
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
  ) AS avg_anxiety,
  ROUND(
    (COALESCE(SUM(rating_treatment_results) FILTER (WHERE moderation_status = 'published'), 0) + 7 * 3.5) /
    (COUNT(rating_treatment_results) FILTER (WHERE moderation_status = 'published') + 7)::numeric, 2
  ) AS avg_treatment_results
FROM reviews
GROUP BY practice_id
HAVING COUNT(*) FILTER (WHERE moderation_status = 'published') > 0;
