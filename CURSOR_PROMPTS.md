# GRC Platform - Cursor Development Prompts

> **Run these prompts sequentially in Cursor.** Each prompt builds on previous work.
> **Stack**: Next.js 16 (App Router) + React 19 + TypeScript 5 + Supabase + Tailwind CSS 4 + Lucide React + Recharts
> **Pattern**: All pages use `'use client'`, fetch from `/api/{resource}?org_id=default`, use `DEFAULT_ORG_ID = 'default'` constant.

---

## PHASE 1: Missing API Routes (Backend)

### Prompt 1A: Audits API (NEW - No route exists yet)

```
Create the Audits API routes for the GRC platform. The database already has an `audit_logs` table
but we need a proper audits management system.

First, create a new Supabase migration file at `supabase/migrations/010_audits.sql` that creates:

CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  audit_type TEXT NOT NULL CHECK (audit_type IN ('internal', 'external', 'regulatory', 'certification')),
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'fieldwork', 'reporting', 'completed', 'closed')),
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

CREATE TABLE audit_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'informational')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'remediation', 'verified', 'closed')),
  control_ref TEXT,
  description TEXT,
  remediation_plan TEXT,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_findings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audits_org_access" ON audits FOR ALL USING (true);
CREATE POLICY "audit_findings_org_access" ON audit_findings FOR ALL USING (true);

Then create these API route files:

1. `src/app/api/audits/route.ts` - GET (list audits with org_id filter, include finding counts via subquery) and POST (create audit with validation)
2. `src/app/api/audits/[id]/route.ts` - GET (single audit with its findings), PATCH (update audit fields), DELETE
3. `src/app/api/audits/[id]/findings/route.ts` - GET (list findings for audit) and POST (create finding linked to audit)

Follow the exact same pattern as `src/app/api/risks/route.ts` for the implementation style:
- Use `const searchParams = request.nextUrl.searchParams` for query params
- Use `searchParams.get('org_id') || searchParams.get('orgId')` for backward compatibility
- Return `{ data: results }` for GET, `{ data: newRecord }` for POST
- Use `supabaseAdmin` from `@/lib/supabase/server`
- Add try/catch with `{ error: message }` responses and appropriate HTTP status codes
- Log creation events with: `await supabaseAdmin.rpc('log_audit_event', { p_org_id: org_id, p_action: 'audit.created', p_resource_type: 'audit', p_resource_id: newAudit.id, p_details: { name: body.name } })`
```

### Prompt 1B: CSPM / Cloud Accounts API (NEW)

```
Create CSPM (Cloud Security Posture Management) API routes. The database already has tables:
`cloud_accounts`, `assets`, `cspm_policies`, and `findings` (from migration 004_cspm.sql).

Create these API route files following the same pattern as `src/app/api/vendors/route.ts`:

1. `src/app/api/cloud-accounts/route.ts`
   - GET: List cloud accounts filtered by org_id, include finding counts
   - POST: Create cloud account (fields: org_id, provider ['aws','azure','gcp'], account_id, account_name, status ['connected','disconnected','error'], regions)

2. `src/app/api/cloud-accounts/[id]/route.ts`
   - GET: Single cloud account with its findings
   - PATCH: Update status, regions, etc.
   - DELETE: Remove cloud account

3. `src/app/api/cspm/findings/route.ts`
   - GET: List CSPM findings filtered by org_id, with optional severity and cloud_account_id filters
   - POST: Create finding (fields: org_id, cloud_account_id, title, description, severity, resource_type, resource_id, region, remediation)

Use `supabaseAdmin` from `@/lib/supabase/server`. Return `{ data: results }`.
Add audit logging for create/update/delete operations.
```

### Prompt 1C: Assets API (NEW)

```
Create Assets API routes. The database already has an `assets` table (from migration 004_cspm.sql).

Create these API route files following the pattern in `src/app/api/controls/route.ts`:

1. `src/app/api/assets/route.ts`
   - GET: List assets filtered by org_id, support optional `type` and `criticality` query params
   - POST: Create asset (fields: org_id, name, type ['server','database','application','network','endpoint','cloud_resource'], owner, criticality ['critical','high','medium','low'], description, cloud_account_id optional)

2. `src/app/api/assets/[id]/route.ts`
   - GET, PATCH, DELETE for individual assets

Return `{ data: results }`. Add audit logging for mutations.
```

