-- GRC Platform Complete Database Schema
-- Comprehensive schema for Governance, Risk, and Compliance Management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE ORGANIZATION & USER MANAGEMENT
-- ============================================

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    industry VARCHAR(100),
    size VARCHAR(50), -- small, medium, large, enterprise
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user', -- admin, compliance_manager, auditor, user, viewer
    department VARCHAR(100),
    job_title VARCHAR(100),
    phone VARCHAR(50),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams/Departments
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- ============================================
-- COMPLIANCE FRAMEWORKS & STANDARDS
-- ============================================

-- Compliance Frameworks (SOC 2, ISO 27001, NIST, PCI DSS, HIPAA, GDPR, etc.)
CREATE TABLE IF NOT EXISTS frameworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50),
    authority VARCHAR(255), -- AICPA, ISO, NIST, PCI SSC, HHS, EU
    category VARCHAR(100), -- security, privacy, industry, regional
    description TEXT,
    official_url TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_custom BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Framework Domains/Categories (e.g., SOC 2 Trust Services Criteria)
CREATE TABLE IF NOT EXISTS framework_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_id UUID REFERENCES frameworks(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Framework Requirements/Controls
CREATE TABLE IF NOT EXISTS framework_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_id UUID REFERENCES frameworks(id) ON DELETE CASCADE,
    domain_id UUID REFERENCES framework_domains(id) ON DELETE SET NULL,
    code VARCHAR(100) NOT NULL,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    guidance TEXT, -- Implementation guidance
    evidence_requirements TEXT, -- What evidence is needed
    evidence_examples TEXT[], -- Example evidence types
    testing_procedures TEXT,
    is_mandatory BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(framework_id, code)
);

-- Cross-framework mapping (e.g., SOC 2 CC6.1 maps to ISO 27001 A.9.1.1)
CREATE TABLE IF NOT EXISTS framework_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_requirement_id UUID REFERENCES framework_requirements(id) ON DELETE CASCADE,
    target_requirement_id UUID REFERENCES framework_requirements(id) ON DELETE CASCADE,
    mapping_type VARCHAR(50) DEFAULT 'equivalent', -- equivalent, partial, related
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_requirement_id, target_requirement_id)
);

-- ============================================
-- ORGANIZATION'S COMPLIANCE IMPLEMENTATION
-- ============================================

-- Organization's adopted frameworks
CREATE TABLE IF NOT EXISTS org_frameworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    framework_id UUID REFERENCES frameworks(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'not_started', -- not_started, in_progress, implemented, certified
    target_date DATE,
    certification_date DATE,
    expiry_date DATE,
    auditor VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, framework_id)
);

-- Organization's Controls (implementation of framework requirements)
CREATE TABLE IF NOT EXISTS controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    requirement_id UUID REFERENCES framework_requirements(id) ON DELETE SET NULL,
    code VARCHAR(100) NOT NULL,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    implementation_details TEXT,
    control_type VARCHAR(50), -- preventive, detective, corrective, compensating
    control_nature VARCHAR(50), -- manual, automated, hybrid
    frequency VARCHAR(50), -- continuous, daily, weekly, monthly, quarterly, annual, ad-hoc
    owner_id UUID REFERENCES users(id),
    operator_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'not_implemented', -- not_implemented, in_progress, implemented, not_applicable
    effectiveness VARCHAR(50), -- effective, partially_effective, ineffective, not_tested
    last_tested_at TIMESTAMPTZ,
    next_review_date DATE,
    risk_rating VARCHAR(20), -- low, medium, high, critical
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Control to Framework Requirement mapping (many-to-many)
CREATE TABLE IF NOT EXISTS control_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    control_id UUID REFERENCES controls(id) ON DELETE CASCADE,
    requirement_id UUID REFERENCES framework_requirements(id) ON DELETE CASCADE,
    coverage_percentage INT DEFAULT 100,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(control_id, requirement_id)
);

-- Control Test Results
CREATE TABLE IF NOT EXISTS control_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    control_id UUID REFERENCES controls(id) ON DELETE CASCADE,
    tested_by UUID REFERENCES users(id),
    test_date TIMESTAMPTZ DEFAULT NOW(),
    test_type VARCHAR(50), -- design, operating_effectiveness, walkthrough
    sample_size INT,
    sample_period_start DATE,
    sample_period_end DATE,
    result VARCHAR(50), -- passed, failed, partially_passed, not_applicable
    findings TEXT,
    recommendations TEXT,
    evidence_ids UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EVIDENCE MANAGEMENT
