ALTER TABLE practices
  ADD COLUMN IF NOT EXISTS claim_pending_user_id UUID,
  ADD COLUMN IF NOT EXISTS claim_pending_email    TEXT,
  ADD COLUMN IF NOT EXISTS claim_pending_at       TIMESTAMPTZ;
