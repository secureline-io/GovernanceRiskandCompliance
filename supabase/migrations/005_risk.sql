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
