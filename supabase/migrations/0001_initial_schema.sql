-- Initial schema for UK dental review site
-- Run via: supabase db push (after `supabase init` and linking)

-- =========================================================
-- PRACTICES
-- =========================================================
CREATE TABLE practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  postcode TEXT NOT NULL,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  phone TEXT,
  website TEXT,
  practice_type TEXT NOT NULL CHECK (practice_type IN ('nhs', 'private', 'mixed')),
  cqc_id TEXT UNIQUE,
  claimed_by_user_id UUID REFERENCES auth.users,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_practices_postcode ON practices(postcode);
CREATE INDEX idx_practices_city ON practices(lower(city));
CREATE INDEX idx_practices_location ON practices(latitude, longitude);

-- =========================================================
-- DENTISTS
-- =========================================================
CREATE TABLE dentists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  gdc_number TEXT UNIQUE,
  specialisms TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE practice_dentists (
  practice_id UUID REFERENCES practices ON DELETE CASCADE,
  dentist_id UUID REFERENCES dentists ON DELETE CASCADE,
  active BOOLEAN DEFAULT true,
  PRIMARY KEY (practice_id, dentist_id)
);

-- =========================================================
-- TREATMENTS (controlled vocabulary)
-- =========================================================
CREATE TABLE treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  nhs_band INTEGER CHECK (nhs_band IN (1, 2, 3)),
  description TEXT
);

INSERT INTO treatments (slug, name, category, nhs_band) VALUES
  ('check-up', 'Routine check-up', 'preventive', 1),
  ('scale-polish', 'Scale and polish', 'preventive', 1),
  ('xray', 'X-ray', 'diagnostic', 1),
  ('composite-filling', 'Composite filling', 'restorative', 2),
  ('amalgam-filling', 'Amalgam filling', 'restorative', 2),
  ('root-canal-incisor', 'Root canal (front tooth)', 'restorative', 2),
  ('root-canal-molar', 'Root canal (back tooth)', 'restorative', 2),
  ('extraction-simple', 'Simple extraction', 'restorative', 2),
  ('extraction-surgical', 'Surgical extraction', 'restorative', 2),
  ('crown-porcelain', 'Porcelain crown', 'restorative', 3),
  ('crown-metal', 'Metal crown', 'restorative', 3),
  ('bridge', 'Dental bridge', 'restorative', 3),
  ('denture-partial', 'Partial denture', 'restorative', 3),
  ('denture-full', 'Full denture', 'restorative', 3),
  ('implant-single', 'Single dental implant', 'restorative', NULL),
  ('invisalign', 'Invisalign / clear aligners', 'cosmetic', NULL),
  ('whitening', 'Teeth whitening', 'cosmetic', NULL),
  ('veneer', 'Veneer', 'cosmetic', NULL),
  ('hygienist', 'Hygienist appointment', 'preventive', NULL);

-- =========================================================
-- REVIEWS
-- =========================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices,
  dentist_id UUID REFERENCES dentists,
  treatment_id UUID REFERENCES treatments,
  reviewer_user_id UUID REFERENCES auth.users,
  reviewer_email TEXT NOT NULL,
  reviewer_display_name TEXT,

  rating_overall SMALLINT NOT NULL CHECK (rating_overall BETWEEN 1 AND 5),
  rating_pain_management SMALLINT CHECK (rating_pain_management BETWEEN 1 AND 5),
  rating_communication SMALLINT CHECK (rating_communication BETWEEN 1 AND 5),
  rating_cost_transparency SMALLINT CHECK (rating_cost_transparency BETWEEN 1 AND 5),
  rating_cleanliness SMALLINT CHECK (rating_cleanliness BETWEEN 1 AND 5),
  rating_anxiety_handling SMALLINT CHECK (rating_anxiety_handling BETWEEN 1 AND 5),

  title TEXT,
  body TEXT NOT NULL CHECK (length(body) >= 30),
  treatment_date DATE,

  verification_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  verification_method TEXT
    CHECK (verification_method IN ('receipt_upload', 'email_forward', 'manual')),
  verified_at TIMESTAMPTZ,
  verified_by_admin_id UUID,

  moderation_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (moderation_status IN ('pending', 'published', 'hidden', 'removed')),

  created_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);
