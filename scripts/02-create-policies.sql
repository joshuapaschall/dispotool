-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Team-based access for other tables
CREATE POLICY "Team members can view team data" ON buyers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.team_id = (SELECT team_id FROM profiles WHERE id = buyers.assigned_agent_id) OR profiles.role = 'admin')
    )
  );

CREATE POLICY "Team members can insert team data" ON buyers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.team_id IS NOT NULL
    )
  );

CREATE POLICY "Team members can update team data" ON buyers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.team_id = (SELECT team_id FROM profiles WHERE id = buyers.assigned_agent_id) OR profiles.role = 'admin')
    )
  );

-- Similar policies for other tables
CREATE POLICY "Team access for sellers" ON sellers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.team_id = (SELECT team_id FROM profiles WHERE id = sellers.assigned_agent_id) OR profiles.role = 'admin')
    )
  );

CREATE POLICY "Team access for properties" ON properties
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.team_id = (SELECT team_id FROM profiles WHERE id = properties.listing_agent_id) OR profiles.role = 'admin')
    )
  );

CREATE POLICY "Team access for deals" ON deals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (
        profiles.team_id = (SELECT team_id FROM profiles WHERE id = deals.listing_agent_id) OR 
        profiles.team_id = (SELECT team_id FROM profiles WHERE id = deals.buying_agent_id) OR 
        profiles.role = 'admin'
      )
    )
  );

CREATE POLICY "Team access for activities" ON activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.team_id = (SELECT team_id FROM profiles WHERE id = activities.agent_id) OR profiles.role = 'admin')
    )
  );

CREATE POLICY "Team access for groups" ON groups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.team_id = (SELECT team_id FROM profiles WHERE id = groups.created_by) OR profiles.role = 'admin')
    )
  );
