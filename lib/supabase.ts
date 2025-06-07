import { createClient } from "@supabase/supabase-js"

// Your existing Supabase credentials
const supabaseUrl = "https://utbomztujqqagkyyxgpu.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Ym9tenR1anFxYWdreXl4Z3B1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NTczMjEsImV4cCI6MjA2NDAzMzMyMX0.yCXqAMLigZ07u0lHdOpWyxDvmf9JWpfzr6-EFs3r-ac"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Core types for your disposition tool
export interface Buyer {
  id: string
  fname: string | null
  lname: string | null
  full_name: string | null
  email: string | null
  phone: string | null
  phone2: string | null
  phone3: string | null
  company: string | null
  score: number
  notes: string | null
  mailing_address: string | null
  mailing_city: string | null
  mailing_state: string | null
  mailing_zip: string | null
  locations: string[] | null
  tags: string[] | null
  vetted: boolean
  vip: boolean
  can_receive_sms: boolean
  can_receive_email: boolean
  property_type: string[] | null
  budget_min: number | null
  budget_max: number | null
  timeline: string | null
  source: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  name: string
  color: string
  is_protected: boolean
  usage_count: number
  created_at: string
}

export interface Group {
  id: string
  name: string
  description: string | null
  type: string
  criteria: any
  color: string | null
  created_at: string
  updated_at: string
}
