# GRC Platform - Enhanced Cursor Development Prompts
## Based on Scrut Platform Gap Analysis

> **These prompts address every gap identified in the Scrut GRC Platform Analysis.**
> Run sequentially in Cursor. Each prompt builds on prior work.
> **Stack**: Next.js 16 (App Router) + React 19 + TypeScript 5 + Supabase + Tailwind CSS 4 + Lucide React + Recharts
> **Pattern**: All pages `'use client'`, fetch from `/api/{resource}?org_id=default`, `DEFAULT_ORG_ID = 'default'`

---

## PHASE 1: CRITICAL BACKEND GAPS

### Prompt 1A: Audits API + Migration

```
Create the Audits management backend. The database does NOT have an audits table yet.

1. Create migration `supabase/migrations/010_audits.sql`:

CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  audit_type TEXT NOT NULL CHECK (audit_type IN ('internal','external','regulatory','certification')),
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning','in_progress','fieldwork','reporting','completed','closed')),
  start_date DATE, end_date DATE,
  auditor TEXT, lead_auditor_name TEXT,
  scope TEXT[] DEFAULT '{}', frameworks TEXT[] DEFAULT '{}',
  description TEXT, progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE audit_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical','high','medium','low','informational')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','remediation','verified','closed')),
  control_ref TEXT, description TEXT, remediation_plan TEXT, due_date DATE,
  assigned_to TEXT, -- addresses Scrut gap: task assignment tracking
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

-- Audit readiness checklist items (addresses Scrut gap: weak audit readiness)
CREATE TABLE audit_readiness_items (
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
CREATE POLICY "audits_org_access" ON audits FOR ALL USING (true);
CREATE POLICY "audit_findings_org_access" ON audit_findings FOR ALL USING (true);
CREATE POLICY "audit_readiness_org_access" ON audit_readiness_items FOR ALL USING (true);

2. Create API routes following the pattern in `src/app/api/risks/route.ts`:

- `src/app/api/audits/route.ts` — GET (list with org_id filter, include finding counts via subquery) + POST
- `src/app/api/audits/[id]/route.ts` — GET (with findings array), PATCH, DELETE
- `src/app/api/audits/[id]/findings/route.ts` — GET + POST (with assigned_to field)
- `src/app/api/audits/[id]/readiness/route.ts` — GET + POST for readiness checklist items

Use `supabaseAdmin` from `@/lib/supabase/server`. Return `{ data: results }`.
Log with `supabaseAdmin.rpc('log_audit_event', ...)`.
```

### Prompt 1B: CSPM / Cloud Accounts API

```
Create CSPM API routes. Database has tables: cloud_accounts, assets, cspm_policies, findings (migration 004_cspm.sql).

Create:
1. `src/app/api/cloud-accounts/route.ts` — GET (with finding counts per account) + POST
2. `src/app/api/cloud-accounts/[id]/route.ts` — GET (with findings), PATCH, DELETE
3. `src/app/api/cspm/findings/route.ts` — GET (filter by org_id, severity, cloud_account_id) + POST
4. `src/app/api/cspm/stats/route.ts` — GET aggregated stats: total accounts by provider, finding severity breakdown, accounts with errors

Follow `src/app/api/vendors/route.ts` pattern. Add audit logging for mutations.
```

### Prompt 1C: Incident Response API (NEW MODULE — addresses critical Scrut gap)

```
Create the Incident Response module backend. This is entirely new.

1. Create migration `supabase/migrations/011_incidents.sql`:

CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('critical','high','medium','low')),
  status TEXT NOT NULL DEFAULT 'detected' CHECK (status IN ('detected','triaged','contained','eradicated','recovered','closed','post_mortem')),
  incident_type TEXT CHECK (incident_type IN ('security_breach','data_leak','system_outage','compliance_violation','vendor_incident','phishing','malware','unauthorized_access','other')),
  detected_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  commander TEXT, -- incident commander name
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

CREATE TABLE incident_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('status_change','note','action','escalation','communication')),
  description TEXT NOT NULL,
  author TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "incidents_org_access" ON incidents FOR ALL USING (true);
CREATE POLICY "incident_timeline_access" ON incident_timeline FOR ALL USING (true);

2. Create API routes:
- `src/app/api/incidents/route.ts` — GET + POST
- `src/app/api/incidents/[id]/route.ts` — GET (with timeline), PATCH, DELETE
- `src/app/api/incidents/[id]/timeline/route.ts` — GET + POST for timeline events

Follow the same pattern as audits API. Include audit logging.
```

