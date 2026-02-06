-- Migration: 010_audits.sql
-- Creates audits, audit_findings, and audit_readiness_items tables

CREATE TABLE IF NOT EXISTS audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  audit_type TEXT NOT NULL CHECK (audit_type IN ('internal','external','regulatory','certification')),
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning','in_progress','fieldwork','reporting','completed','closed')),
  start_date DATE,
  end_date DATE,
  auditor TEXT,
  lead_auditor_name TEXT,
  scope TEXT[] DEFAULT '{}',
  frameworks TEXT[] DEFAULT '{}',
  description TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical','high','medium','low','informational')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','remediation','verified','closed')),
  control_ref TEXT,
  description TEXT,
  remediation_plan TEXT,
  due_date DATE,
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_readiness_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('evidence','controls','policies','training','vendor')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','blocked')),
  assigned_to TEXT,
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_readiness_items ENABLE ROW LEVEL SECURITY;

-- Minimal open policies for now (adjust to org-level predicates later)
CREATE POLICY IF NOT EXISTS "audits_org_access" ON audits FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "audit_findings_org_access" ON audit_findings FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "audit_readiness_org_access" ON audit_readiness_items FOR ALL USING (true);
