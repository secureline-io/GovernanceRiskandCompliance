-- ============================================
-- GRC Platform - Core Tenancy Schema
-- Migration 001: Organizations and Members
-- ============================================

-- organizations (root tenant)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  industry VARCHAR(100),
  stage VARCHAR(50), -- startup, growth, enterprise
  evidence_retention_days INTEGER DEFAULT 365,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- organization_members (users + roles)
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('owner','admin','security_lead','analyst','auditor','viewer')),
  is_external_auditor BOOLEAN DEFAULT FALSE,
  access_expires_at TIMESTAMPTZ,
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

-- Create indexes for common queries
CREATE INDEX idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX idx_org_members_org_id ON organization_members(org_id);
CREATE INDEX idx_organizations_slug ON organizations(slug);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
-- ============================================
-- GRC Platform - Compliance Schema
-- Migration 002: Frameworks, Requirements, Controls
-- ============================================

-- frameworks (global, shared)
CREATE TABLE frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL, -- SOC2, ISO27001
  name VARCHAR(255) NOT NULL,
  version VARCHAR(50),
  authority VARCHAR(255), -- AICPA, ISO
  category VARCHAR(100), -- security, privacy, ai
  description TEXT,
  structure_schema JSONB,
  is_custom BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- framework_requirements (CC1.1, A.5.1, etc.)
CREATE TABLE framework_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID REFERENCES frameworks(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(255), -- Common Criteria, Availability
  parent_id UUID REFERENCES framework_requirements(id),
  is_mandatory BOOLEAN DEFAULT TRUE,
  typical_evidence_types TEXT[],
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(framework_id, code)
);

-- controls (org-specific internal controls)
CREATE TABLE controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  code VARCHAR(100) NOT NULL, -- SEC-001, AC-002
  name VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(255), -- Access Control, Change Management
  control_type VARCHAR(50) CHECK (control_type IN ('preventive','detective','corrective','directive')),
  control_nature VARCHAR(50) CHECK (control_nature IN ('manual','automated','hybrid')),
  status VARCHAR(50) DEFAULT 'not_tested' CHECK (status IN ('not_tested','compliant','non_compliant','accepted_risk','not_applicable','partially_compliant')),
  effectiveness_score DECIMAL(3,2) CHECK (effectiveness_score BETWEEN 0 AND 1),
  default_frequency VARCHAR(50), -- daily, weekly, monthly, quarterly
  risk_rating VARCHAR(20) CHECK (risk_rating IN ('critical','high','medium','low')),
  evidence_type VARCHAR(50) CHECK (evidence_type IN ('automated','manual','hybrid')),
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, code)
);

-- control_requirement_mappings (many-to-many)
CREATE TABLE control_requirement_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id UUID REFERENCES controls(id) ON DELETE CASCADE,
  requirement_id UUID REFERENCES framework_requirements(id) ON DELETE CASCADE,
  coverage_percentage INTEGER DEFAULT 100 CHECK (coverage_percentage BETWEEN 0 AND 100),
  mapping_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(control_id, requirement_id)
);

-- framework_instances (org adopting a framework)
CREATE TABLE framework_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  framework_id UUID REFERENCES frameworks(id),
  status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','ready','certified')),
  target_audit_date DATE,
  certified_at TIMESTAMPTZ,
  certificate_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, framework_id)
);

-- Create indexes
CREATE INDEX idx_framework_requirements_framework_id ON framework_requirements(framework_id);
CREATE INDEX idx_framework_requirements_parent_id ON framework_requirements(parent_id);
CREATE INDEX idx_controls_org_id ON controls(org_id);
CREATE INDEX idx_controls_status ON controls(status);
CREATE INDEX idx_control_requirement_mappings_control_id ON control_requirement_mappings(control_id);
CREATE INDEX idx_control_requirement_mappings_requirement_id ON control_requirement_mappings(requirement_id);
CREATE INDEX idx_framework_instances_org_id ON framework_instances(org_id);

-- Triggers for updated_at
CREATE TRIGGER update_controls_updated_at
    BEFORE UPDATE ON controls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_framework_instances_updated_at
    BEFORE UPDATE ON framework_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
-- ============================================
-- GRC Platform - Evidence Schema
-- Migration 003: Evidence (Immutable), Links, Tasks
-- ============================================