-- ============================================

-- Evidence Categories
CREATE TABLE IF NOT EXISTS evidence_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evidence/Artifacts
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    category_id UUID REFERENCES evidence_categories(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    evidence_type VARCHAR(100), -- document, screenshot, log, report, policy, procedure, config, certificate
    file_name VARCHAR(255),
    file_url TEXT,
    file_size BIGINT,
    file_type VARCHAR(100),
    collection_method VARCHAR(50), -- manual, automated, integration
    source_system VARCHAR(255),
    collected_by UUID REFERENCES users(id),
    collected_at TIMESTAMPTZ DEFAULT NOW(),
    valid_from DATE,
    valid_until DATE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, expired
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evidence to Control mapping
CREATE TABLE IF NOT EXISTS control_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    control_id UUID REFERENCES controls(id) ON DELETE CASCADE,
    evidence_id UUID REFERENCES evidence(id) ON DELETE CASCADE,
    linked_by UUID REFERENCES users(id),
    linked_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    UNIQUE(control_id, evidence_id)
);

-- Evidence to Requirement mapping (direct link)
CREATE TABLE IF NOT EXISTS requirement_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requirement_id UUID REFERENCES framework_requirements(id) ON DELETE CASCADE,
    evidence_id UUID REFERENCES evidence(id) ON DELETE CASCADE,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    linked_by UUID REFERENCES users(id),
    linked_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    UNIQUE(requirement_id, evidence_id, org_id)
);

-- ============================================
-- RISK MANAGEMENT
-- ============================================

-- Risk Categories
CREATE TABLE IF NOT EXISTS risk_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Risks Register
CREATE TABLE IF NOT EXISTS risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    category_id UUID REFERENCES risk_categories(id) ON DELETE SET NULL,
    risk_id VARCHAR(50), -- Custom ID like RISK-001
    title VARCHAR(500) NOT NULL,
    description TEXT,
    risk_source VARCHAR(100), -- internal, external, third_party, regulatory, technology
    threat_description TEXT,
    vulnerability_description TEXT,
    asset_affected TEXT,

    -- Inherent Risk (before controls)
    inherent_likelihood INT CHECK (inherent_likelihood BETWEEN 1 AND 5),
    inherent_impact INT CHECK (inherent_impact BETWEEN 1 AND 5),
    inherent_risk_score INT GENERATED ALWAYS AS (inherent_likelihood * inherent_impact) STORED,

    -- Residual Risk (after controls)
    residual_likelihood INT CHECK (residual_likelihood BETWEEN 1 AND 5),
    residual_impact INT CHECK (residual_impact BETWEEN 1 AND 5),
    residual_risk_score INT GENERATED ALWAYS AS (residual_likelihood * residual_impact) STORED,

    -- Target Risk (desired state)
    target_likelihood INT CHECK (target_likelihood BETWEEN 1 AND 5),
    target_impact INT CHECK (target_impact BETWEEN 1 AND 5),
    target_risk_score INT GENERATED ALWAYS AS (target_likelihood * target_impact) STORED,

    risk_appetite VARCHAR(50), -- accept, mitigate, transfer, avoid
    status VARCHAR(50) DEFAULT 'identified', -- identified, assessed, treating, monitoring, closed
    owner_id UUID REFERENCES users(id),
    reviewer_id UUID REFERENCES users(id),
    identified_date DATE DEFAULT CURRENT_DATE,
    review_date DATE,
    next_review_date DATE,

    -- Financial Impact
    potential_loss_min DECIMAL(15,2),
    potential_loss_max DECIMAL(15,2),
    potential_loss_expected DECIMAL(15,2),

    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Risk Treatments/Mitigations
CREATE TABLE IF NOT EXISTS risk_treatments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_id UUID REFERENCES risks(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    treatment_type VARCHAR(50), -- mitigate, accept, transfer, avoid
    status VARCHAR(50) DEFAULT 'planned', -- planned, in_progress, completed, cancelled
    priority VARCHAR(20), -- low, medium, high, critical
    owner_id UUID REFERENCES users(id),
    due_date DATE,
    completed_date DATE,
    cost_estimate DECIMAL(15,2),
    actual_cost DECIMAL(15,2),
    effectiveness_rating INT CHECK (effectiveness_rating BETWEEN 1 AND 5),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Risk to Control mapping
CREATE TABLE IF NOT EXISTS risk_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_id UUID REFERENCES risks(id) ON DELETE CASCADE,
    control_id UUID REFERENCES controls(id) ON DELETE CASCADE,
    effectiveness VARCHAR(50), -- effective, partially_effective, ineffective
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(risk_id, control_id)
);