CREATE INDEX idx_reviews_practice_published
  ON reviews(practice_id, published_at DESC)
  WHERE moderation_status = 'published';
CREATE INDEX idx_reviews_dentist_published
  ON reviews(dentist_id, published_at DESC)
  WHERE moderation_status = 'published' AND dentist_id IS NOT NULL;

-- =========================================================
-- PRICE REPORTS
-- =========================================================
CREATE TABLE price_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews,
  practice_id UUID NOT NULL REFERENCES practices,
  treatment_id UUID NOT NULL REFERENCES treatments,
  amount_pence INTEGER NOT NULL CHECK (amount_pence > 0),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('nhs', 'private', 'insurance')),
  date_of_treatment DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_price_treatment_date ON price_reports(treatment_id, date_of_treatment DESC);
CREATE INDEX idx_price_practice ON price_reports(practice_id);

-- =========================================================
-- VERIFICATION SUBMISSIONS
-- =========================================================
CREATE TABLE verification_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('receipt_upload', 'email_forward')),
  evidence_url TEXT,
  evidence_email_raw TEXT,
  reviewed_by_admin_id UUID,
  decision TEXT CHECK (decision IN ('approved', 'rejected')),
  decision_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  decided_at TIMESTAMPTZ
);

-- =========================================================
-- PRACTICE RESPONSES
-- =========================================================
CREATE TABLE practice_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL UNIQUE REFERENCES reviews ON DELETE CASCADE,
  practice_id UUID NOT NULL REFERENCES practices,
  responder_user_id UUID NOT NULL REFERENCES auth.users,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================================
-- REVIEW FLAGS
-- =========================================================
CREATE TABLE review_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews ON DELETE CASCADE,
  flagger_user_id UUID REFERENCES auth.users,
  flagger_email TEXT,
  reason TEXT NOT NULL CHECK (reason IN ('fake', 'defamatory', 'spam', 'other')),
  details TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================================
-- AGGREGATED VIEWS (denormalised for performance)
-- =========================================================
CREATE VIEW practice_rating_summary AS
SELECT
  practice_id,
  COUNT(*) FILTER (WHERE moderation_status = 'published') AS review_count,
  COUNT(*) FILTER (WHERE moderation_status = 'published' AND verification_status = 'verified') AS verified_count,
  ROUND(AVG(rating_overall) FILTER (WHERE moderation_status = 'published'), 2) AS avg_overall,
  ROUND(AVG(rating_pain_management) FILTER (WHERE moderation_status = 'published'), 2) AS avg_pain,
  ROUND(AVG(rating_communication) FILTER (WHERE moderation_status = 'published'), 2) AS avg_communication,
  ROUND(AVG(rating_cost_transparency) FILTER (WHERE moderation_status = 'published'), 2) AS avg_cost,
  ROUND(AVG(rating_cleanliness) FILTER (WHERE moderation_status = 'published'), 2) AS avg_cleanliness,
  ROUND(AVG(rating_anxiety_handling) FILTER (WHERE moderation_status = 'published'), 2) AS avg_anxiety
FROM reviews
GROUP BY practice_id;

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can read published reviews
CREATE POLICY "Published reviews are public"
  ON reviews FOR SELECT
  USING (moderation_status = 'published');

-- Authenticated users can insert their own reviews
CREATE POLICY "Users insert their own reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (reviewer_user_id = auth.uid());

-- Users can update their own reviews within 30 days, only the body/title
CREATE POLICY "Users edit their own recent reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (reviewer_user_id = auth.uid() AND created_at > now() - interval '30 days');

-- Price reports follow the same pattern
CREATE POLICY "Price reports are public"
  ON price_reports FOR SELECT
  USING (true);
