// GRC Platform Type Definitions

// ============================================
// Core Types
// ============================================

export interface Organization {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  logo_url?: string;
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  org_id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'compliance_manager' | 'auditor' | 'user' | 'viewer';
  department?: string;
  job_title?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Framework Types
// ============================================

export interface Framework {
  id: string;
  code: string;
  name: string;
  version?: string;
  authority?: string;
  category: 'security' | 'privacy' | 'industry' | 'regional';
  description?: string;
  official_url?: string;
  logo_url?: string;
  is_active: boolean;
  is_custom: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  framework_requirements?: { count: number }[];
  domains?: FrameworkDomain[];
  requirements_count?: number;
  compliance_percentage?: number;
}

export interface FrameworkDomain {
  id: string;
  framework_id: string;
  code: string;
  name: string;
  description?: string;
  display_order: number;
  created_at: string;
  // Computed
  requirements?: FrameworkRequirement[];
  requirements_count?: number;
}

export interface FrameworkRequirement {
  id: string;
  framework_id: string;
  domain_id?: string;
  code: string;
  name: string;
  description?: string;
  guidance?: string;
  evidence_requirements?: string;
  evidence_examples?: string[];
  testing_procedures?: string;
  is_mandatory: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  // Related data
  domain?: FrameworkDomain;
  controls?: Control[];
  evidence?: Evidence[];
  compliance_status?: 'compliant' | 'partial' | 'non_compliant' | 'not_assessed';
}

export interface OrgFramework {
  id: string;
  org_id: string;
  framework_id: string;
  status: 'not_started' | 'in_progress' | 'implemented' | 'certified';
  target_date?: string;
  certification_date?: string;
  expiry_date?: string;
  auditor?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Related
  framework?: Framework;
  compliance_percentage?: number;
}

// ============================================
// Control Types
// ============================================

export interface Control {
  id: string;
  org_id: string;
  requirement_id?: string;
  code: string;
  name: string;
  description?: string;
  implementation_details?: string;
  control_type?: 'preventive' | 'detective' | 'corrective' | 'compensating';
  control_nature?: 'manual' | 'automated' | 'hybrid';
  frequency?: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'ad-hoc';
  owner_id?: string;
  operator_id?: string;
  status: 'not_implemented' | 'in_progress' | 'implemented' | 'not_applicable';
  effectiveness?: 'effective' | 'partially_effective' | 'ineffective' | 'not_tested';
  last_tested_at?: string;
  next_review_date?: string;
  risk_rating?: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
  // Related
  requirement?: FrameworkRequirement;
  owner?: User;
  operator?: User;
  evidence?: Evidence[];
  tests?: ControlTest[];
}

export interface ControlTest {
  id: string;
  control_id: string;
  tested_by?: string;
  test_date: string;
  test_type: 'design' | 'operating_effectiveness' | 'walkthrough';
  sample_size?: number;
  sample_period_start?: string;
  sample_period_end?: string;
  result: 'passed' | 'failed' | 'partially_passed' | 'not_applicable';
  findings?: string;
  recommendations?: string;
  evidence_ids?: string[];
  created_at: string;
  // Related
  tester?: User;
}

// ============================================
// Evidence Types
// ============================================

export interface EvidenceCategory {
  id: string;
  org_id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Evidence {
  id: string;
  org_id: string;
  category_id?: string;
  title: string;
  description?: string;
  evidence_type: 'document' | 'screenshot' | 'log' | 'report' | 'policy' | 'procedure' | 'config' | 'certificate';
  file_name?: string;
  file_url?: string;
  file_size?: number;
  file_type?: string;
  collection_method: 'manual' | 'automated' | 'integration';
  source_system?: string;
  collected_by?: string;
  collected_at: string;
  valid_from?: string;
  valid_until?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  approved_by?: string;
  approved_at?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Related
  category?: EvidenceCategory;
  collector?: User;
  approver?: User;
  linked_controls?: Control[];
  linked_requirements?: FrameworkRequirement[];
}

// ============================================
// Risk Types
// ============================================

export interface RiskCategory {
  id: string;
  org_id: string;
  name: string;
  description?: string;
  color?: string;
  created_at: string;
}

export interface Risk {
  id: string;
  org_id: string;
  category_id?: string;
  risk_id?: string;
  title: string;
  description?: string;
  risk_source?: 'internal' | 'external' | 'third_party' | 'regulatory' | 'technology';
  threat_description?: string;
  vulnerability_description?: string;
  asset_affected?: string;