### Prompt 1D: Integrations API (NEW)

```
Create Integrations API routes. The database has an `integrations` table (from migration 007_vendors.sql).

Create `src/app/api/integrations/route.ts`:
- GET: List integrations filtered by org_id
- POST: Create integration (fields: org_id, name, type ['slack','jira','github','pagerduty','aws','azure','gcp','okta','google_workspace'], config JSON, status ['active','inactive','error'])

Create `src/app/api/integrations/[id]/route.ts`:
- GET, PATCH, DELETE

Return `{ data: results }`. Follow the exact same error handling and response format as `src/app/api/vendors/route.ts`.
```

---

## PHASE 2: Rewire Pages with Mock Data to Real APIs

### Prompt 2A: Audits Page - Connect to Real API

```
Rewrite `src/app/audits/page.tsx` to fetch real data from the API instead of using hardcoded mock data.

The current page (647 lines) has excellent UI with audit cards, finding details, status filters, and
a calendar view - but it uses 5 hardcoded audit objects defined inline starting at line 54.

Requirements:
1. Remove ALL mock data (the `const audits: Audit[]` array at line 54-158)
2. Add state management with useState for audits array, loading state, and createModalOpen
3. Fetch audits from `GET /api/audits?org_id=default` on mount using useCallback + useEffect pattern:
   ```typescript
   const DEFAULT_ORG_ID = 'default';
   const fetchAudits = useCallback(async () => {
     setLoading(true);
     try {
       const res = await fetch(`/api/audits?org_id=${DEFAULT_ORG_ID}`);
       const json = await res.json();
       const data = json.data || json || [];
       setAudits(Array.isArray(data) ? data : []);
     } catch { setAudits([]); }
     finally { setLoading(false); }
   }, []);
   useEffect(() => { fetchAudits(); }, [fetchAudits]);
   ```
4. Add a loading spinner state: `if (loading) return <div className="p-6 flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 animate-spin text-zinc-400" /></div>;`
5. Create an "Add Audit" button that opens a create modal
6. Create `src/components/modals/CreateAuditModal.tsx` with fields: name, audit_type (dropdown: internal/external/regulatory/certification), auditor, lead_auditor_name, start_date, end_date, description, scope (multi-select or comma-separated), frameworks (multi-select or comma-separated)
7. Wire the create form to POST `/api/audits` with org_id: 'default'
8. Add Export button using `exportToCSV` from `@/lib/export`
9. Keep ALL existing UI components (status badges, finding severity colors, progress bars, calendar) but drive them from API data
10. Add empty state: "No audits yet. Click Add Audit to start."
11. Compute stats from real data: totalAudits, activeAudits (status !== 'completed' && !== 'closed'), totalFindings (sum findings_count), completedAudits

Keep the same visual design, color scheme, and layout as the current page.
Import RefreshCw from lucide-react for the loading spinner.
```

### Prompt 2B: CSPM Page - Connect to Real API

```
Rewrite `src/app/cspm/page.tsx` to fetch real data from the API instead of hardcoded mock data.

The current page (387 lines) has mock cloud accounts and findings defined inline.

Requirements:
1. Remove ALL mock data (cloudAccounts array and findings array)
2. Fetch from two endpoints on mount:
   - `GET /api/cloud-accounts?org_id=default` for cloud accounts
   - `GET /api/cspm/findings?org_id=default` for findings
3. Use the same useCallback/useEffect/loading pattern as other pages
4. Add "Connect Account" button that opens a modal to create cloud accounts via POST /api/cloud-accounts
5. Create `src/components/modals/ConnectCloudAccountModal.tsx` with fields:
   - provider (dropdown: AWS, Azure, GCP)
   - account_id (text input)
   - account_name (text input)
   - regions (multi-select or comma-separated)
6. Keep the existing UI: cloud account cards with provider icons, finding severity breakdown, filtering
7. Add Export functionality
8. Compute stats from real data: total accounts, connected accounts, total findings by severity
9. Add empty state for when no cloud accounts are connected
10. Add loading spinner

Follow the same patterns as `src/app/vendors/page.tsx` for the data fetching and state management.
```

### Prompt 2C: Settings Page - Replace Hardcoded Data

