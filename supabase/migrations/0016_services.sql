CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE practice_services (
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  service_id  UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (practice_id, service_id)
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "services_public_read"          ON services          FOR SELECT USING (true);
CREATE POLICY "practice_services_public_read" ON practice_services FOR SELECT USING (true);

INSERT INTO services (slug, name, category, sort_order) VALUES
  ('evening-appointments',  'Evening appointments',   'availability',  1),
  ('weekend-appointments',  'Weekend appointments',   'availability',  2),
  ('same-day-appointments', 'Same-day appointments',  'availability',  3),
  ('emergency-dental',      'Emergency dental care',  'availability',  4),
  ('nhs',                   'NHS treatment',          'funding',       10),
  ('private',               'Private treatment',      'funding',       11),
  ('mixed-nhs-private',     'NHS & private',          'funding',       12),
  ('invisalign',            'Invisalign',             'orthodontics',  20),
  ('fixed-braces',          'Fixed braces',           'orthodontics',  21),
  ('clear-aligners',        'Clear aligners',         'orthodontics',  22),
  ('teeth-whitening',       'Teeth whitening',        'cosmetic',      30),
  ('veneers',               'Veneers',                'cosmetic',      31),
  ('composite-bonding',     'Composite bonding',      'cosmetic',      32),
  ('dental-implants',       'Dental implants',        'restorative',   40),
  ('crowns-bridges',        'Crowns & bridges',       'restorative',   41),
  ('wheelchair-accessible', 'Wheelchair accessible',  'accessibility', 50),
  ('anxiety-friendly',      'Anxiety-friendly',       'accessibility', 51),
  ('child-friendly',        'Child-friendly',         'accessibility', 52);