### Prompt 1D: Assets + Integrations APIs

```
Create remaining missing API routes.

1. `src/app/api/assets/route.ts` — GET (filter by org_id, type, criticality) + POST
   `src/app/api/assets/[id]/route.ts` — GET, PATCH, DELETE
   Database table: `assets` from 004_cspm.sql

2. `src/app/api/integrations/route.ts` — GET + POST
   `src/app/api/integrations/[id]/route.ts` — GET, PATCH, DELETE
   Database table: `integrations` from 007_vendors.sql

   Additional fields for integration health monitoring (addresses Scrut gap: sync bugs):
   - Add `last_sync_at TIMESTAMPTZ`, `sync_status TEXT`, `error_message TEXT` to the response
   - GET should return `{ data: integrations, stats: { active, error, total } }`

Follow `src/app/api/vendors/route.ts` pattern. Return `{ data: results }`.
```

### Prompt 1E: Evidence Mapping API (addresses Scrut gap: evidence reuse opacity)

```
Create an evidence mapping endpoint that shows evidence reuse across frameworks and controls.

Create `src/app/api/evidence/mapping/route.ts`:
- GET: Returns a mapping showing:
  - For each evidence item: which controls it satisfies (via evidence_control_links table)
  - For each control: which frameworks it maps to (via control_requirement_mappings)
  - Reuse count: how many different framework requirements each evidence item satisfies
  - Gap analysis: controls that have NO linked evidence

The query should join evidence → evidence_control_links → controls → control_requirement_mappings → framework_requirements → frameworks

Response format:
{
  data: {
    evidence_reuse: [{ evidence_id, title, linked_controls: number, linked_frameworks: string[] }],
    ungapped_controls: [{ control_id, code, name, has_evidence: boolean, evidence_source: 'automated'|'manual'|'none' }],
    framework_coverage: [{ framework_id, name, total_requirements: number, covered: number, coverage_pct: number }]
  }
}
```

---

## PHASE 2: REWIRE PAGES WITH MOCK DATA

### Prompt 2A: Audits Page — Full Implementation

```
Rewrite `src/app/audits/page.tsx` to use real API data. Current page (647 lines) has excellent UI
but uses 5 hardcoded audit objects.

Requirements (addresses Scrut gaps: task assignment bugs, audit readiness output):
1. Remove ALL mock data arrays
2. Fetch from `GET /api/audits?org_id=default` on mount
3. Use useCallback/useEffect/loading pattern consistent with other pages
4. Add "Add Audit" button → CreateAuditModal with fields:
   name, audit_type, auditor, lead_auditor_name, start_date, end_date, description,
   scope (comma-separated), frameworks (comma-separated)
5. Wire create to POST /api/audits with org_id: 'default'
6. **NEW: Audit Readiness Checklist tab** (addresses Scrut gap)
   - Fetch from GET /api/audits/{id}/readiness
   - Show checklist items: title, category badge, status, assigned_to, due_date
   - Allow creating new checklist items via POST
   - Show completion percentage per category (evidence, controls, policies, training, vendor)
7. **NEW: Finding Assignment** (addresses Scrut gap: task assignment)
   - Each finding shows assigned_to field
   - Allow reassignment via PATCH
   - Show notification icon for unassigned findings
8. Status update via inline dropdown (PATCH /api/audits/{id})
9. Finding detail expansion showing: title, severity, status, control_ref, remediation_plan, assigned_to
10. Export to CSV
11. Empty state: "No audits yet. Click Add Audit to start your first compliance audit."

Keep existing visual design (status badges, progress bars, severity colors, calendar view).
```

### Prompt 2B: CSPM Page — Connect to Real API

