ALTER TABLE google_connections
  ADD COLUMN IF NOT EXISTS pending_request_id text;
