-- Practice submission flow: allows users to add unlisted practices
-- (primarily for Scotland, Wales, Northern Ireland, and any gaps in CQC data)

-- Add email to practices if missing (CQC data doesn't include it; claimed practices need it)
ALTER TABLE practices ADD COLUMN IF NOT EXISTS email TEXT;

CREATE TABLE IF NOT EXISTS practice_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  address_line1   TEXT NOT NULL,
  address_line2   TEXT,
  city            TEXT NOT NULL,
  postcode        TEXT NOT NULL,
  country         TEXT NOT NULL DEFAULT 'england'
                  CHECK (country IN ('england', 'scotland', 'wales', 'northern_ireland')),
  practice_type   TEXT NOT NULL DEFAULT 'mixed'
                  CHECK (practice_type IN ('nhs', 'private', 'mixed')),
  phone           TEXT,
  email           TEXT,
  website         TEXT,
  submitter_email TEXT,
  notes           TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected')),
  practice_id     UUID REFERENCES practices(id),
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE practice_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit; admin reads via service role (bypasses RLS)
CREATE POLICY "public_submit" ON practice_submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