```
Rewrite `src/app/cspm/page.tsx` to use real data. Current page (387 lines) has mock cloud accounts and findings.

Requirements (addresses Scrut gaps: integration sync bugs, token management):
1. Remove ALL mock data
2. Fetch cloud accounts from GET /api/cloud-accounts?org_id=default
3. Fetch findings from GET /api/cspm/findings?org_id=default
4. "Connect Account" button → ConnectCloudAccountModal:
   provider (AWS/Azure/GCP), account_id, account_name, regions
5. **NEW: Sync Status Indicators** (addresses Scrut gap)
   - Each cloud account shows: last_sync_at, sync_status badge (syncing/synced/error)
   - "Sync Now" button per account (PATCH to trigger refresh)
   - Error accounts highlighted in red with error message
6. **NEW: Token Health** (addresses Scrut gap: expired tokens)
   - Show warning banner for accounts with sync errors
   - "⚠ 2 accounts need attention" notification
7. Finding severity breakdown chart using Recharts
8. Filter by severity, provider, account
9. Export findings to CSV
```

### Prompt 2C: Settings Page — Functional Implementation

```
Update `src/app/settings/page.tsx` to make all settings functional.

Requirements (addresses Scrut gaps: RBAC granularity, API key management):
1. Fetch org data from GET /api/organizations?org_id=default
2. Profile form saves via PATCH /api/organizations/default

3. **NEW: Granular Permissions Tab** (addresses Scrut gap: RBAC)
   - Show role-permission matrix: rows=roles (admin/auditor/analyst/viewer), cols=modules (compliance/risks/policies/vendors/audits/settings)
   - Each cell: Read/Write/None toggle
   - "Custom Role" creation with module-level permissions
   - Save to localStorage until auth is built
   - Banner: "Role management preview. Enable SSO for enforcement."

4. **NEW: API Key Management Tab** (addresses Scrut gap)
   - "Generate API Key" button (creates mock key, stores in localStorage)
   - Show list of generated keys: name, created date, last used, expiration
   - Revoke/Delete buttons
   - Usage monitoring placeholder
   - Banner: "API keys are simulated in local mode."

5. **NEW: Notification Preferences Tab** (addresses Scrut gap: hidden tasks)
   - Toggle notifications for: audit deadlines, control failures, policy updates, risk changes,
     vendor assessments, evidence expiry, integration errors, acknowledgement reminders
   - Delivery method: in-app, email (mock)
   - Save to localStorage

6. Security tab: MFA toggle, session timeout slider, password policy display
```

---

## PHASE 3: BUILD STUB PAGES

### Prompt 3A: Incident Response Page (NEW MODULE)

```
Build a complete Incident Response page at `src/app/incidents/page.tsx`.
This is ENTIRELY NEW — addresses the critical Scrut gap of missing incident management.

Requirements:
1. Fetch from GET /api/incidents?org_id=default
2. Summary cards: Active Incidents, Critical/High, Avg Resolution Time, Post-Mortems Pending
3. Incident list with: title, severity badge, status badge (7 stages), incident_type, commander, detected_at, elapsed time
4. Status workflow visualization: Detected → Triaged → Contained → Eradicated → Recovered → Closed → Post-Mortem
5. Click incident to expand showing:
   - Timeline (from /api/incidents/{id}/timeline)
   - Linked risks, controls, policies
   - Affected systems
   - Root cause analysis field
   - Impact assessment field
6. "Create Incident" button → CreateIncidentModal:
   title, severity, incident_type, description, commander, affected_systems (comma-separated)
7. "Add Timeline Event" button on expanded incident: event_type dropdown, description
8. Runbook templates section with common incident procedures:
   - Data Breach Response
   - System Outage Recovery
   - Unauthorized Access Protocol
   Each template shows step-by-step checklist (stored in localStorage)
9. Post-mortem report generation: compile incident details + timeline into exportable format
10. Filter by severity, status, incident_type
11. Export to CSV

Import: AlertOctagon, Shield, Clock, Users, Activity, FileText, Plus, CheckCircle2, XCircle, ChevronDown, ChevronUp, RefreshCw from lucide-react
Add "Incidents" to the Sidebar navigation under the Security section.
```

### Prompt 3B: Assets Page with Criticality Tracking

```
Build `src/app/assets/page.tsx`. Replace "Coming Soon" stub.

IT asset inventory with ownership, criticality tracking, and cloud linkage.

Requirements:
1. Fetch from GET /api/assets?org_id=default
2. Stats: Total Assets, Critical, High-Risk, Unassigned (no owner)
3. Filter by type: Server, Database, Application, Network, Endpoint, Cloud Resource
4. Filter by criticality: Critical (red), High (orange), Medium (amber), Low (green)
5. Search by name/description
6. Asset cards: name, type icon+badge, criticality badge, owner, description, cloud_account linkage
7. "Add Asset" → CreateAssetModal: name, type dropdown, criticality dropdown, owner, description
8. **Criticality auto-assessment** (addresses Scrut gap: risk scoring):
   Show prompt "Assets connected to production systems are automatically marked High criticality"
9. Export to CSV
10. Empty state with "Add First Asset" button

Import: Box, Server, Database, Globe, Monitor, Cloud, Plus, Download, Search, RefreshCw from lucide-react
```

