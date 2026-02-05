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
