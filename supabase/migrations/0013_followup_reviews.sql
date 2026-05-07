ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS followup_token        UUID         DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS followup_opted_in     BOOLEAN      DEFAULT false,
  ADD COLUMN IF NOT EXISTS followup_remind_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS followup_body         TEXT,
  ADD COLUMN IF NOT EXISTS followup_rating       SMALLINT     CHECK (followup_rating BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS followup_submitted_at TIMESTAMPTZ;
