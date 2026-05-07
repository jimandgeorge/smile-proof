-- Replace plain AVG with a Bayesian weighted average.
-- A prior of 7 neutral reviews (3.5★) is blended in so that practices
-- with few reviews don't show extreme scores. Effect diminishes as
-- real reviews accumulate.
--
-- Formula: (sum_of_ratings + 7 * 3.5) / (count_of_ratings + 7)
-- With 1 real review: score is pulled ~87% toward 3.5
-- With 7 real reviews: score is pulled ~50% toward 3.5
-- With 20 real reviews: score is pulled ~26% toward 3.5

CREATE OR REPLACE VIEW practice_rating_summary AS
SELECT
  practice_id,
  COUNT(*) FILTER (WHERE moderation_status = 'published') AS review_count,
  COUNT(*) FILTER (WHERE moderation_status = 'published' AND verification_status = 'verified') AS verified_count,

  -- Overall (required field, always non-null)
  ROUND(
    (COALESCE(SUM(rating_overall) FILTER (WHERE moderation_status = 'published'), 0) + 7 * 3.5) /
    (COUNT(*) FILTER (WHERE moderation_status = 'published') + 7)::numeric,
    2
  ) AS avg_overall,

  -- Sub-dimensions (optional, may be null — COUNT(col) skips nulls)
  ROUND(
    (COALESCE(SUM(rating_pain_management) FILTER (WHERE moderation_status = 'published'), 0) + 7 * 3.5) /
    (COUNT(rating_pain_management) FILTER (WHERE moderation_status = 'published') + 7)::numeric,
    2
  ) AS avg_pain,

  ROUND(
    (COALESCE(SUM(rating_communication) FILTER (WHERE moderation_status = 'published'), 0) + 7 * 3.5) /
    (COUNT(rating_communication) FILTER (WHERE moderation_status = 'published') + 7)::numeric,
    2
  ) AS avg_communication,

  ROUND(
    (COALESCE(SUM(rating_cost_transparency) FILTER (WHERE moderation_status = 'published'), 0) + 7 * 3.5) /
    (COUNT(rating_cost_transparency) FILTER (WHERE moderation_status = 'published') + 7)::numeric,
    2
  ) AS avg_cost,

  ROUND(
    (COALESCE(SUM(rating_cleanliness) FILTER (WHERE moderation_status = 'published'), 0) + 7 * 3.5) /
    (COUNT(rating_cleanliness) FILTER (WHERE moderation_status = 'published') + 7)::numeric,
    2
  ) AS avg_cleanliness,

  ROUND(
    (COALESCE(SUM(rating_anxiety_handling) FILTER (WHERE moderation_status = 'published'), 0) + 7 * 3.5) /
    (COUNT(rating_anxiety_handling) FILTER (WHERE moderation_status = 'published') + 7)::numeric,
    2
  ) AS avg_anxiety

FROM reviews
GROUP BY practice_id
HAVING COUNT(*) FILTER (WHERE moderation_status = 'published') > 0;
