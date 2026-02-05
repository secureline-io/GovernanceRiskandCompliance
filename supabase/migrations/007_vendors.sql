-- ============================================
-- GRC Platform - Vendors Schema
-- Migration 007: Vendors, Assessments, Integrations
-- ============================================

-- vendors
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  contact_email VARCHAR(255),
  contact_name VARCHAR(255),
  website VARCHAR(500),
  description TEXT,
  risk_level VARCHAR(20) DEFAULT 'medium' CHECK (risk_level IN ('critical','high','medium','low')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active','inactive','pending_review')),
  data_shared TEXT[], -- types of data shared
  criticality VARCHAR(20), -- how critical to business
  contract_end_date DATE,
  last_assessed_at TIMESTAMPTZ,
  next_assessment_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- vendor_assessments
CREATE TABLE vendor_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL,
  assessment_type VARCHAR(100), -- initial, annual, triggered
  questionnaire_template VARCHAR(100),
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  risk_rating VARCHAR(20),
  summary TEXT,
  issues_count INTEGER DEFAULT 0,
  documents JSONB, -- file references
  status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('not_started','in_progress','completed','expired')),
  assessor_id UUID REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- integrations
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  provider VARCHAR(100) NOT NULL, -- aws, azure, gcp, okta, github, jira
  auth_type VARCHAR(50), -- api_key, oauth, iam_role
  status VARCHAR(50) DEFAULT 'disconnected' CHECK (status IN ('connected','disconnected','error','syncing')),
  credential_vault_id VARCHAR(255),
  settings JSONB DEFAULT '{}',
  scopes TEXT[],
  last_synced_at TIMESTAMPTZ,
  sync_schedule VARCHAR(100),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, provider)
);

-- Create indexes
CREATE INDEX idx_vendors_org_id ON vendors(org_id);
CREATE INDEX idx_vendors_risk_level ON vendors(risk_level);
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendor_assessments_vendor_id ON vendor_assessments(vendor_id);
CREATE INDEX idx_vendor_assessments_status ON vendor_assessments(status);
CREATE INDEX idx_integrations_org_id ON integrations(org_id);
CREATE INDEX idx_integrations_provider ON integrations(provider);
CREATE INDEX idx_integrations_status ON integrations(status);

-- Triggers for updated_at
CREATE TRIGGER update_vendors_updated_at
    BEFORE UPDATE ON vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at
    BEFORE UPDATE ON integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