```
Update `src/app/settings/page.tsx` to fetch real data where possible and make forms functional.

Current state: 289 lines with hardcoded user profile, organization, team members, and integrations.

Requirements:
1. Fetch organization data from `GET /api/organizations?org_id=default` on mount
2. Make the Profile form save changes via PATCH `/api/organizations/default` (for now, until auth exists)
3. Make Organization settings form functional with save via PATCH
4. Fetch integrations from `GET /api/integrations?org_id=default`
5. For team members section: keep as display-only for now but add a note "Team management requires authentication"
6. Implement the missing tab sections:
   - Notifications: Show notification preferences form (email alerts for: audit deadlines, control failures, policy updates, risk changes) - save to localStorage for now
   - Security: Show password change form (disabled with note "requires auth"), MFA toggle, session timeout setting
   - API: Show API key management placeholder with "Generate API Key" button (disabled with note "requires auth")
7. Add loading state and error handling
8. Use the same visual style as the existing settings page
```

---

## PHASE 3: Build Stub Pages

### Prompt 3A: Assets Page

```
Build a complete Assets page at `src/app/assets/page.tsx`. Replace the current "Coming Soon" stub.

This is an IT asset inventory for tracking servers, databases, applications, and other infrastructure.

Requirements:
1. Fetch from `GET /api/assets?org_id=default`
2. Summary cards: Total Assets, Critical Assets, Unassigned (no owner), Cloud Resources
3. Filter buttons by asset type: All, Server, Database, Application, Network, Endpoint, Cloud Resource
4. Search by name/description
5. Asset cards or table rows showing: name, type badge, criticality badge (color-coded like risk levels), owner, description, linked cloud account if any
6. "Add Asset" button opening `CreateAssetModal` with fields: name, type (dropdown), criticality (dropdown: critical/high/medium/low), owner (text), description (textarea), cloud_account_id (optional dropdown)
7. Wire create to POST `/api/assets`
8. Export to CSV button
9. Loading spinner and empty state
10. Use the same visual patterns as `src/app/vendors/page.tsx` - card grid layout with filter chips

Criticality color scheme: critical=red, high=orange, medium=amber, low=green (same as risk levels).
Import icons from lucide-react: Box, Plus, Server, Database, Globe, Monitor, Cloud, Download, RefreshCw, Search
```

### Prompt 3B: Corrective Action Plans Page

```
Build a complete Corrective Action Plans page at `src/app/corrective-action/page.tsx`. Replace the "Coming Soon" stub.

This tracks remediation actions for audit findings and control gaps. It links to findings and controls.

Since there's no dedicated corrective_actions table, we'll use the existing `findings` table
(which has status, severity, remediation fields) as the data source.

Requirements:
1. Fetch from `GET /api/findings?org_id=default`
2. Filter to show only findings that need corrective action (status = 'open' or 'in_progress')
3. Summary cards: Total Open Actions, Critical/High Priority, Overdue (past due_date), Completed This Month
4. Filter by severity: All, Critical, High, Medium, Low
5. Filter by status: All, Open, In Progress, Resolved, Verified
6. Each action item shows: finding title, severity badge, status badge, control reference, due date, assigned to
7. Status can be updated inline via dropdown (calls PATCH `/api/findings/${id}`)
8. Export to CSV
9. Loading spinner and empty state: "No corrective actions needed - all findings are resolved!"

Use the same card/list pattern as `src/app/risks/page.tsx`.
Import: CheckSquare, Plus, AlertTriangle, Clock, CheckCircle2, Filter, Download, RefreshCw from lucide-react
```

### Prompt 3C: Reports Page

```
Build a Reports & Analytics page at `src/app/reports/page.tsx`. Replace the "Coming Soon" stub.

This page generates compliance reports by aggregating data from multiple API endpoints.

Requirements:
1. Fetch data from multiple endpoints on mount using Promise.allSettled:
   - GET /api/dashboard?org_id=default
   - GET /api/frameworks
   - GET /api/risks?org_id=default
   - GET /api/controls?org_id=default
   - GET /api/evidence?org_id=default
   - GET /api/vendors?org_id=default

2. Report Types section - show cards for each available report:
   - "Executive Summary" - overall compliance posture (compliance %, risk score, open findings)
   - "Framework Compliance" - per-framework breakdown with progress bars
   - "Risk Assessment" - risk register summary with severity distribution
   - "Vendor Risk" - vendor risk summary
   - "Evidence Collection" - evidence completeness report
   - "Control Effectiveness" - control status breakdown

3. Each report card has a "Generate" button that:
   - Compiles data from the fetched endpoints
   - Uses `exportToCSV` from `@/lib/export` to download as CSV
   - OR shows an inline expandable report view below the card

4. Add a date range filter at the top (last 30 days, last 90 days, last year, all time)

5. Quick Stats row: Total Controls, Compliance Rate, Open Risks, Evidence Items

6. Use Recharts for a compliance trend chart (bar chart showing framework compliance %)

7. Loading spinner, empty states

Import: BarChart3, FileText, Download, RefreshCw, TrendingUp, Shield, AlertTriangle from lucide-react
Use Card, CardContent, CardHeader, CardTitle from @/components/ui/card
```

