-- ADD REAL ESTATE SPECIFIC TAGS
-- Run this FOURTH

-- Add your original real estate-specific tags
INSERT INTO tags (name, color, is_protected) VALUES
('Buy and Hold', '#8B5CF6', true),
('Cash Buyer', '#00BCD4', true),
('Creative Finance', '#F59E0B', true),
('Daisy Chainer', '#EF4444', true),
('Developer/Home Builder', '#10B981', true),
('Fix and Flips', '#F97316', true),
('Hard Money', '#6366F1', true),
('Hedgefund', '#8B5CF6', true),
('Investor', '#9C27B0', true),
('Landlord', '#059669', true),
('Owner Financing', '#DC2626', true),
('Realtor', '#2563EB', true),
('Retail Buyer', '#7C3AED', true),
('Rent to Own', '#DB2777', true),
('SUB2', '#EA580C', true),
('Wholesaler', '#0891B2', true)
ON CONFLICT (name) DO NOTHING;

-- Update usage counts for existing tags
UPDATE tags SET usage_count = 1 WHERE name IN ('VIP', 'Hot Lead', 'Investor', 'Cash Buyer');
