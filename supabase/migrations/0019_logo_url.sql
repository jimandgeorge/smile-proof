-- Add logo_url column to practices
ALTER TABLE practices ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Supabase Storage bucket for practice logos.
-- Run this in the Supabase dashboard Storage section, or via the CLI:
--   supabase storage create practice-logos --public
-- Then add the following policies in the dashboard or via SQL after enabling storage:

-- Allow authenticated users to upload their own practice logo
-- INSERT policy: bucket_id = 'practice-logos' AND auth.uid() IS NOT NULL
-- UPDATE policy: bucket_id = 'practice-logos' AND auth.uid() IS NOT NULL
-- DELETE policy: bucket_id = 'practice-logos' AND auth.uid() IS NOT NULL
-- SELECT policy (public read): bucket_id = 'practice-logos'

-- Note: bucket creation itself is done via Supabase dashboard or CLI,
-- not through SQL migrations. The column above is the only DDL change.