-- Risk Assessments History
CREATE TABLE IF NOT EXISTS risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_id UUID REFERENCES risks(id) ON DELETE CASCADE,
    assessed_by UUID REFERENCES users(id),
    assessment_date TIMESTAMPTZ DEFAULT NOW(),
    likelihood INT,
    impact INT,
    risk_score INT,
    assessment_type VARCHAR(50), -- inherent, residual, target
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- POLICY MANAGEMENT
-- ============================================

-- Policy Categories
CREATE TABLE IF NOT EXISTS policy_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Policies
CREATE TABLE IF NOT EXISTS policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    category_id UUID REFERENCES policy_categories(id) ON DELETE SET NULL,
    policy_id VARCHAR(50), -- Custom ID like POL-001
    title VARCHAR(500) NOT NULL,
    description TEXT,
    content TEXT, -- Full policy content (markdown or HTML)
    version VARCHAR(20) DEFAULT '1.0',
    status VARCHAR(50) DEFAULT 'draft', -- draft, pending_review, pending_approval, approved, published, archived
    policy_type VARCHAR(50), -- policy, standard, procedure, guideline

    -- Ownership
    owner_id UUID REFERENCES users(id),
    author_id UUID REFERENCES users(id),

    -- Review/Approval
    reviewer_id UUID REFERENCES users(id),
    approver_id UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,

    -- Dates
    effective_date DATE,
    review_date DATE,
    next_review_date DATE,
    expiry_date DATE,

    -- Applicability
    applies_to TEXT[], -- departments, roles, or 'all'

    -- Related
    parent_policy_id UUID REFERENCES policies(id),
    related_controls UUID[],
    related_risks UUID[],

    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Policy Versions (history)
CREATE TABLE IF NOT EXISTS policy_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID REFERENCES policies(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    content TEXT,
    change_summary TEXT,
    changed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Policy Acknowledgments
CREATE TABLE IF NOT EXISTS policy_acknowledgments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID REFERENCES policies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    acknowledged_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    UNIQUE(policy_id, user_id)
);

-- Policy Exceptions
CREATE TABLE IF NOT EXISTS policy_exceptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID REFERENCES policies(id) ON DELETE CASCADE,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    justification TEXT,
    compensating_controls TEXT,
    requested_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, expired
    start_date DATE,
    end_date DATE,
    risk_accepted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VENDOR/THIRD-PARTY MANAGEMENT
-- ============================================

-- Vendors
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    vendor_id VARCHAR(50), -- Custom ID like VEN-001
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    website VARCHAR(500),
    description TEXT,

    -- Classification
    vendor_type VARCHAR(100), -- saas, iaas, paas, consulting, hardware, services
    criticality VARCHAR(20), -- low, medium, high, critical
    data_classification VARCHAR(50), -- public, internal, confidential, restricted

    -- Contact
    primary_contact_name VARCHAR(255),
    primary_contact_email VARCHAR(255),
    primary_contact_phone VARCHAR(50),
    address TEXT,
    country VARCHAR(100),

    -- Contract
    contract_start_date DATE,
    contract_end_date DATE,
    contract_value DECIMAL(15,2),
    payment_terms VARCHAR(100),

    -- Status
    status VARCHAR(50) DEFAULT 'active', -- prospect, active, inactive, terminated
    onboarding_date DATE,
    offboarding_date DATE,

    -- Risk & Compliance
    risk_tier VARCHAR(20), -- tier1, tier2, tier3, tier4
    inherent_risk_score INT,
    residual_risk_score INT,
    last_assessment_date DATE,
    next_assessment_date DATE,

    -- Security
    has_soc2 BOOLEAN DEFAULT false,
    has_iso27001 BOOLEAN DEFAULT false,
    has_pentest BOOLEAN DEFAULT false,
    has_insurance BOOLEAN DEFAULT false,

    owner_id UUID REFERENCES users(id),
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor Assessments
CREATE TABLE IF NOT EXISTS vendor_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    assessment_type VARCHAR(100), -- initial, annual, triggered, continuous
    assessment_date DATE DEFAULT CURRENT_DATE,
    assessor_id UUID REFERENCES users(id),

    -- Scores
    overall_score INT CHECK (overall_score BETWEEN 0 AND 100),
    security_score INT CHECK (security_score BETWEEN 0 AND 100),
    privacy_score INT CHECK (privacy_score BETWEEN 0 AND 100),
    compliance_score INT CHECK (compliance_score BETWEEN 0 AND 100),
    operational_score INT CHECK (operational_score BETWEEN 0 AND 100),
    financial_score INT CHECK (financial_score BETWEEN 0 AND 100),

    risk_rating VARCHAR(20), -- low, medium, high, critical
    status VARCHAR(50) DEFAULT 'in_progress', -- scheduled, in_progress, completed, cancelled
    findings TEXT,
    recommendations TEXT,
    next_assessment_date DATE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor Assessment Questions
