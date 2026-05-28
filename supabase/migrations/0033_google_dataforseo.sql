-- Make OAuth token columns nullable (DataForSEO flow doesn't use OAuth tokens)
ALTER TABLE google_connections
  ALTER COLUMN access_token DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS search_query text;
