-- CORE TABLES FOR DISPOSITION TOOL
-- Run this FIRST

-- Create buyers table (your main table)
CREATE TABLE IF NOT EXISTS buyers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fname TEXT,
  lname TEXT,
  full_name TEXT GENERATED ALWAYS AS (COALESCE(fname || ' ' || lname, fname, lname)) STORED,
  email TEXT,
  phone TEXT,
  phone2 TEXT,
  phone3 TEXT,
  company TEXT,
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  notes TEXT,
  mailing_address TEXT,
  mailing_city TEXT,
  mailing_state TEXT,
  mailing_zip TEXT,
  locations TEXT[],
  tags TEXT[],
  vetted BOOLEAN DEFAULT FALSE,
  vip BOOLEAN DEFAULT FALSE,
  can_receive_sms BOOLEAN DEFAULT TRUE,
  can_receive_email BOOLEAN DEFAULT TRUE,
  property_type TEXT[],
  budget_min DECIMAL(12,2),
  budget_max DECIMAL(12,2),
  timeline TEXT,
  source TEXT,
  status TEXT DEFAULT 'lead' CHECK (status IN ('lead', 'qualified', 'active', 'under_contract', 'closed', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  is_protected BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'manual' CHECK (type IN ('manual', 'smart')),
  criteria JSONB,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create junction table for buyer-group relationships
CREATE TABLE IF NOT EXISTS buyer_groups (
  buyer_id UUID REFERENCES buyers(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (buyer_id, group_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_buyers_email ON buyers(email);
CREATE INDEX IF NOT EXISTS idx_buyers_phone ON buyers(phone);
CREATE INDEX IF NOT EXISTS idx_buyers_status ON buyers(status);
CREATE INDEX IF NOT EXISTS idx_buyers_score ON buyers(score);
CREATE INDEX IF NOT EXISTS idx_buyers_tags ON buyers USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_buyers_locations ON buyers USING GIN(locations);
CREATE INDEX IF NOT EXISTS idx_buyers_created_at ON buyers(created_at);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_groups_name ON groups(name);
