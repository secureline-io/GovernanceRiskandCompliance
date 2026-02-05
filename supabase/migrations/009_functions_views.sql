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