CREATE TABLE IF NOT EXISTS vendor_assessment_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    category VARCHAR(100), -- security, privacy, compliance, operational
    question TEXT NOT NULL,
    description TEXT,
    weight INT DEFAULT 1,
    is_required BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor Assessment Responses
CREATE TABLE IF NOT EXISTS vendor_assessment_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES vendor_assessments(id) ON DELETE CASCADE,
    question_id UUID REFERENCES vendor_assessment_questions(id) ON DELETE CASCADE,
    response TEXT,
    score INT CHECK (score BETWEEN 0 AND 5),
    notes TEXT,
    evidence_id UUID REFERENCES evidence(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor Contacts
CREATE TABLE IF NOT EXISTS vendor_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor Documents
CREATE TABLE IF NOT EXISTS vendor_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    document_type VARCHAR(100), -- contract, nda, soc2_report, iso_cert, insurance, dpa
    title VARCHAR(500),
    file_name VARCHAR(255),
    file_url TEXT,
    valid_from DATE,
    valid_until DATE,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUDIT MANAGEMENT
-- ============================================

-- Audits
CREATE TABLE IF NOT EXISTS audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    audit_id VARCHAR(50), -- Custom ID like AUD-2024-001
    title VARCHAR(500) NOT NULL,
    description TEXT,
    audit_type VARCHAR(100), -- internal, external, regulatory, certification
    framework_id UUID REFERENCES frameworks(id),

    -- Timeline
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,

    -- Auditor Info
    auditor_name VARCHAR(255),
    auditor_firm VARCHAR(255),
    lead_auditor_id UUID REFERENCES users(id),

    -- Status
    status VARCHAR(50) DEFAULT 'planned', -- planned, in_progress, fieldwork, reporting, completed, cancelled

    -- Scope
    scope TEXT,
    objectives TEXT,
    audit_period_start DATE,
    audit_period_end DATE,

    -- Results
    opinion VARCHAR(50), -- unqualified, qualified, adverse, disclaimer
    findings_count INT DEFAULT 0,

    owner_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Findings
CREATE TABLE IF NOT EXISTS audit_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
    finding_id VARCHAR(50), -- Custom ID like FIND-001
    title VARCHAR(500) NOT NULL,
    description TEXT,

    -- Classification
    finding_type VARCHAR(50), -- deficiency, significant_deficiency, material_weakness, observation, improvement
    severity VARCHAR(20), -- low, medium, high, critical
    category VARCHAR(100),

    -- Related
    control_id UUID REFERENCES controls(id),
    requirement_id UUID REFERENCES framework_requirements(id),

    -- Status
    status VARCHAR(50) DEFAULT 'open', -- open, in_progress, remediated, verified, closed, accepted

    -- Remediation
    root_cause TEXT,
    recommendation TEXT,
    management_response TEXT,
    remediation_plan TEXT,
    remediation_owner_id UUID REFERENCES users(id),
    due_date DATE,
    remediated_date DATE,
    verified_date DATE,
    verified_by UUID REFERENCES users(id),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INCIDENTS & ISSUES
-- ============================================

-- Security Incidents
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    incident_id VARCHAR(50), -- Custom ID like INC-001
    title VARCHAR(500) NOT NULL,
    description TEXT,

    -- Classification
    incident_type VARCHAR(100), -- data_breach, malware, phishing, unauthorized_access, etc.
    severity VARCHAR(20), -- low, medium, high, critical
    priority VARCHAR(20),

    -- Timeline
    detected_at TIMESTAMPTZ,
    occurred_at TIMESTAMPTZ,
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    contained_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,

    -- Status
    status VARCHAR(50) DEFAULT 'new', -- new, investigating, containing, eradicating, recovering, closed

    -- Impact
    affected_systems TEXT[],
    affected_users INT,
    data_compromised BOOLEAN DEFAULT false,
    data_types_affected TEXT[],
    business_impact TEXT,

    -- Response
    reported_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    root_cause TEXT,
    lessons_learned TEXT,

    -- Regulatory
    requires_notification BOOLEAN DEFAULT false,
    notification_deadline TIMESTAMPTZ,
    notified_authorities TEXT[],
    notified_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TASKS & WORKFLOWS
-- ============================================

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    task_type VARCHAR(50), -- control_review, evidence_collection, risk_assessment, policy_review, vendor_assessment, remediation

    -- Related entities
    related_type VARCHAR(50), -- control, risk, policy, vendor, audit, incident
    related_id UUID,

    -- Assignment
    assigned_to UUID REFERENCES users(id),
    assigned_by UUID REFERENCES users(id),

    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, cancelled, overdue
    priority VARCHAR(20) DEFAULT 'medium',

    -- Dates
    due_date DATE,
    completed_at TIMESTAMPTZ,

    -- Recurrence
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern VARCHAR(50), -- daily, weekly, monthly, quarterly, annual

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments (for any entity)
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- control, risk, policy, vendor, audit, task, etc.
    entity_id UUID NOT NULL,
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Log / Audit Trail
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL, -- create, update, delete, view, export, etc.
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    entity_name VARCHAR(500),
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS & ALERTS
-- ============================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    title VARCHAR(500) NOT NULL,
    message TEXT,
    notification_type VARCHAR(50), -- task, reminder, alert, system
    priority VARCHAR(20) DEFAULT 'normal',

    -- Related
    entity_type VARCHAR(50),
    entity_id UUID,
    action_url TEXT,

    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REPORTING & DASHBOARDS
-- ============================================

-- Saved Reports
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(50), -- compliance, risk, audit, executive, custom
    config JSONB, -- Report configuration/filters
    schedule VARCHAR(50), -- daily, weekly, monthly, quarterly
    recipients TEXT[],
    last_generated_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dashboard Widgets
CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    widget_type VARCHAR(50), -- compliance_score, risk_heatmap, tasks_overview, etc.
    title VARCHAR(255),
    config JSONB,
    position INT DEFAULT 0,
    size VARCHAR(20) DEFAULT 'medium', -- small, medium, large
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INTEGRATIONS
-- ============================================

-- Integration Connections
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    integration_type VARCHAR(100), -- aws, azure, gcp, okta, jira, slack, etc.
    name VARCHAR(255) NOT NULL,
    config JSONB, -- Encrypted configuration
    status VARCHAR(50) DEFAULT 'active',
    last_sync_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_org ON users(org_id);
CREATE INDEX IF NOT EXISTS idx_controls_org ON controls(org_id);
CREATE INDEX IF NOT EXISTS idx_controls_status ON controls(status);
CREATE INDEX IF NOT EXISTS idx_controls_owner ON controls(owner_id);
CREATE INDEX IF NOT EXISTS idx_evidence_org ON evidence(org_id);
CREATE INDEX IF NOT EXISTS idx_evidence_status ON evidence(status);
CREATE INDEX IF NOT EXISTS idx_risks_org ON risks(org_id);
CREATE INDEX IF NOT EXISTS idx_risks_status ON risks(status);
CREATE INDEX IF NOT EXISTS idx_risks_owner ON risks(owner_id);
CREATE INDEX IF NOT EXISTS idx_policies_org ON policies(org_id);
CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);
CREATE INDEX IF NOT EXISTS idx_vendors_org ON vendors(org_id);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_audits_org ON audits(org_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org ON tasks(org_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_activity_log_org ON activity_log(org_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_framework_requirements_framework ON framework_requirements(framework_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Framework tables are public read
CREATE POLICY "Frameworks are viewable by everyone" ON frameworks FOR SELECT USING (true);
CREATE POLICY "Framework domains are viewable by everyone" ON framework_domains FOR SELECT USING (true);
CREATE POLICY "Framework requirements are viewable by everyone" ON framework_requirements FOR SELECT USING (true);

-- Organization data policies
CREATE POLICY "Users can view their organization" ON organizations FOR SELECT USING (
    id IN (SELECT org_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can view org members" ON users FOR SELECT USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can view org controls" ON controls FOR SELECT USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can view org evidence" ON evidence FOR SELECT USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can view org risks" ON risks FOR SELECT USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can view org policies" ON policies FOR SELECT USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can view org vendors" ON vendors FOR SELECT USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can view org audits" ON audits FOR SELECT USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can view their tasks" ON tasks FOR SELECT USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (
    user_id = auth.uid()
);
