-- Demo reviews with realistic score variance.
-- Uses slugs to resolve practice IDs so this works on any fresh seed.
-- Run AFTER practices.sql.

DO $$
DECLARE
  pid uuid;
BEGIN

  -- Harley Street Dental Studio (high-end private, strong across the board)
  SELECT id INTO pid FROM practices WHERE slug = 'harley-street-dental-studio';
  IF pid IS NOT NULL THEN
    INSERT INTO reviews (practice_id, title, body, rating_overall, rating_pain_management, rating_communication, rating_cost_transparency, rating_cleanliness, rating_anxiety_handling, rating_treatment_results, reviewer_display_name, moderation_status, verification_status, created_at) VALUES
      (pid, 'Exceptional care', 'Best dental experience I have ever had. The team explained every step clearly and I felt completely at ease.', 5, 5, 5, 4, 5, 5, 5, 'Sarah M.', 'published', 'verified', now() - interval '40 days'),
      (pid, 'Worth every penny', 'Pricey but the quality of work is outstanding. My veneers look completely natural.', 5, 4, 5, 3, 5, 4, 5, 'James T.', 'published', 'verified', now() - interval '28 days'),
      (pid, 'Great for anxious patients', 'I had not been to a dentist in years due to anxiety. They were incredibly patient and gentle throughout.', 4, 5, 4, 4, 5, 5, 4, 'Rachel B.', 'published', 'unverified', now() - interval '15 days'),
      (pid, 'Minor wait time issue', 'Treatment itself was superb but I waited 20 minutes past my appointment. Not ideal for Harley Street prices.', 4, 4, 4, 3, 5, 4, 4, 'David L.', 'published', 'verified', now() - interval '8 days'),
      (pid, 'Stunning results', 'My smile has completely transformed. The dentist took real time to understand what I wanted.', 5, 5, 5, 4, 5, 5, 5, 'Emma W.', 'published', 'verified', now() - interval '3 days');
  END IF;

  -- City Smile Dental Clinic (mixed NHS/private, good value, slightly less polished)
  SELECT id INTO pid FROM practices WHERE slug = 'city-smile-dental-clinic';
  IF pid IS NOT NULL THEN
    INSERT INTO reviews (practice_id, title, body, rating_overall, rating_pain_management, rating_communication, rating_cost_transparency, rating_cleanliness, rating_anxiety_handling, rating_treatment_results, reviewer_display_name, moderation_status, verification_status, created_at) VALUES
      (pid, 'Solid NHS practice', 'Friendly staff and reasonable wait times for an NHS practice. Nothing flashy but gets the job done.', 4, 3, 4, 5, 4, 3, 3, 'Mike R.', 'published', 'verified', now() - interval '50 days'),
      (pid, 'Good for routine work', 'Had a filling done here. Quick, reasonably painless and the receptionist was very helpful.', 3, 3, 4, 5, 4, 3, 3, 'Priya K.', 'published', 'unverified', now() - interval '35 days'),
      (pid, 'Rushed appointment', 'Felt a bit rushed and the dentist didn't fully explain what was happening. Results were fine but communication could improve.', 3, 3, 2, 4, 4, 2, 3, 'Tom H.', 'published', 'verified', now() - interval '20 days'),
      (pid, 'Great value', 'For a mixed practice in the City you really can't complain. Got a clean and check for NHS price.', 4, 4, 3, 5, 4, 3, 4, 'Claire D.', 'published', 'verified', now() - interval '10 days'),
      (pid, 'Improved recently', 'Used to be a bit hit and miss but my last two visits have been genuinely good. Pain management has got much better.', 4, 4, 4, 4, 4, 4, 4, 'Oliver N.', 'published', 'unverified', now() - interval '2 days');
  END IF;

  -- Northern Quarter Dental (mixed Manchester, trendy area, younger clientele)
  SELECT id INTO pid FROM practices WHERE slug = 'northern-quarter-dental';
  IF pid IS NOT NULL THEN
    INSERT INTO reviews (practice_id, title, body, rating_overall, rating_pain_management, rating_communication, rating_cost_transparency, rating_cleanliness, rating_anxiety_handling, rating_treatment_results, reviewer_display_name, moderation_status, verification_status, created_at) VALUES
      (pid, 'Friendly and modern', 'Really nice clinic, staff are great and the whole place feels welcoming. Whitening results were fantastic.', 5, 4, 5, 3, 5, 5, 5, 'Chloe A.', 'published', 'verified', now() - interval '45 days'),
      (pid, 'Decent but pricey for private', 'Good standard of care but the pricing for private work adds up quickly. Worth it if you can afford it.', 3, 3, 4, 2, 4, 4, 4, 'Ben S.', 'published', 'verified', now() - interval '30 days'),
      (pid, 'Brilliant with my kids', 'Took my 7 year old who is terrified of dentists. The team were amazing — she actually enjoyed it.', 5, 5, 5, 4, 5, 5, 4, 'Fiona M.', 'published', 'unverified', now() - interval '18 days'),
      (pid, 'Average experience', 'Nothing to write home about. Checkup was fine, dentist was polite but I wasn't made to feel particularly welcome.', 3, 3, 3, 3, 4, 3, 3, 'George P.', 'published', 'verified', now() - interval '7 days'),
      (pid, 'Great Invisalign treatment', 'Mid-way through Invisalign and very happy so far. Regular check-ins and clear progress updates every visit.', 5, 4, 5, 3, 5, 5, 5, 'Hannah C.', 'published', 'verified', now() - interval '1 day');
  END IF;

  -- Brighton Dental Care (mixed, seaside town, value-conscious patients)
  SELECT id INTO pid FROM practices WHERE slug = 'brighton-dental-care';
  IF pid IS NOT NULL THEN
    INSERT INTO reviews (practice_id, title, body, rating_overall, rating_pain_management, rating_communication, rating_cost_transparency, rating_cleanliness, rating_anxiety_handling, rating_treatment_results, reviewer_display_name, moderation_status, verification_status, created_at) VALUES
      (pid, 'Exactly what I needed', 'Emergency appointment sorted same day. Tooth extraction was as comfortable as it could be.', 4, 5, 4, 4, 4, 4, 4, 'Louise F.', 'published', 'verified', now() - interval '60 days'),
      (pid, 'Good but parking is a nightmare', 'The practice itself is great — shame the area makes getting there so stressful. Dentist was thorough and kind.', 4, 4, 4, 4, 5, 4, 4, 'Rob T.', 'published', 'unverified', now() - interval '42 days'),
      (pid, 'Let down by front desk', 'Treatment from the dentist was great. The receptionist however was quite short and unhelpful on the phone.', 3, 4, 2, 4, 4, 3, 4, 'Natalie G.', 'published', 'verified', now() - interval '25 days'),
      (pid, 'Clean and professional', 'Very tidy practice, staff were all kind and my crown fits perfectly. Happy to recommend.', 5, 4, 5, 4, 5, 4, 5, 'Adrian W.', 'published', 'verified', now() - interval '12 days'),
      (pid, 'Fair pricing', 'Had private work done here and felt the prices were fair for the quality. Treatment results were exactly as described.', 4, 3, 4, 5, 4, 3, 4, 'Sophie K.', 'published', 'verified', now() - interval '4 days');
  END IF;

  -- Didsbury Dental Studio (private Manchester, polished, higher expectation)
  SELECT id INTO pid FROM practices WHERE slug = 'didsbury-dental-studio';
  IF pid IS NOT NULL THEN
    INSERT INTO reviews (practice_id, title, body, rating_overall, rating_pain_management, rating_communication, rating_cost_transparency, rating_cleanliness, rating_anxiety_handling, rating_treatment_results, reviewer_display_name, moderation_status, verification_status, created_at) VALUES
      (pid, 'Flawless composite bonding', 'Came in feeling self-conscious about my teeth. Left with real confidence. The dentist genuinely cares about results.', 5, 5, 5, 3, 5, 5, 5, 'Isabelle R.', 'published', 'verified', now() - interval '55 days'),
      (pid, 'Top-tier practice', 'Everything from booking to aftercare was handled brilliantly. Slightly on the expensive side but you get what you pay for.', 5, 5, 5, 3, 5, 5, 5, 'Marcus L.', 'published', 'verified', now() - interval '38 days'),
      (pid, 'Good but not exceptional', 'Had a crown fitted. Work was good but felt the pre-treatment consultation was a bit brief for the price point.', 3, 4, 3, 3, 5, 4, 4, 'Zara B.', 'published', 'unverified', now() - interval '22 days'),
      (pid, 'Highly recommend for nervous patients', 'I genuinely dread the dentist but they made the whole thing manageable. Sedation was offered when I was struggling.', 5, 5, 5, 4, 5, 5, 4, 'Patrick H.', 'published', 'verified', now() - interval '9 days'),
      (pid, 'Best in South Manchester', 'Moved practices to come here and haven't looked back. Consistent quality every single time.', 5, 4, 5, 3, 5, 4, 5, 'Yvonne C.', 'published', 'verified', now() - interval '2 days');
  END IF;

END $$;
