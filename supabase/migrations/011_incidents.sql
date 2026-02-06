-- Migration: 011_incidents.sql
-- Creates incidents and incident_timeline tables

CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('critical','high','medium','low')),
  status TEXT NOT NULL DEFAULT 'detected' CHECK (status IN ('detected','triaged','contained','eradicated','recovered','closed','post_mortem')),
  incident_type TEXT CHECK (incident_type IN ('security_breach','data_leak','system_outage','compliance_violation','vendor_incident','phishing','malware','unauthorized_access','other')),
  detected_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  commander TEXT,
  affected_systems TEXT[] DEFAULT '{}',
  linked_risk_ids UUID[] DEFAULT '{}',
  linked_control_ids UUID[] DEFAULT '{}',
  linked_policy_ids UUID[] DEFAULT '{}',
  root_cause TEXT,
  impact_assessment TEXT,
  lessons_learned TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS incident_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('status_change','note','action','escalation','communication')),
  description TEXT NOT NULL,
  author TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "incidents_org_access" ON incidents FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "incident_timeline_access" ON incident_timeline FOR ALL USING (true);