### Prompt 3C: Corrective Action Plans Page

```
Build `src/app/corrective-action/page.tsx`. Replace stub.
Tracks remediation for audit findings and control gaps.

Uses the `findings` table data (GET /api/findings?org_id=default).

Requirements:
1. Filter to findings with status 'open' or 'in_progress'
2. Stats: Total Open, Critical/High Priority, Overdue (past due_date), Resolved This Month
3. Filter by severity and status
4. Each item: title, severity badge, status badge, control_ref, due_date, assigned_to
5. **Inline status update** via dropdown → PATCH /api/findings/${id}
6. **Due date tracking** (addresses Scrut gap: hidden tasks):
   - Red highlight for overdue items
   - Amber for due within 7 days
   - Green for on track
7. **Progress tracking**: show % of total findings resolved as progress bar
8. Export to CSV
9. Empty state: "All findings resolved! Great compliance posture."
```

### Prompt 3D: Reports & Analytics Page

```
Build `src/app/reports/page.tsx`. Replace stub.
Comprehensive reporting hub aggregating all modules.

Requirements (addresses Scrut gap: limited customization, flexible exports):
1. Fetch from 6 endpoints via Promise.allSettled:
   /api/dashboard, /api/frameworks, /api/risks, /api/controls, /api/evidence, /api/vendors

2. **Report Builder** (addresses Scrut gap: custom reports):
   - Drag-and-drop field selection from available data
   - Preset report templates:
     a. Executive Summary (compliance %, risk count, open findings)
     b. Framework Compliance Detail (per-framework with progress bars)
     c. Risk Assessment Report (risk register with severity distribution)
     d. Vendor Risk Summary
     e. Evidence Collection Status
     f. Control Effectiveness Analysis
     g. Audit Readiness Report
   - Each report can be generated with date range filter (30d, 90d, 1yr, all)

3. **Export Options** (addresses Scrut gap):
   - CSV via exportToCSV from @/lib/export
   - JSON via exportToJSON
   - Print-friendly HTML view

4. **Compliance Trend Chart** using Recharts (BarChart showing framework compliance %)
5. Quick stats row at top
6. Scheduled reports section (localStorage): "Send Executive Summary weekly"

Import: BarChart3, FileText, Download, RefreshCw, TrendingUp, Shield, Calendar, Settings from lucide-react
```

### Prompt 3E: Training Management Page

```
Build `src/app/training/page.tsx`. Replace stub.
Security awareness and compliance training management.

Requirements (addresses Scrut gap: training-policy disconnect):
1. Training programs stored in localStorage until backend is built
2. Pre-configured programs:
   - Security Awareness (annual)
   - Data Privacy (GDPR/CCPA)
   - Incident Response
   - Phishing Simulation
3. **Policy Integration** (addresses Scrut gap):
   - Fetch policies from GET /api/policies?org_id=default
   - Show which policies require associated training
   - "Link Policy" button to associate training with policy
   - Combined progress: training completion + policy acknowledgement
4. Per-program tracking: name, completion rate, due date, status
5. Employee completion tracking (localStorage)
6. Stats: Total Programs, Avg Completion, Overdue, Upcoming
7. Export training status to CSV
8. Banner: "Training data is stored locally. Connect an LMS for automatic tracking."
```

### Prompt 3F: Integrations Hub Page

