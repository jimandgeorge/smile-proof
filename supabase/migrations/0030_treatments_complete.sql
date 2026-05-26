-- Add missing treatments to complete the standard list
INSERT INTO treatments (slug, name, category, nhs_band) VALUES
  ('composite-bonding',    'Composite bonding',    'cosmetic',      NULL),
  ('emergency',            'Emergency dentistry',  'emergency',     NULL),
  ('gum-disease-treatment','Gum disease treatment','periodontal',   2),
  ('childrens-dentistry',  'Children''s dentistry','preventive',    NULL)
ON CONFLICT (slug) DO NOTHING;