-- evidence (append-only, immutable)
CREATE TABLE evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  hash VARCHAR(64) NOT NULL, -- SHA-256 mandatory
  source VARCHAR(50) NOT NULL CHECK (source IN ('aws','azure','gcp','manual','integration','cspm_scan')),
  collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  title VARCHAR(500),
  description TEXT,
  file_path TEXT, -- S3/storage path
  file_type VARCHAR(100),
  file_size_bytes BIGINT,
  payload JSONB, -- immutable JSON snapshot
  integration_id UUID,
  collector_user_id UUID REFERENCES auth.users(id),
  audit_notes TEXT,
  -- NO updated_at - evidence is immutable
  CONSTRAINT evidence_hash_unique UNIQUE(org_id, hash)
);

-- evidence_control_links
CREATE TABLE evidence_control_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id UUID REFERENCES evidence(id) ON DELETE CASCADE,
  control_id UUID REFERENCES controls(id) ON DELETE CASCADE,
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  linked_by UUID REFERENCES auth.users(id),
  UNIQUE(evidence_id, control_id)
);

-- evidence_tasks (work items)
CREATE TABLE evidence_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  control_id UUID REFERENCES controls(id) ON DELETE CASCADE,
  instance_id UUID REFERENCES framework_instances(id),
  assigned_to UUID REFERENCES auth.users(id),
  task_type VARCHAR(50) CHECK (task_type IN ('collect','review','fix','approve')),
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open','in_progress','completed','blocked')),
  due_date DATE,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('critical','high','medium','low')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_evidence_org_id ON evidence(org_id);
CREATE INDEX idx_evidence_source ON evidence(source);
CREATE INDEX idx_evidence_collected_at ON evidence(collected_at);
CREATE INDEX idx_evidence_control_links_evidence_id ON evidence_control_links(evidence_id);
CREATE INDEX idx_evidence_control_links_control_id ON evidence_control_links(control_id);
CREATE INDEX idx_evidence_tasks_org_id ON evidence_tasks(org_id);
CREATE INDEX idx_evidence_tasks_status ON evidence_tasks(status);
CREATE INDEX idx_evidence_tasks_assigned_to ON evidence_tasks(assigned_to);
CREATE INDEX idx_evidence_tasks_due_date ON evidence_tasks(due_date);

-- Trigger for evidence_tasks updated_at
CREATE TRIGGER update_evidence_tasks_updated_at
    BEFORE UPDATE ON evidence_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Prevent updates to evidence table (immutability)
CREATE OR REPLACE FUNCTION prevent_evidence_update()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Evidence records are immutable and cannot be updated';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_evidence_updates
    BEFORE UPDATE ON evidence
    FOR EACH ROW
    EXECUTE FUNCTION prevent_evidence_update();
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
-- ============================================
-- GRC Platform - Risk Schema
-- Migration 005: Risks, Treatments, Control Links
-- ============================================

-- risks (register with calculated scores)
CREATE TABLE risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- Operational, Legal, Security, Compliance
  inherent_likelihood INTEGER NOT NULL CHECK (inherent_likelihood BETWEEN 1 AND 5),
  inherent_impact INTEGER NOT NULL CHECK (inherent_impact BETWEEN 1 AND 5),
  inherent_risk_score INTEGER GENERATED ALWAYS AS (inherent_likelihood * inherent_impact) STORED,
  control_effectiveness DECIMAL(3,2) DEFAULT 0 CHECK (control_effectiveness BETWEEN 0 AND 1),
  residual_risk_score DECIMAL(5,2) GENERATED ALWAYS AS (
    (inherent_likelihood * inherent_impact) * (1 - control_effectiveness)
  ) STORED,
  risk_response VARCHAR(50) CHECK (risk_response IN ('accept','mitigate','transfer','avoid')),
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open','mitigated','accepted','closed')),
  owner_id UUID REFERENCES auth.users(id),
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  last_reviewed_at TIMESTAMPTZ,
  review_frequency VARCHAR(50), -- monthly, quarterly, annually
  next_review_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- risk_control_links