### Prompt 3D: Training Page

```
Build a Security Training Management page at `src/app/training/page.tsx`. Replace the stub.

Since there's no training table in the database, this will be a client-side management page
that stores training records in localStorage until a backend is built.

Requirements:
1. Training Programs section showing cards for:
   - Security Awareness Training (annual requirement)
   - Data Privacy Training (GDPR/CCPA)
   - Incident Response Training
   - Phishing Simulation Results
   - Custom training programs

2. Each program card shows: name, description, completion rate (progress bar), due date, status badge
3. "Add Training Program" button with inline form: name, description, frequency (annual/quarterly/monthly), due_date
4. Store programs in localStorage key 'grc_training_programs'
5. Summary cards: Total Programs, Completion Rate (avg %), Overdue, Upcoming (next 30 days)
6. Training completion tracking per program
7. Export training status to CSV

8. Add a banner at the top: "Training data is stored locally. Connect an LMS integration for automatic tracking."

Import: GraduationCap, Plus, Clock, CheckCircle2, AlertTriangle, Users, Download, RefreshCw from lucide-react
Use the same card grid layout as the vendors page.
```

### Prompt 3E: Access Control Page

```
Build an Access Control page at `src/app/access/page.tsx`. Replace the stub.

This shows access control policies and reviews. Since there's no dedicated access table,
this will pull from the controls API filtered by access-related categories.

Requirements:
1. Fetch controls from `GET /api/controls?org_id=default`
2. Filter to show only access-related controls (category contains 'access' or code starts with 'AC-')
3. Summary cards: Total Access Controls, Compliant, Non-Compliant, Pending Review
4. Access Review section showing controls that need periodic review
5. Each control shows: code, name, status badge, last review date, next review date
6. Quick action to update control status via PATCH
7. "Access Review Checklist" section with common access control checks:
   - Privileged access review
   - User access certification
   - Service account audit
   - Third-party access review
   Each with a checkbox (stored in localStorage)
8. Export to CSV
9. Loading spinner and empty state

Import: Key, Shield, Users, Lock, CheckCircle2, AlertTriangle, Download, RefreshCw from lucide-react
```

### Prompt 3F: Employees Page

```
Build an Employee Directory page at `src/app/employees/page.tsx`. Replace the stub.

Since there's no employees table, this will use the `organization_members` table.

Requirements:
1. Fetch from organization data - for now, show a management interface with localStorage
2. "Add Employee" form with fields: name, email, role (dropdown: admin/auditor/analyst/viewer), department
3. Store in localStorage key 'grc_employees'
4. Summary cards: Total Employees, Admins, Auditors, Analysts
5. Employee table/cards showing: name, email, role badge, department, training status
6. Search by name/email
7. Role-based color coding: admin=purple, auditor=blue, analyst=green, viewer=gray
8. Export to CSV
9. Banner: "Employee directory is stored locally. Enable SSO integration for automatic sync."

Import: Users, Plus, Shield, UserCheck, Search, Download, RefreshCw from lucide-react
```

### Prompt 3G: Integrations Hub Page

```
Build an Integrations Hub page at `src/app/integrations/page.tsx`. Replace the stub.

Requirements:
1. Fetch from `GET /api/integrations?org_id=default`
2. Available Integrations grid showing cards for:
   - Slack (notifications), Jira (ticket sync), GitHub (code reviews),
   - AWS (cloud posture), Azure (cloud posture), GCP (cloud posture),
   - Okta (SSO/identity), PagerDuty (incidents), Google Workspace (directory)
3. Each card shows: integration name, icon, description, status badge (active/inactive/not_configured), last sync time
4. "Configure" button per integration that opens a modal with:
   - API key/webhook URL input
   - Enable/disable toggle
   - Test connection button (simulated)
5. Connected integrations section at top, Available integrations below
6. Summary cards: Total Configured, Active, Errors, Available
7. Wire configure to POST/PATCH `/api/integrations`

Import: Link2, Plus, Slack, Github, Cloud, Key, CheckCircle2, AlertTriangle, RefreshCw from lucide-react
Note: Use generic Cloud icon for AWS/Azure/GCP, use Link2 for generic integrations
```

