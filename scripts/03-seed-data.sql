-- Insert sample teams
INSERT INTO teams (id, name, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Premier Realty Group', 'Full-service real estate brokerage'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Downtown Properties', 'Urban real estate specialists');

-- Insert sample tags
INSERT INTO tags (name, color, is_protected) VALUES
  ('VIP', '#FFD700', true),
  ('Hot Lead', '#FF4444', true),
  ('First-time Buyer', '#4CAF50', false),
  ('Investor', '#9C27B0', false),
  ('Cash Buyer', '#00BCD4', false),
  ('Relocating', '#FF9800', false),
  ('Luxury', '#E91E63', false),
  ('Commercial', '#607D8B', false);

-- Insert sample groups
INSERT INTO groups (name, description, type, color) VALUES
  ('VIP Clients', 'High-value clients requiring premium service', 'manual', '#FFD700'),
  ('Hot Leads', 'Leads with high conversion probability', 'smart', '#FF4444'),
  ('First-time Buyers', 'Buyers purchasing their first home', 'smart', '#4CAF50'),
  ('Investors', 'Investment property buyers', 'manual', '#9C27B0'),
  ('Cash Buyers', 'Buyers with cash offers', 'smart', '#00BCD4'),
  ('Luxury Market', 'High-end property buyers', 'manual', '#E91E63');

-- Insert sample property types and statuses for reference
-- (These would be used in dropdowns/selects)
