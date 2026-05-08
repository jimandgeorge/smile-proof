CREATE TABLE practice_ai_summaries (
  id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id               UUID        NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  summary                   TEXT        NOT NULL,
  review_count_at_generation INT         NOT NULL DEFAULT 0,
  last_generated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (practice_id)
);

ALTER TABLE practice_ai_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_summaries_public_read" ON practice_ai_summaries FOR SELECT USING (true);

-- Migrate any summaries already stored on the practices row
INSERT INTO practice_ai_summaries (practice_id, summary, review_count_at_generation, last_generated_at)
SELECT
  p.id,
  p.ai_summary,
  COALESCE(prs.review_count, 0),
  COALESCE(p.ai_summary_updated_at, now())
FROM practices p
LEFT JOIN practice_rating_summary prs ON prs.practice_id = p.id
WHERE p.ai_summary IS NOT NULL;
