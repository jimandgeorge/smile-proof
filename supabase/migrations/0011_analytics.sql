-- Profile page view tracking
CREATE TABLE IF NOT EXISTS practice_page_views (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices ON DELETE CASCADE,
  viewed_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_practice_page_views ON practice_page_views(practice_id, viewed_at DESC);

ALTER TABLE practice_page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert views"          ON practice_page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Views are publicly readable"      ON practice_page_views FOR SELECT USING (true);

-- AI-generated insights cache on practices
ALTER TABLE practices
  ADD COLUMN IF NOT EXISTS ai_insights            JSONB,
  ADD COLUMN IF NOT EXISTS ai_insights_updated_at TIMESTAMPTZ;
