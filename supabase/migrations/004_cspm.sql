-- ============================================
-- GRC Platform - CSPM Schema
-- Migration 004: Cloud Accounts, Assets, Policies, Findings
-- ============================================

-- cloud_accounts
CREATE TABLE cloud_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('aws','azure','gcp')),
  account_id VARCHAR(255) NOT NULL, -- AWS Account ID / Azure Sub / GCP Project
  account_name VARCHAR(255),
  credential_vault_id VARCHAR(255), -- encrypted credentials ref
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending','connected','disconnected','error')),
  scan_schedule VARCHAR(100), -- cron expression
  last_scan_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, provider, account_id)
);

-- assets (discovered cloud resources)
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  cloud_account_id UUID REFERENCES cloud_accounts(id) ON DELETE CASCADE,
  resource_id VARCHAR(500) NOT NULL, -- ARN, Resource ID
  resource_type VARCHAR(255) NOT NULL, -- ec2_instance, s3_bucket
  resource_name VARCHAR(500),
  region VARCHAR(100),
  criticality VARCHAR(20) DEFAULT 'medium' CHECK (criticality IN ('critical','high','medium','low')),
  classification VARCHAR(50), -- public, internal, confidential
  owner_id UUID REFERENCES auth.users(id),
  configuration JSONB, -- full resource snapshot
  tags JSONB,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active','deleted','unknown')),
  UNIQUE(org_id, resource_id)
);

-- cspm_policies (detection rules)
CREATE TABLE cspm_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  provider VARCHAR(20) CHECK (provider IN ('aws','azure','gcp','all')),
  resource_types TEXT[], -- applicable resource types
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical','high','medium','low','informational')),
  detection_logic JSONB NOT NULL, -- structured rule
  remediation_guidance TEXT NOT NULL,
  mapped_control_codes TEXT[], -- SOC 2 criteria mapping
  mapped_frameworks TEXT[],
  version INTEGER DEFAULT 1,
  is_enabled BOOLEAN DEFAULT TRUE,
  is_custom BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- findings (policy violations)
CREATE TABLE findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES cspm_policies(id),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  cloud_account_id UUID REFERENCES cloud_accounts(id),
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','suppressed','accepted_risk')),
  severity VARCHAR(20) NOT NULL,
  title VARCHAR(500),
  description TEXT,
  resource_id VARCHAR(500),
  evidence_id UUID REFERENCES evidence(id),
  first_detected_at TIMESTAMPTZ DEFAULT NOW(),
  last_detected_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  UNIQUE(org_id, policy_id, asset_id)
);

-- Create indexes
CREATE INDEX idx_cloud_accounts_org_id ON cloud_accounts(org_id);
CREATE INDEX idx_cloud_accounts_provider ON cloud_accounts(provider);
CREATE INDEX idx_assets_org_id ON assets(org_id);
CREATE INDEX idx_assets_cloud_account_id ON assets(cloud_account_id);
CREATE INDEX idx_assets_resource_type ON assets(resource_type);
CREATE INDEX idx_cspm_policies_provider ON cspm_policies(provider);
CREATE INDEX idx_cspm_policies_severity ON cspm_policies(severity);
CREATE INDEX idx_findings_org_id ON findings(org_id);
CREATE INDEX idx_findings_status ON findings(status);
CREATE INDEX idx_findings_severity ON findings(severity);
CREATE INDEX idx_findings_asset_id ON findings(asset_id);

-- Triggers for updated_at
CREATE TRIGGER update_cloud_accounts_updated_at
    BEFORE UPDATE ON cloud_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cspm_policies_updated_at
    BEFORE UPDATE ON cspm_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
