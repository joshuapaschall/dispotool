-- ENABLE ROW LEVEL SECURITY AND CREATE POLICIES
-- Run this SECOND

-- Enable Row Level Security
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_groups ENABLE ROW LEVEL SECURITY;

-- Create simple "allow all" policies for now
-- You can tighten these later when you add authentication

CREATE POLICY "Allow all operations on buyers" ON buyers FOR ALL USING (true);
CREATE POLICY "Allow all operations on tags" ON tags FOR ALL USING (true);
CREATE POLICY "Allow all operations on groups" ON groups FOR ALL USING (true);
CREATE POLICY "Allow all operations on buyer_groups" ON buyer_groups FOR ALL USING (true);
