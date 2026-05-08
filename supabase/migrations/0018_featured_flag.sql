-- Add is_featured flag to practices for monetisation / priority AI generation
ALTER TABLE practices ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

-- Track whether the stored summary was generated with the featured (richer) prompt.
-- When this differs from the current practice.is_featured we know we need to regenerate.
ALTER TABLE practice_ai_summaries ADD COLUMN IF NOT EXISTS generated_for_featured BOOLEAN NOT NULL DEFAULT false;

-- Index for fast featured-practice lookups in the cron
CREATE INDEX IF NOT EXISTS practices_is_featured_idx ON practices (is_featured) WHERE is_featured = true;