```
Build `src/app/integrations/page.tsx`. Replace stub.

Requirements (addresses Scrut gaps: setup difficulties, limited coverage, sync bugs):
1. Fetch from GET /api/integrations?org_id=default
2. Integration cards grid for: Slack, Jira, GitHub, AWS, Azure, GCP, Okta, PagerDuty, Google Workspace,
   Microsoft Defender, Intune (addresses specific Scrut gap)
3. Each card: name, icon, description, status badge, last_sync_at, error_message if any
4. **Setup Wizard** (addresses Scrut gap: setup difficulties):
   - Step-by-step configuration modal for each integration
   - Step 1: Enter API key / OAuth redirect
   - Step 2: Select scope (which data to sync)
   - Step 3: Map to controls (which controls this integration provides evidence for)
   - Step 4: Test connection
   - Step 5: Set sync frequency
5. **Sync Logs** (addresses Scrut gap: insufficient logs):
   - Expandable section per integration showing sync history
   - Success/failure with timestamps and error codes
   - Retry button for failed syncs
6. **Evidence Mapping** (addresses Scrut gap: mapping clarity):
   - Per integration: show which controls are automated by this integration
   - "X controls covered" badge on each integration card
7. **Token Health Monitor** (addresses Scrut gap: token management):
   - Warning for expiring tokens (within 30 days)
   - Error alert for expired/revoked tokens
   - "Refresh Token" button
8. Stats: Total Configured, Active, Errors, Evidence Items Collected
9. Connected at top, Available below
```

### Prompt 3G: Access Control Page

```
Build `src/app/access/page.tsx`. Replace stub.

Requirements (addresses Scrut gap: RBAC granularity):
1. Fetch controls from GET /api/controls?org_id=default, filter by category containing 'access'
2. Stats: Total Access Controls, Compliant, Non-Compliant, Pending Review
3. **Access Review Dashboard**:
   - Controls needing periodic review (based on frequency field)
   - Last review date vs next review date calculation
   - "Mark Reviewed" button → PATCH control status
4. **Access Review Checklist** (addresses Scrut gap):
   - Privileged access review (checkbox + date)
   - User access certification
   - Service account audit
   - Third-party access review
   - Dormant account cleanup
   Store in localStorage
5. **Permission Matrix View**:
   Show roles vs modules matrix (preview of RBAC system)
6. Export to CSV
```

### Prompt 3H: Employees Page

```
Build `src/app/employees/page.tsx`. Replace stub.

Requirements:
1. Employee directory stored in localStorage until backend
2. Add Employee form: name, email, role dropdown (admin/auditor/analyst/viewer), department
3. Stats: Total, by Role
4. Employee table: name, email, role badge, department, training status, last active
5. **Training Correlation** (addresses Scrut gap):
   - Show training completion per employee
   - Policy acknowledgement status per employee
   - "X policies pending" indicator
6. Search by name/email
7. Role color coding: admin=purple, auditor=blue, analyst=green, viewer=gray
8. Export to CSV
9. Banner: "Employee directory stored locally. Enable SSO for automatic sync."
```

### Prompt 3I: Tests / Control Testing Page

```
Build `src/app/tests/page.tsx`. Replace partial stub.

Requirements:
1. Fetch controls from GET /api/controls?org_id=default
2. Test execution interface: select control, record result (Pass/Fail/Partial/N/A), notes, date
3. Store results in localStorage 'grc_test_results'
4. Stats: Scheduled (untested in 90d), In Progress, Completed (quarter), Failed
5. Test history table: control code, name, last test date, result badge, tester, notes
6. **Automated Testing Indicators** (addresses Scrut gap: control automation):
   - Badge showing if test can be automated via integration
   - "Auto-test" for controls linked to integrations
   - "Manual" for controls requiring human verification
7. Filter by result
8. "Run Test" modal
9. Export results to CSV
```

### Prompt 3J: Trust Vault + Vault + Updates Pages

```
Build these 3 remaining pages:

1. `src/app/trust-vault/page.tsx` — Public trust center preview
   - Fetch frameworks, published policies, controls, vendors
   - Sections: Certifications, Published Policies, Security Posture, Sub-processors
   - Public/Private toggle per section (localStorage)
   - Preview mode
   - Stats: Certifications, Published Policies, Page Views (mock), Uptime (mock)

2. `src/app/vault/page.tsx` — Secure document storage
   - Fetch from GET /api/evidence?org_id=default
   - Organize by category: Credentials, Certificates, Policies, Audit Reports
   - Show SHA-256 hash integrity status
   - Upload linking to evidence creation
   - Search and filter

3. `src/app/updates/page.tsx` — Platform changelog
   - Static content: v2.0 (Feb 2026), v1.5 (Jan 2026), v1.0 (Dec 2025)
   - Timeline-style design
   - Status badges: Latest, Current, Previous
   - No API needed
```

---

