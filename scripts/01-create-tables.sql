-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Users and Authentication
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'agent' CHECK (role IN ('admin', 'broker', 'agent', 'assistant')),
  team_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams/Brokerages
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mls_number TEXT UNIQUE,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  county TEXT,
  property_type TEXT NOT NULL CHECK (property_type IN ('single_family', 'condo', 'townhouse', 'multi_family', 'land', 'commercial')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'withdrawn', 'expired')),
  list_price DECIMAL(12,2),
  sale_price DECIMAL(12,2),
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  square_feet INTEGER,
  lot_size DECIMAL(10,2),
  year_built INTEGER,
  description TEXT,
  features TEXT[],
  images TEXT[],
  listing_agent_id UUID REFERENCES profiles(id),
  listing_date DATE,
  sale_date DATE,
  days_on_market INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Buyers table (upgrading your existing one)
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
  assigned_agent_id UUID REFERENCES profiles(id),
  last_contact_date TIMESTAMP WITH TIME ZONE,
  next_followup_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'lead' CHECK (status IN ('lead', 'qualified', 'active', 'under_contract', 'closed', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sellers
CREATE TABLE IF NOT EXISTS sellers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fname TEXT,
  lname TEXT,
  full_name TEXT GENERATED ALWAYS AS (COALESCE(fname || ' ' || lname, fname, lname)) STORED,
  email TEXT,
  phone TEXT,
  phone2 TEXT,
  company TEXT,
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  notes TEXT,
  property_address TEXT,
  property_city TEXT,
  property_state TEXT,
  property_zip TEXT,
  property_type TEXT,
  asking_price DECIMAL(12,2),
  timeline TEXT,
  motivation TEXT,
  source TEXT,
  assigned_agent_id UUID REFERENCES profiles(id),
  last_contact_date TIMESTAMP WITH TIME ZONE,
  next_followup_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'lead' CHECK (status IN ('lead', 'qualified', 'listed', 'under_contract', 'closed', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deals/Transactions
CREATE TABLE IF NOT EXISTS deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  property_id UUID REFERENCES properties(id),
  buyer_id UUID REFERENCES buyers(id),
  seller_id UUID REFERENCES sellers(id),
  listing_agent_id UUID REFERENCES profiles(id),
  buying_agent_id UUID REFERENCES profiles(id),
  deal_type TEXT NOT NULL CHECK (deal_type IN ('purchase', 'sale', 'lease', 'rental')),
  status TEXT DEFAULT 'prospect' CHECK (status IN ('prospect', 'qualified', 'contract', 'pending', 'closed', 'lost')),
  contract_price DECIMAL(12,2),
  commission_rate DECIMAL(5,4),
  commission_amount DECIMAL(12,2),
  closing_date DATE,
  contract_date DATE,
  inspection_date DATE,
  appraisal_date DATE,
  financing_contingency_date DATE,
  probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities/Interactions
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('call', 'email', 'sms', 'meeting', 'showing', 'note', 'task', 'offer', 'contract')),
  subject TEXT,
  description TEXT,
  contact_type TEXT CHECK (contact_type IN ('buyer', 'seller', 'agent', 'vendor')),
  contact_id UUID,
  property_id UUID REFERENCES properties(id),
  deal_id UUID REFERENCES deals(id),
  agent_id UUID REFERENCES profiles(id),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  outcome TEXT,
  next_action TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Groups (your existing table)
CREATE TABLE IF NOT EXISTS groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'manual' CHECK (type IN ('manual', 'smart', 'system')),
  criteria JSONB,
  color TEXT,
  icon TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction Tables
CREATE TABLE IF NOT EXISTS buyer_groups (
  buyer_id UUID REFERENCES buyers(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (buyer_id, group_id)
);

CREATE TABLE IF NOT EXISTS seller_groups (
  seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (seller_id, group_id)
);

-- Tags (your existing table enhanced)
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  is_protected BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'direct_mail', 'social')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed')),
  subject TEXT,
  content TEXT,
  template_id UUID,
  target_groups UUID[],
  target_criteria JSONB,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id),
  stats JSONB DEFAULT '{"sent": 0, "delivered": 0, "opened": 0, "clicked": 0, "replied": 0}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  entity_type TEXT CHECK (entity_type IN ('buyer', 'seller', 'property', 'deal')),
  entity_id UUID,
  uploaded_by UUID REFERENCES profiles(id),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_buyers_email ON buyers(email);
CREATE INDEX IF NOT EXISTS idx_buyers_phone ON buyers(phone);
CREATE INDEX IF NOT EXISTS idx_buyers_agent ON buyers(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_buyers_status ON buyers(status);
CREATE INDEX IF NOT EXISTS idx_buyers_score ON buyers(score);
CREATE INDEX IF NOT EXISTS idx_buyers_tags ON buyers USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_buyers_locations ON buyers USING GIN(locations);

CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(list_price);
CREATE INDEX IF NOT EXISTS idx_properties_agent ON properties(listing_agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(city, state);

CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_agent ON deals(listing_agent_id, buying_agent_id);
CREATE INDEX IF NOT EXISTS idx_deals_closing_date ON deals(closing_date);

CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_agent ON activities(agent_id);
CREATE INDEX IF NOT EXISTS idx_activities_scheduled ON activities(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_activities_contact ON activities(contact_type, contact_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
