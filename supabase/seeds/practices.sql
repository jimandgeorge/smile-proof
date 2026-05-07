-- Seed: 20 dental practices across UK cities
-- London & South East (7), Manchester (3), Glasgow (2), Liverpool (2), Cardiff (2), Oxford (2), Essex (2)

INSERT INTO practices (slug, name, address_line1, city, postcode, latitude, longitude, phone, website, practice_type, email) VALUES

-- LONDON & SOUTH EAST
('harley-street-dental-studio',  'Harley Street Dental Studio',   '92 Harley Street',            'London',              'W1G 7HU', 51.5196, -0.1483, '020 7935 2100', 'https://harleystreetdental.co.uk',  'private', 'hello@harleystreetdental.co.uk'),
('city-smile-dental-clinic',     'City Smile Dental Clinic',      '14 Moorgate',                 'London',              'EC2R 6BL', 51.5182, -0.0885, '020 7726 5544', 'https://citysmile.co.uk',           'mixed',   'info@citysmile.co.uk'),
('notting-hill-dental',          'Notting Hill Dental',           '58 Pembridge Road',           'London',              'W11 3HG', 51.5117, -0.1966, '020 7727 9481', NULL,                                'private', 'appointments@nhd.co.uk'),
('greenwich-family-dental',      'Greenwich Family Dental',       '3 Stockwell Street',          'London',              'SE10 9JN', 51.4785, -0.0108, '020 8858 6632', NULL,                                'nhs',     'reception@greenwichdental.co.uk'),
('lewisham-dental-practice',     'Lewisham Dental Practice',      '120 High Street',             'London',              'SE13 6PT', 51.4617, -0.0137, '020 8852 3310', NULL,                                'mixed',   NULL),
('brighton-dental-care',         'Brighton Dental Care',          '27 Western Road',             'Brighton',            'BN1 2PB', 50.8225, -0.1455, '01273 324 780', 'https://brightondental.co.uk',      'mixed',   'hello@brightondental.co.uk'),
('guildford-smile-clinic',       'Guildford Smile Clinic',        '11 North Street',             'Guildford',           'GU1 4AF', 51.2362, -0.5704, '01483 562 290', NULL,                                'private', NULL),

-- MANCHESTER
('northern-quarter-dental',      'Northern Quarter Dental',       '5 Tib Street',                'Manchester',          'M4 1PH',  53.4841, -2.2358, '0161 832 4400', 'https://nqdental.co.uk',            'mixed',   'hello@nqdental.co.uk'),
('didsbury-dental-studio',       'Didsbury Dental Studio',        '184 Lapwing Lane',            'Manchester',          'M20 2NT', 53.4162, -2.2277, '0161 445 7890', NULL,                                'private', 'info@didsburydental.co.uk'),
('chorlton-dental-practice',     'Chorlton Dental Practice',      '64 Barlow Moor Road',         'Manchester',          'M21 0AE', 53.4439, -2.2576, '0161 881 2250', NULL,                                'nhs',     NULL),

-- GLASGOW
('west-end-dental-glasgow',      'West End Dental',               '327 Great Western Road',      'Glasgow',             'G4 9HS',  55.8739, -4.2763, '0141 339 8822', 'https://westend-dental.co.uk',      'mixed',   'reception@westend-dental.co.uk'),
('merchant-city-dental',         'Merchant City Dental',          '66 Candleriggs',              'Glasgow',             'G1 1LE',  55.8581, -4.2456, '0141 552 6100', NULL,                                'private', NULL),

-- LIVERPOOL
('bold-street-dental',           'Bold Street Dental',            '22 Bold Street',              'Liverpool',           'L1 4DS',  53.4017, -2.9811, '0151 709 4427', 'https://boldstreetdental.co.uk',    'mixed',   'hello@boldstreetdental.co.uk'),
('allerton-dental-practice',     'Allerton Dental Practice',      '91 Allerton Road',            'Liverpool',           'L18 2DA', 53.3792, -2.9069, '0151 724 3330', NULL,                                'nhs',     NULL),

-- CARDIFF
('cardiff-bay-dental',           'Cardiff Bay Dental',            '6 Mermaid Quay',              'Cardiff',             'CF10 5BZ', 51.4643, -3.1631, '029 2049 8800', 'https://cardiffbaydental.co.uk',    'private', 'info@cardiffbaydental.co.uk'),
('pontcanna-dental-studio',      'Pontcanna Dental Studio',       '138 Kings Road',              'Cardiff',             'CF11 9DF', 51.4872, -3.1969, '029 2022 4490', NULL,                                'mixed',   NULL),

-- OXFORD
('jericho-dental-practice',      'Jericho Dental Practice',       '70 Walton Street',            'Oxford',              'OX2 6EA', 51.7598, -1.2684, '01865 557 120', NULL,                                'nhs',     'jericho@dental.oxford.uk'),
('east-oxford-dental',           'East Oxford Dental',            '199 Cowley Road',             'Oxford',              'OX4 1UT', 51.7482, -1.2421, '01865 247 800', 'https://eastoxforddental.co.uk',    'mixed',   NULL),

-- ESSEX
('chelmsford-dental-centre',     'Chelmsford Dental Centre',      '52 Duke Street',              'Chelmsford',          'CM1 1JA', 51.7356,  0.4685, '01245 261 730', NULL,                                'mixed',   'hello@chelmsforddental.co.uk'),
('southend-smile-practice',      'Southend Smile Practice',       '14 High Street',              'Southend-on-Sea',     'SS1 1JE', 51.5366,  0.7128, '01702 345 670', 'https://southendsmile.co.uk',       'private', NULL);