CREATE TABLE risk_control_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID REFERENCES risks(id) ON DELETE CASCADE,
  control_id UUID REFERENCES controls(id) ON DELETE CASCADE,
  effectiveness VARCHAR(20) CHECK (effectiveness IN ('strong','moderate','weak')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(risk_id, control_id)
);

-- risk_treatments
CREATE TABLE risk_treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID REFERENCES risks(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL CHECK (action IN ('mitigate','transfer','accept','avoid')),
  description TEXT,
  status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed','blocked')),
  due_date DATE,
  responsible_user_id UUID REFERENCES auth.users(id),
  cost_estimate DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_risks_org_id ON risks(org_id);
CREATE INDEX idx_risks_status ON risks(status);
CREATE INDEX idx_risks_category ON risks(category);
CREATE INDEX idx_risks_inherent_risk_score ON risks(inherent_risk_score);
CREATE INDEX idx_risk_control_links_risk_id ON risk_control_links(risk_id);
CREATE INDEX idx_risk_control_links_control_id ON risk_control_links(control_id);
CREATE INDEX idx_risk_treatments_risk_id ON risk_treatments(risk_id);
CREATE INDEX idx_risk_treatments_status ON risk_treatments(status);

-- Triggers for updated_at
CREATE TRIGGER update_risks_updated_at
    BEFORE UPDATE ON risks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_treatments_updated_at
    BEFORE UPDATE ON risk_treatments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
-- ============================================
-- GRC Platform - Governance Schema
-- Migration 006: Policies, Acknowledgements, Exceptions, Audit Logs
-- ============================================

-- policies (documents)
CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  policy_type VARCHAR(100), -- acceptable_use, data_retention, incident_response
  content_markdown TEXT,
  version INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft','active','archived')),
  owner_id UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ,
  review_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- policy_acknowledgements
CREATE TABLE policy_acknowledgements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID REFERENCES policies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending','acknowledged','overdue')),
  due_date DATE,
  acknowledged_at TIMESTAMPTZ,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(policy_id, user_id)
);

-- exceptions (risk waivers)
CREATE TABLE exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  control_id UUID REFERENCES controls(id),
  finding_id UUID REFERENCES findings(id),
  risk_id UUID REFERENCES risks(id),
  justification TEXT NOT NULL,
  business_reason TEXT NOT NULL,
  requested_by UUID REFERENCES auth.users(id) NOT NULL,
  approver_id UUID REFERENCES auth.users(id) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- audit_logs (immutable)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL, -- create, update, delete, access, login
  resource_type VARCHAR(100) NOT NULL, -- table name
  resource_id UUID,
  changes JSONB, -- before/after snapshot
  ip_address INET,
  user_agent TEXT,
  occurred_at TIMESTAMPTZ DEFAULT NOW()
  -- NO updated_at - audit logs are immutable
);

