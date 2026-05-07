-- Tracks who found a review helpful (one vote per fingerprint per review)
CREATE TABLE review_votes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id         UUID NOT NULL REFERENCES reviews ON DELETE CASCADE,
  voter_fingerprint TEXT NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE (review_id, voter_fingerprint)
);

-- Denormalised count for cheap reads
ALTER TABLE reviews ADD COLUMN helpful_count INTEGER NOT NULL DEFAULT 0;

-- RLS: anyone can see votes, nobody can insert directly (server action only)
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Votes are public" ON review_votes FOR SELECT USING (true);
