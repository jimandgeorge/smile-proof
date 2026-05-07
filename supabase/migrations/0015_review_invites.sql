CREATE TABLE review_invites (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id    UUID NOT NULL REFERENCES practices ON DELETE CASCADE,
  patient_email  TEXT NOT NULL,
  patient_name   TEXT,
  token          UUID NOT NULL DEFAULT gen_random_uuid(),
  sent_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  review_id      UUID REFERENCES reviews ON DELETE SET NULL
);

CREATE INDEX idx_review_invites_practice ON review_invites(practice_id, sent_at DESC);
CREATE INDEX idx_review_invites_token    ON review_invites(token);

ALTER TABLE review_invites ENABLE ROW LEVEL SECURITY;

-- Practice owners can manage their own invites via the admin client (service role bypasses RLS).
-- Public read is not needed.
