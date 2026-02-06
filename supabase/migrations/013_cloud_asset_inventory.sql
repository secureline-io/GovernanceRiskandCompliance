-- ============================================
-- GRC Platform - Cloud Asset Inventory Enhancement
-- Migration 013: Extended asset schema, discovery jobs, classification rules
-- ============================================

-- Add new columns to existing assets table
ALTER TABLE assets ADD COLUMN IF NOT EXISTS service VARCHAR(100); -- ec2, s3, rds, vpc, iam
ALTER TABLE assets ADD COLUMN IF NOT EXISTS provider VARCHAR(20); -- aws, azure, gcp
ALTER TABLE assets ADD COLUMN IF NOT EXISTS account_id VARCHAR(255);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS resource_arn VARCHAR(2048);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS environment VARCHAR(50); -- production, staging, development
ALTER TABLE assets ADD COLUMN IF NOT EXISTS team VARCHAR(255);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS data_classification VARCHAR(50); -- public, internal, confidential, restricted
ALTER TABLE assets ADD COLUMN IF NOT EXISTS internet_exposed BOOLEAN DEFAULT FALSE;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS lifecycle_state VARCHAR(50) DEFAULT 'active'
  CHECK (lifecycle_state IN ('active','stale','deleted','unknown'));
ALTER TABLE assets ADD COLUMN IF NOT EXISTS relationships JSONB DEFAULT '[]'; -- vpc/subnet/sg links
ALTER TABLE assets ADD COLUMN IF NOT EXISTS change_history JSONB DEFAULT '[]'; -- field change log

-- Add new columns to cloud_accounts for IAM role-based access
ALTER TABLE cloud_accounts ADD COLUMN IF NOT EXISTS role_arn VARCHAR(2048);
ALTER TABLE cloud_accounts ADD COLUMN IF NOT EXISTS external_id VARCHAR(255);
ALTER TABLE cloud_accounts ADD COLUMN IF NOT EXISTS regions TEXT[] DEFAULT '{}';
ALTER TABLE cloud_accounts ADD COLUMN IF NOT EXISTS connection_method VARCHAR(50) DEFAULT 'iam_role'
  CHECK (connection_method IN ('iam_role','access_key','organization'));
ALTER TABLE cloud_accounts ADD COLUMN IF NOT EXISTS discovered_regions TEXT[] DEFAULT '{}';
ALTER TABLE cloud_accounts ADD COLUMN IF NOT EXISTS total_assets INTEGER DEFAULT 0;

-- Discovery jobs table (tracks sync operations)
CREATE TABLE IF NOT EXISTS discovery_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  cloud_account_id UUID REFERENCES cloud_accounts(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending'
    CHECK (status IN ('pending','running','completed','failed','cancelled')),
  job_type VARCHAR(50) DEFAULT 'full'
    CHECK (job_type IN ('full','incremental','service_specific')),
  services_scanned TEXT[] DEFAULT '{}',
  regions_scanned TEXT[] DEFAULT '{}',
  assets_discovered INTEGER DEFAULT 0,
  assets_updated INTEGER DEFAULT 0,
  assets_stale INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  triggered_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classification rules table
CREATE TABLE IF NOT EXISTS classification_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('tag_match','service_type','exposure','custom')),
  conditions JSONB NOT NULL, -- { tag_key: "Environment", tag_value: "production" }
  actions JSONB NOT NULL,    -- { set_environment: "production", set_criticality: "high" }
  priority INTEGER DEFAULT 100,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asset overrides table (manual classification overrides)
CREATE TABLE IF NOT EXISTS asset_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  field_name VARCHAR(100) NOT NULL,
  override_value TEXT NOT NULL,
  reason TEXT,
  overridden_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(asset_id, field_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assets_service ON assets(service);
CREATE INDEX IF NOT EXISTS idx_assets_provider ON assets(provider);
CREATE INDEX IF NOT EXISTS idx_assets_environment ON assets(environment);
CREATE INDEX IF NOT EXISTS idx_assets_lifecycle_state ON assets(lifecycle_state);
CREATE INDEX IF NOT EXISTS idx_assets_internet_exposed ON assets(internet_exposed);
CREATE INDEX IF NOT EXISTS idx_assets_data_classification ON assets(data_classification);
CREATE INDEX IF NOT EXISTS idx_assets_last_seen_at ON assets(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_assets_resource_arn ON assets(resource_arn);
CREATE INDEX IF NOT EXISTS idx_discovery_jobs_org_id ON discovery_jobs(org_id);
CREATE INDEX IF NOT EXISTS idx_discovery_jobs_status ON discovery_jobs(status);
CREATE INDEX IF NOT EXISTS idx_discovery_jobs_cloud_account_id ON discovery_jobs(cloud_account_id);
CREATE INDEX IF NOT EXISTS idx_classification_rules_org_id ON classification_rules(org_id);

-- Triggers
CREATE TRIGGER update_classification_rules_updated_at
  BEFORE UPDATE ON classification_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
