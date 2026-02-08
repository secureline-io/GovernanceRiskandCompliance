-- ============================================
-- GRC Platform - Universal Compliance Mapper
-- Migration 015: UCF Controls, Mappings, Implementations
-- ============================================

-- ============================================
-- 1. UCF Controls (Unified Control Library)
-- Global library of ~120 universal controls
-- ============================================
CREATE TABLE ucf_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  objective TEXT,
  guidance TEXT,
  testing_procedures TEXT,
  typical_evidence_types TEXT[],
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. UCF-to-Requirement Mappings
-- Links UCF controls to framework requirements (many-to-many)
-- ============================================
CREATE TABLE ucf_requirement_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ucf_control_id UUID NOT NULL REFERENCES ucf_controls(id) ON DELETE CASCADE,
  requirement_id UUID NOT NULL REFERENCES framework_requirements(id) ON DELETE CASCADE,
  mapping_strength VARCHAR(20) DEFAULT 'full'
    CHECK (mapping_strength IN ('full', 'partial', 'related')),
  mapping_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ucf_control_id, requirement_id)
);

-- ============================================
-- 3. Organization UCF Implementations
-- Links an org's controls to UCF controls
-- ============================================
CREATE TABLE ucf_control_implementations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ucf_control_id UUID NOT NULL REFERENCES ucf_controls(id) ON DELETE CASCADE,
  control_id UUID NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
  implementation_status VARCHAR(50) DEFAULT 'not_started'
    CHECK (implementation_status IN ('not_started', 'in_progress', 'implemented', 'not_applicable')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, ucf_control_id, control_id)
);

-- ============================================
-- 4. Framework Packs (import tracking)
-- ============================================
CREATE TABLE framework_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
  pack_version VARCHAR(50),
  source VARCHAR(100) DEFAULT 'builtin'
    CHECK (source IN ('builtin', 'json_import', 'xlsx_import')),
  imported_by UUID REFERENCES auth.users(id),
  requirements_count INTEGER DEFAULT 0,
  ucf_mappings_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  imported_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. Evidence Templates
-- Suggested evidence per UCF control
-- ============================================
CREATE TABLE evidence_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ucf_control_id UUID NOT NULL REFERENCES ucf_controls(id) ON DELETE CASCADE,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  evidence_type VARCHAR(100),
  collection_frequency VARCHAR(50),
  example_sources TEXT[],
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_ucf_controls_category ON ucf_controls(category);
CREATE INDEX idx_ucf_controls_code ON ucf_controls(code);

CREATE INDEX idx_ucf_req_mappings_ucf_id ON ucf_requirement_mappings(ucf_control_id);
CREATE INDEX idx_ucf_req_mappings_req_id ON ucf_requirement_mappings(requirement_id);

CREATE INDEX idx_org_ucf_impl_org ON ucf_control_implementations(org_id);
CREATE INDEX idx_org_ucf_impl_ucf ON ucf_control_implementations(ucf_control_id);
CREATE INDEX idx_org_ucf_impl_control ON ucf_control_implementations(control_id);
CREATE INDEX idx_org_ucf_impl_status ON ucf_control_implementations(org_id, implementation_status);

CREATE INDEX idx_evidence_templates_ucf ON evidence_templates(ucf_control_id);

CREATE INDEX idx_framework_packs_framework ON framework_packs(framework_id);

-- ============================================
-- Triggers for updated_at
-- ============================================
CREATE TRIGGER update_ucf_controls_updated_at
    BEFORE UPDATE ON ucf_controls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ucf_control_implementations_updated_at
    BEFORE UPDATE ON ucf_control_implementations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE ucf_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE ucf_requirement_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ucf_control_implementations ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_templates ENABLE ROW LEVEL SECURITY;

-- UCF controls are globally readable
CREATE POLICY "ucf_controls_read" ON ucf_controls
  FOR SELECT USING (true);

CREATE POLICY "ucf_controls_admin_write" ON ucf_controls
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_super_admin = true
    )
  );

-- UCF requirement mappings are globally readable
CREATE POLICY "ucf_req_mappings_read" ON ucf_requirement_mappings
  FOR SELECT USING (true);

