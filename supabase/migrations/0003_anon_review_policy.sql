-- Allow unauthenticated review submission.
-- reviewer_user_id is linked later when the user clicks the magic-link email.
CREATE POLICY "Anyone can submit a review"
  ON reviews FOR INSERT
  WITH CHECK (reviewer_email IS NOT NULL AND reviewer_user_id IS NULL);

-- Authenticated users can claim their submitted reviews by matching email.
CREATE POLICY "Users can claim reviews by email"
  ON reviews FOR UPDATE
  TO authenticated
  USING (
    reviewer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND reviewer_user_id IS NULL
  )
  WITH CHECK (reviewer_user_id = auth.uid());