## PHASE 4: DASHBOARD SUB-COMPONENTS

### Prompt 4A: Overview + Compliance Views

```
Rewrite `src/components/dashboard/Overview.tsx` and `ComplianceView.tsx` to use real data.

Overview.tsx:
- Accept dashboard stats as props
- Show REAL: compliance %, open findings, open risks, vendor reviews pending
- Framework compliance bars from frameworks data
- **Pending Tasks Widget** (addresses Scrut gap: hidden tasks):
  Show top 5 actionable items with due dates and direct links
- Quick action links

ComplianceView.tsx:
- Accept frameworks data as props
- For each framework: name, version, total requirements, mapped controls, compliance %
- **Evidence Reuse Indicator** (addresses Scrut gap):
  Show "X evidence items shared across Y frameworks" summary
- Color code: >80% green, 60-80% amber, <60% red
- Click to navigate to /compliance

Remove ALL hardcoded numbers.
```

### Prompt 4B: Risk + Evidence + Policy + Vendor + CSPM Views

```
Rewrite all remaining dashboard sub-components to use real data:

RiskView.tsx:
- Fetch or accept risks as props
- Risk distribution donut chart (Recharts)
- Top 5 risks by score
- **Risk-Control Effectiveness** (addresses Scrut gap): show how controls reduce risk

EvidenceView.tsx:
- Fetch or accept evidence as props
- Total count, automated vs manual split
- **Evidence Gap Indicator** (addresses Scrut gap): "X controls lack evidence"
- Recent uploads list

PoliciesView.tsx:
- Fetch or accept policies as props
- Published/Draft/Archived counts
- **Acknowledgement Health** (addresses Scrut gap): avg ack rate, overdue count
- Policies needing review (>90 days old)

VendorsView.tsx:
- Fetch or accept vendors as props
- Risk distribution, pending assessments
- **Assessment Freshness** (addresses Scrut gap): vendors not assessed in 90+ days

CSPMView.tsx:
- Fetch cloud accounts + findings
- Account status cards
- Finding severity breakdown
- **Sync Health** (addresses Scrut gap): show accounts with sync errors
```

---

## PHASE 5: CROSS-CUTTING IMPROVEMENTS

### Prompt 5A: Global Search + Notifications

```
Update `src/components/Header.tsx` to add functional search and notifications.

Requirements (addresses Scrut gap: hidden tasks, dashboard customization):

1. **Global Search** with debounced multi-endpoint search:
   - Search controls (by code/name), risks (by title), policies (by title),
     vendors (by name), evidence (by title), incidents (by title)
   - Debounce 300ms
   - Results dropdown: icon per type, title, link to page
   - Keyboard shortcut: Cmd/Ctrl+K to focus

2. **Notifications Panel** (addresses Scrut gap: proactive alerts):
   - Fetch audit_logs + compute alerts from dashboard data
   - Alert types:
     a. Overdue tasks (findings past due_date)
     b. Expiring tokens (integration sync errors)
     c. Pending acknowledgements (policies)
     d. Control test overdue (>90 days)
     e. Upcoming audits (within 14 days)
   - Badge count = unread alerts (last 24h)
   - Click to expand dropdown
   - Mark as read functionality (localStorage)

3. **User Menu**: "GRC Admin", link to /settings, "Local Mode" badge
```

### Prompt 5B: Sidebar Navigation Update

```
Update `src/components/Sidebar.tsx`:

1. Replace hardcoded "Subham Gupta" with "GRC Admin" / "admin@company.com"
2. Add "Local Mode" badge
3. Add new navigation items:
   - Under Security: "Incidents" → /incidents (NEW)
   - Verify all links point to correct routes
4. **Active Route Highlighting**: Use Next.js usePathname() to highlight current page
5. Add badge counts on sidebar items showing:
   - Open Findings count on "Corrective Actions"
   - Active Incidents count on "Incidents"
   (fetch from localStorage or pass as props)
```

### Prompt 5C: Admin Page — Audit Logs + RBAC Preview

```
Update `src/app/admin/page.tsx` (addresses Scrut gap: RBAC, API monitoring):

1. Replace hardcoded audit log entries with real data
2. Add "Audit Log" tab:
   - Fetch from dashboard API or new endpoint
   - Table: timestamp, user, action, resource_type, resource_id, details
   - Pagination (20 per page)
   - Filter by action type, date range
   - Export to CSV

3. Add "Permissions" tab (RBAC preview):
   - Role-permission matrix (admin/auditor/analyst/viewer × modules)
   - Custom role creation
   - Save to localStorage

4. Add "API Usage" tab:
   - API call log (from localStorage for now)
   - Request count per endpoint chart
   - Error rate tracking
```

