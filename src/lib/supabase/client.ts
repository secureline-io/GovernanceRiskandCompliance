import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types (simplified for now - can be auto-generated later)
export type Organization = {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  stage: string | null;
  created_at: string;
  updated_at: string;
};

export type Framework = {
  id: string;
  code: string;
  name: string;
  version: string | null;
  authority: string | null;
  category: string | null;
  description: string | null;
  created_at: string;
};

export type Control = {
  id: string;
  org_id: string;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  control_type: string | null;
  status: string;
  effectiveness_score: number | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Finding = {
  id: string;
  org_id: string;
  policy_id: string | null;
  asset_id: string | null;
  status: string;
  severity: string;
  title: string | null;
  description: string | null;
  first_detected_at: string;
  resolved_at: string | null;
};

export type Risk = {
  id: string;
  org_id: string;
  title: string;
  description: string | null;
  category: string | null;
  likelihood: string;
  impact: string;
  inherent_risk_score: number;
  residual_risk_score: number | null;
  status: string;
  owner_id: string | null;
  created_at: string;
};