  // Inherent Risk
  inherent_likelihood: 1 | 2 | 3 | 4 | 5;
  inherent_impact: 1 | 2 | 3 | 4 | 5;
  inherent_risk_score: number;

  // Residual Risk
  residual_likelihood?: 1 | 2 | 3 | 4 | 5;
  residual_impact?: 1 | 2 | 3 | 4 | 5;
  residual_risk_score?: number;

  // Target Risk
  target_likelihood?: 1 | 2 | 3 | 4 | 5;
  target_impact?: 1 | 2 | 3 | 4 | 5;
  target_risk_score?: number;

  risk_appetite?: 'accept' | 'mitigate' | 'transfer' | 'avoid';
  status: 'identified' | 'assessed' | 'treating' | 'monitoring' | 'closed';
  owner_id?: string;
  reviewer_id?: string;
  identified_date?: string;
  review_date?: string;
  next_review_date?: string;

  // Financial Impact
  potential_loss_min?: number;
  potential_loss_max?: number;
  potential_loss_expected?: number;

  tags?: string[];
  created_at: string;
  updated_at: string;
  // Related
  category?: RiskCategory;
  owner?: User;
  treatments?: RiskTreatment[];
  controls?: Control[];
}

export interface RiskTreatment {
  id: string;
  risk_id: string;
  title: string;
  description?: string;
  treatment_type: 'mitigate' | 'accept' | 'transfer' | 'avoid';
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  owner_id?: string;
  due_date?: string;
  completed_date?: string;
  cost_estimate?: number;
  actual_cost?: number;
  effectiveness_rating?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Related
  owner?: User;
}

// ============================================
// Policy Types
// ============================================

export interface PolicyCategory {
  id: string;
  org_id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Policy {
  id: string;
  org_id: string;
  category_id?: string;
  policy_id?: string;
  title: string;
  description?: string;
  content?: string;
  version: string;
  status: 'draft' | 'pending_review' | 'pending_approval' | 'approved' | 'published' | 'archived';
  policy_type: 'policy' | 'standard' | 'procedure' | 'guideline';

  owner_id?: string;
  author_id?: string;
  reviewer_id?: string;
  approver_id?: string;
  approved_at?: string;

  effective_date?: string;
  review_date?: string;
  next_review_date?: string;
  expiry_date?: string;

  applies_to?: string[];
  parent_policy_id?: string;
  related_controls?: string[];
  related_risks?: string[];

  tags?: string[];
  created_at: string;
  updated_at: string;
  // Related
  category?: PolicyCategory;
  owner?: User;
  author?: User;
  acknowledgments_count?: number;
  pending_acknowledgments?: number;
}

export interface PolicyAcknowledgment {
  id: string;
  policy_id: string;
  user_id: string;
  acknowledged_at: string;
  ip_address?: string;
  user_agent?: string;
  user?: User;
}

// ============================================
// Vendor Types
// ============================================

export interface Vendor {
  id: string;
  org_id: string;
  vendor_id?: string;
  name: string;
  legal_name?: string;
  website?: string;
  description?: string;

  vendor_type?: 'saas' | 'iaas' | 'paas' | 'consulting' | 'hardware' | 'services';
  criticality: 'low' | 'medium' | 'high' | 'critical';
  data_classification?: 'public' | 'internal' | 'confidential' | 'restricted';

  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  address?: string;
  country?: string;

  contract_start_date?: string;
  contract_end_date?: string;
  contract_value?: number;
  payment_terms?: string;

  status: 'prospect' | 'active' | 'inactive' | 'terminated';
  onboarding_date?: string;
  offboarding_date?: string;

  risk_tier?: 'tier1' | 'tier2' | 'tier3' | 'tier4';
  inherent_risk_score?: number;
  residual_risk_score?: number;
  last_assessment_date?: string;
  next_assessment_date?: string;

  has_soc2: boolean;
  has_iso27001: boolean;
  has_pentest: boolean;
  has_insurance: boolean;

  owner_id?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Related
  owner?: User;
  assessments?: VendorAssessment[];
  documents?: VendorDocument[];
}

export interface VendorAssessment {
  id: string;
  vendor_id: string;
  assessment_type: 'initial' | 'annual' | 'triggered' | 'continuous';
  assessment_date: string;
  assessor_id?: string;