### Prompt 3H: Tests / Control Testing Page

```
Build a Control Testing page at `src/app/tests/page.tsx`. Replace the current partial stub.

The current page has 4 stat cards with mock data but no actual content below them.

Requirements:
1. Fetch controls from `GET /api/controls?org_id=default`
2. Create a "Test Execution" interface where users can:
   - Select a control to test
   - Record test result: Pass/Fail/Partial/N/A
   - Add test notes and evidence references
   - Record test date
3. Store test results in localStorage key 'grc_test_results' (until a test_results table is created)
4. Summary cards (computed from real data): Tests Scheduled (controls not tested in 90 days), In Progress, Completed (this quarter), Failed
5. Test history table showing: control code, control name, last test date, result badge, tester, notes
6. Filter by result: All, Passed, Failed, Partial, Not Tested
7. "Run Test" button that opens a test execution modal
8. Export test results to CSV
9. Banner: "Test results stored locally. Run `supabase migration` to enable persistent storage."

Import: ClipboardCheck, Play, CheckCircle2, XCircle, AlertTriangle, Clock, Download, RefreshCw from lucide-react
```

### Prompt 3I: Trust Vault (Public Trust Center) Page

```
Update `src/app/trust-vault/page.tsx` - replace the partial stub with a full trust center page.

The current page has 4 mock stat cards. Build it out as a public-facing trust center preview.

Requirements:
1. Fetch from multiple APIs:
   - GET /api/frameworks (for certifications)
   - GET /api/policies?org_id=default (for published policies)
   - GET /api/controls?org_id=default (for compliance posture)
2. Sections:
   - "Certifications & Compliance" - show framework cards with compliance status
   - "Published Policies" - list policies with status 'published', show title and last updated
   - "Security Posture" - show overall compliance percentage from controls
   - "Sub-processors" - list vendors from GET /api/vendors?org_id=default
3. Each section has a "Public" / "Private" toggle (stored in localStorage) to control what would be visible
4. Preview mode toggle to see what the public trust center would look like
5. Summary cards: Certifications (framework count), Published Policies, Page Views (mock), Uptime (99.9% mock)
6. Export trust center content as JSON
7. Banner: "This is a preview of your public trust center. Enable the Trust Vault integration to publish."

Import: Shield, Globe, FileText, Lock, Eye, EyeOff, CheckCircle2, Download, RefreshCw from lucide-react
```

### Prompt 3J: Updates Page

```
Build a simple Updates / Changelog page at `src/app/updates/page.tsx`. Replace the stub.

This shows platform updates, release notes, and system announcements.

Requirements:
1. No API calls needed - this is a static content page with hardcoded update entries
2. Updates list with entries like:
   - "v2.0 - Full API Integration" (Feb 2026) - All modules now connected to live database
   - "v1.5 - Risk Management" (Jan 2026) - Risk register with heat map and treatment tracking
   - "v1.0 - Initial Release" (Dec 2025) - Core GRC platform with compliance frameworks
3. Each update card shows: version, title, date, description, list of changes
4. Status badges: "Latest", "Current", "Previous"
5. Simple clean layout with timeline-style design
6. No CRUD needed - just informational display

Import: Bell, Sparkles, CheckCircle2, Clock from lucide-react
Keep it simple and clean.
```

### Prompt 3K: Vault (Secure Document Storage) Page

```
Update `src/app/vault/page.tsx` - replace the partial stub with a document vault page.

Requirements:
1. Fetch from `GET /api/evidence?org_id=default` (evidence doubles as secure document storage)
2. Organize evidence items into categories: Credentials, Certificates, Policies, Audit Reports, Other
3. Summary cards: Total Documents, Credentials (source='manual' + file_type in credentials list), Certificates, Recent (last 7 days)
4. Document list with: title, category badge, file type badge, upload date, SHA-256 hash preview
5. Search and filter by category
6. Upload button linking to evidence upload (reuse EvidenceUploadModal)
7. Each document shows integrity status (hash present = verified checkmark)
8. Export document inventory to CSV

Import: Lock, FileText, Key, Shield, Upload, Download, CheckCircle2, Search, RefreshCw from lucide-react
```

