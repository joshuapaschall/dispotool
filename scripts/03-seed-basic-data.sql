-- SEED BASIC DATA
-- Run this THIRD

-- Insert basic tags
INSERT INTO tags (name, color, is_protected) VALUES
  ('VIP', '#FFD700', true),
  ('Hot Lead', '#FF4444', true),
  ('Investor', '#9C27B0', false),
  ('Cash Buyer', '#00BCD4', false),
  ('First-time Buyer', '#4CAF50', false),
  ('Relocating', '#FF9800', false)
ON CONFLICT (name) DO NOTHING;

-- Insert basic groups
INSERT INTO groups (name, description, type, color) VALUES
  ('VIP Buyers', 'High-priority buyers', 'manual', '#FFD700'),
  ('Hot Leads', 'Buyers ready to purchase', 'manual', '#FF4444'),
  ('Cash Buyers', 'Buyers with cash offers', 'manual', '#00BCD4'),
  ('Investors', 'Investment property buyers', 'manual', '#9C27B0')
ON CONFLICT DO NOTHING;

-- Insert a sample buyer to test
INSERT INTO buyers (
  fname, lname, email, phone, 
  score, tags, vip, 
  mailing_city, mailing_state,
  locations, property_type, 
  budget_min, budget_max, 
  status
) VALUES (
  'John', 'Sample', 'john@example.com', '555-123-4567',
  75, ARRAY['Investor', 'Cash Buyer'], true,
  'Atlanta', 'GA',
  ARRAY['Atlanta, GA', 'Marietta, GA'],
  ARRAY['single_family', 'multi_family'],
  200000, 500000,
  'qualified'
);
