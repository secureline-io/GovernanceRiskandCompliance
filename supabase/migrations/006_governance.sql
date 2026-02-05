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