---

## PHASE 4: Dashboard Sub-Components

### Prompt 4A: Dashboard Overview Component

```
Rewrite `src/components/dashboard/Overview.tsx` to use real API data instead of hardcoded mock data.

Current state: Has hardcoded stats (87% compliance, 23 findings, etc.) and mock compliance bars.

The parent `src/components/Dashboard.tsx` already fetches dashboard data and passes it as props.
Check how Dashboard.tsx calls Overview and pass the appropriate data.

Requirements:
1. Accept props from Dashboard.tsx (dashboard stats, frameworks data)
2. Show real stats: compliance percentage (from controls compliant/total), open findings count, open risks count, vendor reviews pending
3. Framework compliance bars: fetch from frameworks data, show name + compliance % as progress bar
4. Recent activity: use audit_logs from dashboard endpoint if available
5. Quick action links to: Controls, Risks, Evidence, Vendors, Policies, Audits
6. If data is unavailable, show "-" or "N/A" instead of 0
7. Use Recharts for a small compliance trend sparkline if historical data exists

Remove ALL hardcoded numbers. Everything must come from props or API data.
```

### Prompt 4B: Dashboard Compliance View

```
Rewrite `src/components/dashboard/ComplianceView.tsx` to use real data.

Current: Hardcoded SOC2 92%, ISO27001 78%, GDPR 85% with mock controls.

Requirements:
1. Accept frameworks data as props from Dashboard.tsx
2. For each framework, show: name, version, total requirements, mapped controls count, compliance %
3. Compliance % = (compliant controls / total mapped controls) * 100
4. Use Recharts BarChart or progress bars for visual representation
5. Click on a framework to navigate to /compliance page
6. Show "No frameworks configured" empty state if no data
7. Color code: >80% green, 60-80% amber, <60% red
```

### Prompt 4C: Dashboard Risk View

```
Rewrite `src/components/dashboard/RiskView.tsx` to use real data.

Requirements:
1. Fetch risks from `/api/risks?org_id=default` or accept as props
2. Show risk distribution: pie/donut chart with critical/high/medium/low counts
3. Top 5 risks by inherent score as a ranked list
4. Risk trend: total inherent vs residual score comparison
5. Open vs mitigated ratio
6. Link to /risks page for full register
```

### Prompt 4D: Dashboard Evidence View

```
Rewrite `src/components/dashboard/EvidenceView.tsx` to use real data.

Requirements:
1. Fetch evidence from `/api/evidence?org_id=default` or accept as props
2. Show: total evidence count, automated vs manual split, recent uploads (last 7 days)
3. Evidence by source breakdown (aws, azure, manual, etc.) as bar chart or badges
4. Latest evidence items list (top 5)
5. Link to /evidence page
```

### Prompt 4E: Dashboard Policies View

```
Rewrite `src/components/dashboard/PoliciesView.tsx` to use real data.

Requirements:
1. Fetch from `/api/policies?org_id=default` or accept as props
2. Show: total policies, published count, draft count, avg acknowledgement rate
3. Policies needing attention: drafts, low acknowledgement rates, overdue reviews
4. Top 5 policies by acknowledgement rate
5. Link to /policies page
```

### Prompt 4F: Dashboard Vendors View

```
Rewrite `src/components/dashboard/VendorsView.tsx` to use real data.

Requirements:
1. Fetch from `/api/vendors?org_id=default` or accept as props
2. Show: total vendors, active count, high-risk count, pending assessments
3. Vendor risk distribution chart
4. Recently assessed vendors list
5. Vendors needing assessment (never assessed or >90 days)
6. Link to /vendors page
```

### Prompt 4G: Dashboard CSPM View

```
Rewrite `src/components/dashboard/CSPMView.tsx` to use real data.

Requirements:
1. Fetch from `/api/cloud-accounts?org_id=default` and `/api/cspm/findings?org_id=default`
2. Show: connected accounts by provider, finding severity breakdown
3. Cloud account status cards (connected/disconnected)
4. Top findings by severity
5. Link to /cspm page
6. Show "No cloud accounts connected" empty state with link to configure
```