-- Create indexes
CREATE INDEX idx_policies_org_id ON policies(org_id);
CREATE INDEX idx_policies_status ON policies(status);
CREATE INDEX idx_policy_acknowledgements_policy_id ON policy_acknowledgements(policy_id);
CREATE INDEX idx_policy_acknowledgements_user_id ON policy_acknowledgements(user_id);
CREATE INDEX idx_policy_acknowledgements_status ON policy_acknowledgements(status);
CREATE INDEX idx_exceptions_org_id ON exceptions(org_id);
CREATE INDEX idx_exceptions_status ON exceptions(status);
CREATE INDEX idx_audit_logs_org_id ON audit_logs(org_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_occurred_at ON audit_logs(occurred_at);

-- Triggers for updated_at
CREATE TRIGGER update_policies_updated_at
    BEFORE UPDATE ON policies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Prevent updates to audit_logs table (immutability)
CREATE OR REPLACE FUNCTION prevent_audit_log_update()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit log records are immutable and cannot be updated';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_audit_log_updates
    BEFORE UPDATE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_log_update();
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
-- ============================================
-- GRC Platform - Row Level Security
-- Migration 008: RLS Policies for All Tables
-- ============================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_requirement_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_control_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cspm_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_control_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_acknowledgements ENABLE ROW LEVEL SECURITY;
ALTER TABLE exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ORGANIZATIONS
-- ============================================
CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  USING (id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

CREATE POLICY "Owners can update their organizations"
  ON organizations FOR UPDATE
  USING (id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

CREATE POLICY "Authenticated users can create organizations"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- ORGANIZATION MEMBERS
-- ============================================
CREATE POLICY "Users can view members of their organizations"
  ON organization_members FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

CREATE POLICY "Admins can manage organization members"
  ON organization_members FOR ALL
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

-- ============================================
-- FRAMEWORKS (Global - read for all authenticated)
-- ============================================
CREATE POLICY "Authenticated users can view frameworks"
  ON frameworks FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only system can insert frameworks"
  ON frameworks FOR INSERT
  WITH CHECK (is_custom = true AND created_by = auth.uid());

-- ============================================
-- FRAMEWORK REQUIREMENTS (Global - read for all authenticated)
-- ============================================
CREATE POLICY "Authenticated users can view framework requirements"
  ON framework_requirements FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- CONTROLS
-- ============================================
CREATE POLICY "Users can view their org's controls"
  ON controls FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

CREATE POLICY "Admins can insert controls"
  ON controls FOR INSERT
  WITH CHECK (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'security_lead')
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

CREATE POLICY "Admins can update controls"
  ON controls FOR UPDATE
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'security_lead', 'analyst')
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

CREATE POLICY "Admins can delete controls"
  ON controls FOR DELETE
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

-- ============================================
-- CONTROL REQUIREMENT MAPPINGS
-- ============================================
CREATE POLICY "Users can view control requirement mappings"
  ON control_requirement_mappings FOR SELECT
  USING (control_id IN (
    SELECT id FROM controls WHERE org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid()
        AND (access_expires_at IS NULL OR access_expires_at > NOW())
    )
  ));

CREATE POLICY "Admins can manage control requirement mappings"
  ON control_requirement_mappings FOR ALL
  USING (control_id IN (
    SELECT id FROM controls WHERE org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin', 'security_lead')
        AND (access_expires_at IS NULL OR access_expires_at > NOW())
    )
  ));

-- ============================================
-- FRAMEWORK INSTANCES
-- ============================================
CREATE POLICY "Users can view their org's framework instances"
  ON framework_instances FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

CREATE POLICY "Admins can manage framework instances"
  ON framework_instances FOR ALL
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'security_lead')
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

-- ============================================
-- EVIDENCE
-- ============================================
CREATE POLICY "Users can view their org's evidence"
  ON evidence FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

CREATE POLICY "Users can insert evidence"
  ON evidence FOR INSERT
  WITH CHECK (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'security_lead', 'analyst')
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

-- No update policy for evidence (immutable)

-- ============================================
-- EVIDENCE CONTROL LINKS
-- ============================================
CREATE POLICY "Users can view evidence control links"
  ON evidence_control_links FOR SELECT
  USING (evidence_id IN (
    SELECT id FROM evidence WHERE org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid()
        AND (access_expires_at IS NULL OR access_expires_at > NOW())
    )
  ));

CREATE POLICY "Users can manage evidence control links"
  ON evidence_control_links FOR ALL
  USING (evidence_id IN (
    SELECT id FROM evidence WHERE org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin', 'security_lead', 'analyst')
        AND (access_expires_at IS NULL OR access_expires_at > NOW())
    )
  ));

-- ============================================
-- EVIDENCE TASKS
-- ============================================
CREATE POLICY "Users can view their org's evidence tasks"
  ON evidence_tasks FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

CREATE POLICY "Users can manage evidence tasks"
  ON evidence_tasks FOR ALL
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'security_lead', 'analyst')
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

-- ============================================
-- CLOUD ACCOUNTS
-- ============================================
CREATE POLICY "Users can view their org's cloud accounts"
  ON cloud_accounts FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

CREATE POLICY "Admins can manage cloud accounts"
  ON cloud_accounts FOR ALL
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

-- ============================================
-- ASSETS
-- ============================================
CREATE POLICY "Users can view their org's assets"
  ON assets FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

CREATE POLICY "System can manage assets"
  ON assets FOR ALL
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'security_lead')
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

-- ============================================
-- CSPM POLICIES (Global - read for all authenticated)
-- ============================================
CREATE POLICY "Authenticated users can view cspm policies"
  ON cspm_policies FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can create custom cspm policies"
  ON cspm_policies FOR INSERT
  WITH CHECK (is_custom = true AND created_by = auth.uid());