  overall_score?: number;
  security_score?: number;
  privacy_score?: number;
  compliance_score?: number;
  operational_score?: number;
  financial_score?: number;

  risk_rating?: 'low' | 'medium' | 'high' | 'critical';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  findings?: string;
  recommendations?: string;
  next_assessment_date?: string;

  created_at: string;
  updated_at: string;
  // Related
  assessor?: User;
  vendor?: Vendor;
}

export interface VendorDocument {
  id: string;
  vendor_id: string;
  document_type: 'contract' | 'nda' | 'soc2_report' | 'iso_cert' | 'insurance' | 'dpa';
  title?: string;
  file_name?: string;
  file_url?: string;
  valid_from?: string;
  valid_until?: string;
  uploaded_by?: string;
  created_at: string;
}

// ============================================
// Audit Types
// ============================================

export interface Audit {
  id: string;
  org_id: string;
  audit_id?: string;
  title: string;
  description?: string;
  audit_type: 'internal' | 'external' | 'regulatory' | 'certification';
  framework_id?: string;

  planned_start_date?: string;
  planned_end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;

  auditor_name?: string;
  auditor_firm?: string;
  lead_auditor_id?: string;

  status: 'planned' | 'in_progress' | 'fieldwork' | 'reporting' | 'completed' | 'cancelled';

  scope?: string;
  objectives?: string;
  audit_period_start?: string;
  audit_period_end?: string;

  opinion?: 'unqualified' | 'qualified' | 'adverse' | 'disclaimer';
  findings_count: number;

  owner_id?: string;
  created_at: string;
  updated_at: string;
  // Related
  framework?: Framework;
  owner?: User;
  findings?: AuditFinding[];
}

export interface AuditFinding {
  id: string;
  audit_id: string;
  finding_id?: string;
  title: string;
  description?: string;

  finding_type: 'deficiency' | 'significant_deficiency' | 'material_weakness' | 'observation' | 'improvement';
  severity: 'low' | 'medium' | 'high' | 'critical';
  category?: string;

  control_id?: string;
  requirement_id?: string;

  status: 'open' | 'in_progress' | 'remediated' | 'verified' | 'closed' | 'accepted';

  root_cause?: string;
  recommendation?: string;
  management_response?: string;
  remediation_plan?: string;
  remediation_owner_id?: string;
  due_date?: string;
  remediated_date?: string;
  verified_date?: string;
  verified_by?: string;

  created_at: string;
  updated_at: string;
  // Related
  audit?: Audit;
  control?: Control;
  remediation_owner?: User;
}

// ============================================
// Task Types
// ============================================

export interface Task {
  id: string;
  org_id: string;
  title: string;
  description?: string;
  task_type: 'control_review' | 'evidence_collection' | 'risk_assessment' | 'policy_review' | 'vendor_assessment' | 'remediation';

  related_type?: 'control' | 'risk' | 'policy' | 'vendor' | 'audit' | 'incident';
  related_id?: string;

  assigned_to?: string;
  assigned_by?: string;

  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';

  due_date?: string;
  completed_at?: string;

  is_recurring: boolean;
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';

  created_at: string;
  updated_at: string;
  // Related
  assignee?: User;
  assigner?: User;
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardStats {
  compliance: {
    overall_percentage: number;
    frameworks: {
      id: string;
      name: string;
      code: string;
      percentage: number;
      status: string;
    }[];
    controls_by_status: {
      implemented: number;
      in_progress: number;
      not_implemented: number;
      not_applicable: number;
    };
  };
  risks: {
    total: number;
    by_level: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    open: number;
    in_treatment: number;
  };
  tasks: {
    total: number;
    pending: number;
    overdue: number;
    completed_this_month: number;
  };
  evidence: {
    total: number;
    pending_review: number;
    expiring_soon: number;
  };
  vendors: {
    total: number;
    high_risk: number;
    due_for_assessment: number;
  };
  audit_findings: {
    open: number;
    overdue: number;
    closed_this_month: number;
  };
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ============================================
// Filter/Query Types
// ============================================

export interface FilterOptions {
  search?: string;
  status?: string | string[];
  category?: string;
  owner_id?: string;
  framework_id?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}
