-- Google Business Profile connection per practice
CREATE TABLE google_connections (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id          uuid        NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  access_token         text        NOT NULL,
  refresh_token        text,
  token_expires_at     timestamptz,
  google_account_id    text,
  google_location_id   text,        -- e.g. accounts/123/locations/456
  google_location_name text,        -- human-readable label stored for display
  connected_at         timestamptz NOT NULL DEFAULT now(),
  last_synced_at       timestamptz,
  review_count         integer     NOT NULL DEFAULT 0,
  UNIQUE(practice_id)
);

-- External reviews — dashboard intelligence only, never public
CREATE TABLE external_reviews (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id   uuid        NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  source        text        NOT NULL DEFAULT 'google',  -- 'google' | future sources
  external_id   text        NOT NULL,
  reviewer_name text,
  rating        integer     CHECK (rating BETWEEN 1 AND 5),
  body          text,
  published_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(source, external_id)
);

CREATE INDEX idx_external_reviews_practice ON external_reviews(practice_id, source);

ALTER TABLE google_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_reviews   ENABLE ROW LEVEL SECURITY;