-- ============================================
-- FINDINGS
-- ============================================
CREATE POLICY "Users can view their org's findings"
  ON findings FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

CREATE POLICY "Users can manage findings"
  ON findings FOR ALL
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'security_lead', 'analyst')
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

-- ============================================
-- RISKS
-- ============================================
CREATE POLICY "Users can view their org's risks"
  ON risks FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

CREATE POLICY "Users can manage risks"
  ON risks FOR ALL
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'security_lead', 'analyst')
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

-- ============================================
-- RISK CONTROL LINKS
-- ============================================
CREATE POLICY "Users can view risk control links"
  ON risk_control_links FOR SELECT
  USING (risk_id IN (
    SELECT id FROM risks WHERE org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid()
        AND (access_expires_at IS NULL OR access_expires_at > NOW())
    )
  ));

CREATE POLICY "Users can manage risk control links"
  ON risk_control_links FOR ALL
  USING (risk_id IN (
    SELECT id FROM risks WHERE org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin', 'security_lead', 'analyst')
        AND (access_expires_at IS NULL OR access_expires_at > NOW())
    )
  ));

-- ============================================
-- RISK TREATMENTS
-- ============================================
CREATE POLICY "Users can view their org's risk treatments"
  ON risk_treatments FOR SELECT
  USING (risk_id IN (
    SELECT id FROM risks WHERE org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid()
        AND (access_expires_at IS NULL OR access_expires_at > NOW())
    )
  ));

CREATE POLICY "Users can manage risk treatments"
  ON risk_treatments FOR ALL
  USING (risk_id IN (
    SELECT id FROM risks WHERE org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin', 'security_lead', 'analyst')
        AND (access_expires_at IS NULL OR access_expires_at > NOW())
    )
  ));

-- ============================================
-- POLICIES (Documents)
-- ============================================
CREATE POLICY "Users can view their org's policies"
  ON policies FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

CREATE POLICY "Admins can manage policies"
  ON policies FOR ALL
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'security_lead')
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

-- ============================================
-- POLICY ACKNOWLEDGEMENTS
-- ============================================
CREATE POLICY "Users can view their own acknowledgements"
  ON policy_acknowledgements FOR SELECT
  USING (user_id = auth.uid() OR policy_id IN (
    SELECT id FROM policies WHERE org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin', 'security_lead')
        AND (access_expires_at IS NULL OR access_expires_at > NOW())
    )
  ));

CREATE POLICY "Users can acknowledge policies"
  ON policy_acknowledgements FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can create acknowledgement requests"
  ON policy_acknowledgements FOR INSERT
  WITH CHECK (policy_id IN (
    SELECT id FROM policies WHERE org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin', 'security_lead')
        AND (access_expires_at IS NULL OR access_expires_at > NOW())
    )
  ));

-- ============================================
-- EXCEPTIONS
-- ============================================
CREATE POLICY "Users can view their org's exceptions"
  ON exceptions FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

CREATE POLICY "Users can request exceptions"
  ON exceptions FOR INSERT
  WITH CHECK (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ) AND requested_by = auth.uid());

CREATE POLICY "Approvers can update exceptions"
  ON exceptions FOR UPDATE
  USING (approver_id = auth.uid() OR org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

-- ============================================
-- AUDIT LOGS
-- ============================================
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'auditor')
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

-- No update/delete policies for audit_logs (immutable)

-- ============================================
-- VENDORS
-- ============================================
CREATE POLICY "Users can view their org's vendors"
  ON vendors FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

CREATE POLICY "Users can manage vendors"
  ON vendors FOR ALL
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'security_lead', 'analyst')
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

-- ============================================
-- VENDOR ASSESSMENTS
-- ============================================
CREATE POLICY "Users can view vendor assessments"
  ON vendor_assessments FOR SELECT
  USING (vendor_id IN (
    SELECT id FROM vendors WHERE org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid()
        AND (access_expires_at IS NULL OR access_expires_at > NOW())
    )
  ));

CREATE POLICY "Users can manage vendor assessments"
  ON vendor_assessments FOR ALL
  USING (vendor_id IN (
    SELECT id FROM vendors WHERE org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin', 'security_lead', 'analyst')
        AND (access_expires_at IS NULL OR access_expires_at > NOW())
    )
  ));

