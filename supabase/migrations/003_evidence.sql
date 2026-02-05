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