CREATE POLICY "ucf_req_mappings_admin_write" ON ucf_requirement_mappings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_super_admin = true
    )
  );

-- Org UCF implementations are org-scoped
CREATE POLICY "org_ucf_impl_read" ON ucf_control_implementations
  FOR SELECT USING (
    org_id IN (SELECT get_user_org_ids())
  );

CREATE POLICY "org_ucf_impl_write" ON ucf_control_implementations
  FOR ALL USING (
    org_id IN (SELECT get_user_org_ids())
  );

-- Framework packs are readable by all, writable by admins
CREATE POLICY "framework_packs_read" ON framework_packs
  FOR SELECT USING (true);

CREATE POLICY "framework_packs_write" ON framework_packs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Evidence templates are globally readable
CREATE POLICY "evidence_templates_read" ON evidence_templates
  FOR SELECT USING (true);

CREATE POLICY "evidence_templates_admin_write" ON evidence_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_super_admin = true
    )
  );

-- ============================================
-- Database Functions
-- ============================================

-- Calculate cross-framework portfolio coverage for an org
CREATE OR REPLACE FUNCTION calculate_portfolio_coverage(
  p_org_id UUID,
  p_framework_ids UUID[]
)
RETURNS TABLE(
  framework_id UUID,
  framework_code VARCHAR,
  framework_name VARCHAR,
  total_requirements BIGINT,
  covered_requirements BIGINT,
  coverage_pct NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.code,
    f.name,
    COUNT(DISTINCT fr.id)::BIGINT AS total_requirements,
    COUNT(DISTINCT CASE
      WHEN EXISTS (
        -- Check via UCF path
        SELECT 1 FROM ucf_requirement_mappings urm
        JOIN ucf_control_implementations oui ON oui.ucf_control_id = urm.ucf_control_id
        WHERE urm.requirement_id = fr.id
          AND oui.org_id = p_org_id
          AND oui.implementation_status = 'implemented'
      ) OR EXISTS (
        -- Also check via direct control mapping path
        SELECT 1 FROM control_requirement_mappings crm
        JOIN controls c ON c.id = crm.control_id
        WHERE crm.requirement_id = fr.id
          AND c.org_id = p_org_id
          AND c.status IN ('compliant', 'partially_compliant')
      )
      THEN fr.id
    END)::BIGINT AS covered_requirements,
    ROUND(
      COALESCE(
        COUNT(DISTINCT CASE
          WHEN EXISTS (
            SELECT 1 FROM ucf_requirement_mappings urm
            JOIN ucf_control_implementations oui ON oui.ucf_control_id = urm.ucf_control_id
            WHERE urm.requirement_id = fr.id
              AND oui.org_id = p_org_id
              AND oui.implementation_status = 'implemented'
          ) OR EXISTS (
            SELECT 1 FROM control_requirement_mappings crm
            JOIN controls c ON c.id = crm.control_id
            WHERE crm.requirement_id = fr.id
              AND c.org_id = p_org_id
              AND c.status IN ('compliant', 'partially_compliant')
          )
          THEN fr.id
        END)::NUMERIC / NULLIF(COUNT(DISTINCT fr.id), 0) * 100,
        0
      ), 1
    ) AS coverage_pct
  FROM frameworks f
  JOIN framework_requirements fr ON fr.framework_id = f.id
  WHERE f.id = ANY(p_framework_ids)
  GROUP BY f.id, f.code, f.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get UCF control cross-framework impact
CREATE OR REPLACE FUNCTION get_ucf_cross_impact(p_ucf_control_id UUID)
RETURNS TABLE(
  framework_id UUID,
  framework_code VARCHAR,
  framework_name VARCHAR,
  requirement_count BIGINT,
  requirement_codes TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.code,
    f.name,
    COUNT(DISTINCT fr.id)::BIGINT,
    ARRAY_AGG(DISTINCT fr.code ORDER BY fr.code)
  FROM ucf_requirement_mappings urm
  JOIN framework_requirements fr ON fr.id = urm.requirement_id
  JOIN frameworks f ON f.id = fr.framework_id
  WHERE urm.ucf_control_id = p_ucf_control_id
  GROUP BY f.id, f.code, f.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
