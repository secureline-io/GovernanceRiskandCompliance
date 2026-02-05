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