-- ============================================
-- INTEGRATIONS
-- ============================================
CREATE POLICY "Users can view their org's integrations"
  ON integrations FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));

CREATE POLICY "Admins can manage integrations"
  ON integrations FOR ALL
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  ));
-- ============================================
-- GRC Platform - Functions and Views
-- Migration 009: Helper Functions, Materialized Views
-- ============================================

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get user's organization IDs
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS UUID[] AS $$
  SELECT COALESCE(ARRAY_AGG(org_id), ARRAY[]::UUID[])
  FROM organization_members
  WHERE user_id = auth.uid()
    AND (access_expires_at IS NULL OR access_expires_at > NOW());
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get user's role in an organization
CREATE OR REPLACE FUNCTION get_user_role(p_org_id UUID)
RETURNS VARCHAR AS $$
  SELECT role
  FROM organization_members
  WHERE user_id = auth.uid()
    AND org_id = p_org_id
    AND (access_expires_at IS NULL OR access_expires_at > NOW())
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user has minimum role
CREATE OR REPLACE FUNCTION user_has_role(p_org_id UUID, p_min_roles VARCHAR[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE user_id = auth.uid()
      AND org_id = p_org_id
      AND role = ANY(p_min_roles)
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Calculate compliance percentage for an org
CREATE OR REPLACE FUNCTION calculate_compliance_percentage(p_org_id UUID, p_framework_id UUID DEFAULT NULL)
RETURNS DECIMAL AS $$
DECLARE
  total_controls INTEGER;
  compliant_controls INTEGER;
BEGIN
  IF p_framework_id IS NOT NULL THEN
    SELECT COUNT(DISTINCT c.id), COUNT(DISTINCT CASE WHEN c.status = 'compliant' THEN c.id END)
    INTO total_controls, compliant_controls
    FROM controls c
    JOIN control_requirement_mappings crm ON crm.control_id = c.id
    JOIN framework_requirements fr ON fr.id = crm.requirement_id
    WHERE c.org_id = p_org_id AND fr.framework_id = p_framework_id;
  ELSE
    SELECT COUNT(*), COUNT(CASE WHEN status = 'compliant' THEN 1 END)
    INTO total_controls, compliant_controls
    FROM controls
    WHERE org_id = p_org_id;
  END IF;

  IF total_controls = 0 THEN
    RETURN 0;
  END IF;

  RETURN ROUND((compliant_controls::DECIMAL / total_controls) * 100, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get control status summary for an org
CREATE OR REPLACE FUNCTION get_control_status_summary(p_org_id UUID)
RETURNS TABLE(
  total_controls BIGINT,
  compliant BIGINT,
  non_compliant BIGINT,
  not_tested BIGINT,
  accepted_risk BIGINT,
  not_applicable BIGINT,
  partially_compliant BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_controls,
    COUNT(CASE WHEN status = 'compliant' THEN 1 END)::BIGINT as compliant,
    COUNT(CASE WHEN status = 'non_compliant' THEN 1 END)::BIGINT as non_compliant,
    COUNT(CASE WHEN status = 'not_tested' THEN 1 END)::BIGINT as not_tested,
    COUNT(CASE WHEN status = 'accepted_risk' THEN 1 END)::BIGINT as accepted_risk,
    COUNT(CASE WHEN status = 'not_applicable' THEN 1 END)::BIGINT as not_applicable,
    COUNT(CASE WHEN status = 'partially_compliant' THEN 1 END)::BIGINT as partially_compliant
  FROM controls
  WHERE org_id = p_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get open tasks count for an org
CREATE OR REPLACE FUNCTION get_open_tasks_count(p_org_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM evidence_tasks
  WHERE org_id = p_org_id
    AND status IN ('open', 'in_progress');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get open risks count by severity
CREATE OR REPLACE FUNCTION get_risks_by_severity(p_org_id UUID)
RETURNS TABLE(
  severity VARCHAR,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN inherent_risk_score >= 20 THEN 'critical'
      WHEN inherent_risk_score >= 12 THEN 'high'
      WHEN inherent_risk_score >= 6 THEN 'medium'
      ELSE 'low'
    END as severity,
    COUNT(*)::BIGINT as count
  FROM risks
  WHERE org_id = p_org_id
    AND status IN ('open', 'mitigated')
  GROUP BY 1
  ORDER BY
    CASE
      WHEN CASE WHEN inherent_risk_score >= 20 THEN 'critical'
           WHEN inherent_risk_score >= 12 THEN 'high'
           WHEN inherent_risk_score >= 6 THEN 'medium'
           ELSE 'low' END = 'critical' THEN 1
      WHEN CASE WHEN inherent_risk_score >= 20 THEN 'critical'
           WHEN inherent_risk_score >= 12 THEN 'high'
           WHEN inherent_risk_score >= 6 THEN 'medium'
           ELSE 'low' END = 'high' THEN 2
      WHEN CASE WHEN inherent_risk_score >= 20 THEN 'critical'
           WHEN inherent_risk_score >= 12 THEN 'high'
           WHEN inherent_risk_score >= 6 THEN 'medium'
           ELSE 'low' END = 'medium' THEN 3
      ELSE 4
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- MATERIALIZED VIEWS
-- ============================================

-- Compliance summary per framework
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_compliance_summary AS
SELECT
  fi.org_id,
  fi.framework_id,
  f.code as framework_code,
  f.name as framework_name,
  fi.status as instance_status,
  fi.target_audit_date,
  COUNT(DISTINCT c.id) as total_controls,
  COUNT(DISTINCT CASE WHEN c.status = 'compliant' THEN c.id END) as compliant_controls,
  COUNT(DISTINCT CASE WHEN c.status = 'non_compliant' THEN c.id END) as non_compliant_controls,
  COUNT(DISTINCT CASE WHEN c.status = 'not_tested' THEN c.id END) as not_tested_controls,
  ROUND(
    COALESCE(
      COUNT(DISTINCT CASE WHEN c.status = 'compliant' THEN c.id END)::DECIMAL /
      NULLIF(COUNT(DISTINCT c.id), 0) * 100,
      0
    ), 2
  ) as compliance_percentage
FROM framework_instances fi
JOIN frameworks f ON f.id = fi.framework_id
LEFT JOIN control_requirement_mappings crm ON crm.requirement_id IN (
  SELECT id FROM framework_requirements WHERE framework_id = f.id
)
LEFT JOIN controls c ON c.id = crm.control_id AND c.org_id = fi.org_id
GROUP BY fi.org_id, fi.framework_id, f.code, f.name, fi.status, fi.target_audit_date;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_compliance_summary_pk
  ON mv_compliance_summary(org_id, framework_id);

-- Risk heatmap
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_risk_heatmap AS
SELECT
  org_id,
  inherent_likelihood,
  inherent_impact,
  COUNT(*) as risk_count,
  AVG(residual_risk_score) as avg_residual_score
FROM risks
WHERE status NOT IN ('closed')
GROUP BY org_id, inherent_likelihood, inherent_impact;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_risk_heatmap_pk
  ON mv_risk_heatmap(org_id, inherent_likelihood, inherent_impact);

-- Evidence collection summary
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_evidence_summary AS
SELECT
  e.org_id,
  c.id as control_id,
  c.code as control_code,
  c.name as control_name,
  COUNT(DISTINCT e.id) as evidence_count,
  MAX(e.collected_at) as last_collected_at,
  MIN(e.collected_at) as first_collected_at
FROM evidence e
JOIN evidence_control_links ecl ON ecl.evidence_id = e.id
JOIN controls c ON c.id = ecl.control_id
GROUP BY e.org_id, c.id, c.code, c.name;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_evidence_summary_pk
  ON mv_evidence_summary(org_id, control_id);

-- ============================================
-- REFRESH FUNCTIONS
-- ============================================

-- Refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_compliance_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_risk_heatmap;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_evidence_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Refresh compliance views only
CREATE OR REPLACE FUNCTION refresh_compliance_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_compliance_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_evidence_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- AUDIT LOGGING FUNCTION
-- ============================================

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_org_id UUID,
  p_action VARCHAR,
  p_resource_type VARCHAR,
  p_resource_id UUID DEFAULT NULL,
  p_changes JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    org_id,
    user_id,
    action,
    resource_type,
    resource_id,
    changes
  ) VALUES (
    p_org_id,
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_changes
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