### Prompt 5D: Performance Optimizations (addresses Scrut gap: heatmap performance)

```
Add performance optimizations across the platform:

1. **Lazy Loading**: Add React.lazy() for non-critical page components:
   - Dashboard sub-components (Overview, ComplianceView, etc.)
   - Modals (CreateControlModal, CreateRiskModal, etc.)
   Use Suspense fallback with RefreshCw spinner

2. **Data Pagination**: For pages with large datasets:
   - Controls page: add "Load More" or pagination (20 per page)
   - Risks page: virtual scrolling for heat map with 100+ risks
   - Evidence page: pagination with page numbers

3. **Debounced Search**: Ensure all search inputs use 300ms debounce:
   - Controls search
   - Risks search
   - Evidence search
   - Vendors search

4. **Memoization**: Wrap computed values with useMemo:
   - Stats calculations (total, filtered counts)
   - Filtered/searched arrays
   - Color mappings and badge configs
```

---

## PHASE 6: HOOKS + TYPES

### Prompt 6A: New Data Hooks

```
Add missing hooks to `src/lib/hooks/`:

1. `useAudits.ts` — useAudits() with CRUD + createFinding, fetchReadiness
2. `useAssets.ts` — useAssets() with CRUD
3. `useIntegrations.ts` — useIntegrations() with CRUD + testConnection
4. `useIncidents.ts` — useIncidents() with CRUD + addTimelineEvent
5. `useCloudAccounts.ts` — useCloudAccounts() with CRUD + syncAccount
6. `useEvidenceMapping.ts` — useEvidenceMapping() for evidence reuse data

Update `src/lib/hooks/index.ts` to export all new hooks.

All hooks follow pattern:
- DEFAULT_ORG_ID = 'default'
- Return { data, loading, error, refetch, create*, update*, delete* }
- useCallback for stability
- Graceful error handling
```

### Prompt 6B: TypeScript Types

```
Update `src/types/index.ts` to add types for new modules:

// Audits
interface Audit { id, org_id, name, audit_type, status, start_date, end_date, auditor, lead_auditor_name, scope, frameworks, description, progress, findings_count?, findings?, created_at, updated_at }
interface AuditFinding { id, audit_id, org_id, title, severity, status, control_ref, description, remediation_plan, due_date, assigned_to, created_at, updated_at }
interface AuditReadinessItem { id, audit_id, org_id, title, category, status, assigned_to, due_date, notes, created_at }

// Incidents
interface Incident { id, org_id, title, description, severity, status, incident_type, detected_at, resolved_at, commander, affected_systems, linked_risk_ids, linked_control_ids, linked_policy_ids, root_cause, impact_assessment, lessons_learned, created_at, updated_at }
interface IncidentTimelineEvent { id, incident_id, event_type, description, author, created_at }

// Evidence Mapping
interface EvidenceMapping { evidence_id, title, linked_controls, linked_frameworks }
interface ControlCoverage { control_id, code, name, has_evidence, evidence_source }
interface FrameworkCoverage { framework_id, name, total_requirements, covered, coverage_pct }

Export all types.
```

---

## IMPORTANT PATTERNS

**Consistent across all prompts:**
- `'use client'` on every page
- `const DEFAULT_ORG_ID = 'default';`
- `useCallback + useEffect` fetch pattern
- `RefreshCw` spinner with `animate-spin` for loading
- Empty states: large gray icon + text + action button
- Error handling: try/catch + alert()
- Export: `exportToCSV` from `@/lib/export`
- Cards: `Card, CardContent, CardHeader, CardTitle` from `@/components/ui/card`
- Colors: critical=red-500, high=orange-500, medium=amber-500, low=green-500
- Response format: `{ data: [...] }` from all APIs

**Scrut Gap Priorities:**
1. CRITICAL: Incident Response, Integrations, Evidence Mapping, RBAC
2. HIGH: Dashboard customization, Risk scoring, Vendor assessments, Onboarding
3. MEDIUM: Policy versioning, Training integration, Performance optimization