---

## PHASE 5: Polish & Cross-Cutting Concerns

### Prompt 5A: Fix Header Search & Notifications

```
Update `src/components/Header.tsx` to make search and notifications functional.

Current state: Search input and notification bell are present but non-functional.

Requirements:
1. Search: Implement a global search that searches across multiple endpoints:
   - Controls (by code/name)
   - Risks (by title)
   - Policies (by title)
   - Vendors (by name)
   Use a debounced search (300ms) and show results in a dropdown below the search bar.
   Each result shows: icon (by type), title, and link to the relevant page.

2. Notifications: Fetch recent audit_log entries from `/api/dashboard?org_id=default`
   Show in a dropdown: action description, resource type, timestamp
   Badge count = entries from last 24 hours

3. User dropdown: Show "Default User" for now, with links to /settings and a disabled "Sign Out"
```

### Prompt 5B: Fix Sidebar User Info

```
Update `src/components/Sidebar.tsx` to remove the hardcoded "Subham Gupta" user name.

Replace with:
1. Show "GRC Admin" as the user name
2. Show "admin@company.com" as the email
3. Add a small badge showing "Local Mode" to indicate no auth is configured
4. Make sure all navigation links point to the correct routes
5. Verify all sidebar items have correct href values matching the actual page routes
```

### Prompt 5C: Admin Page - Wire to Real Data

```
Update `src/app/admin/page.tsx` to fetch real audit logs instead of using hardcoded data.

Current state: 254 lines with hardcoded SSO providers and 5 mock audit log entries.

Requirements:
1. Fetch audit logs from the database - add a new endpoint or use existing dashboard API
2. SSO configuration section can stay as display-only (requires auth to configure)
3. Audit logs table should show real entries with: timestamp, user, action, resource_type, resource_id, details
4. Add pagination for audit logs (show 20 per page)
5. Add filter by action type and date range
6. Export audit logs to CSV
```

---

## PHASE 6: Data Hooks (if not already created)

### Prompt 6A: Verify and Update Hooks

```
Check if `src/lib/hooks/` exists with these hooks. If any are missing, create them:

- useApi.ts - Generic fetch hook with useApi<T>(url), apiPost, apiPatch, apiDelete
- useControls.ts - useControls() returning { controls, loading, error, refetch, createControl, updateControl, deleteControl }
- useRisks.ts - same pattern for risks
- useEvidence.ts - same pattern for evidence
- usePolicies.ts - same pattern including publishPolicy
- useVendors.ts - same pattern for vendors
- useFrameworks.ts - useFrameworks() and useFrameworkRequirements(id)
- useDashboard.ts - useDashboard() for dashboard aggregate data
- useAudits.ts - NEW: useAudits() for audit management with createAudit, updateAudit, createFinding
- useAssets.ts - NEW: useAssets() for asset management
- useIntegrations.ts - NEW: useIntegrations() for integration management
- index.ts - re-export all hooks

All hooks should follow this pattern:
- Use DEFAULT_ORG_ID = 'default'
- Return { data, loading, error, refetch, create*, update*, delete* }
- Handle errors gracefully
- Use useCallback for stability
```

---

## IMPORTANT NOTES FOR ALL PROMPTS

**Consistent Patterns to Follow:**
- Every page starts with `'use client';`
- Use `const DEFAULT_ORG_ID = 'default';` at the top of every page
- Fetch pattern: `useCallback` + `useEffect` with `fetchX` function
- Loading state: `RefreshCw` spinner from lucide-react with `animate-spin`
- Empty state: Large gray icon + descriptive text + action button
- Error handling: try/catch with `alert('Error: ' + message)` for mutations
- Export: Use `exportToCSV` from `@/lib/export`
- Cards: Use `Card, CardContent, CardHeader, CardTitle` from `@/components/ui/card`
- Styling: Use `cn()` from `@/lib/utils` for conditional classes
- Colors: critical=red, high=orange, medium=amber, low=green
- Response format: Always expect `{ data: [...] }` from API responses

**File Structure:**
```
src/app/api/{resource}/route.ts          - GET/POST
src/app/api/{resource}/[id]/route.ts     - GET/PATCH/DELETE
src/app/{page}/page.tsx                  - Page component
src/components/modals/Create{X}Modal.tsx - Create modals
src/lib/hooks/use{X}.ts                 - Data hooks
```
