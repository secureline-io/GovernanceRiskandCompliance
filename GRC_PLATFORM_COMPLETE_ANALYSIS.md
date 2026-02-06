# GRC Platform - Complete Analysis & Development Roadmap

**Date:** February 6, 2026
**Platform:** Scrut Automation - GRC Platform
**Stack:** Next.js 16 + React 19 + TypeScript 5 + Supabase + Tailwind CSS 4

---

## EXECUTIVE SUMMARY

After a thorough investigation of every file in the codebase (70+ files across frontend, backend, and database layers), the platform has a **well-architected database schema** and a **professional UI shell**, but the two layers are almost entirely disconnected. The backend API routes exist and are mostly correct, but the frontend pages use hardcoded mock data instead of calling those APIs.

**Current State:** ~25% functional (UI prototype with backend scaffolding)
**Target State:** 100% functional production GRC platform

---

## SECTION 1: WHAT IS WORKING

### Backend API Routes (21 endpoints - Mostly Correct)
- `GET/POST /api/organizations` - Working
- `GET/PATCH /api/organizations/[id]` - Working
- `GET/POST /api/frameworks` - Working
- `GET/PATCH/DELETE /api/frameworks/[id]` - Working
- `GET /api/frameworks/[id]/domains` - Working
- `GET /api/frameworks/[id]/requirements` - Working
- `GET/POST /api/controls` - Working
- `GET/PATCH/DELETE /api/controls/[id]` - Working
- `GET/POST /api/evidence` - Working (immutable design)
- `GET /api/evidence/[id]` - Working
- `GET/POST /api/risks` - Working
- `GET/PATCH/DELETE /api/risks/[id]` - Working
- `GET/POST /api/risks/[id]/treatments` - Working
- `GET/POST /api/policies` - Working
- `GET/PATCH/DELETE /api/policies/[id]` - Working
- `POST /api/policies/[id]/publish` - Working
- `GET/POST /api/vendors` - Working
- `GET/PATCH/DELETE /api/vendors/[id]` - Working
- `GET/POST/PATCH /api/vendors/[id]/assessments` - Working
- `GET /api/findings` - Working
- `GET /api/dashboard` - Working

### Database Schema (30 tables - Well Designed)
- 9 sequential migrations covering all GRC domains
- Row Level Security on all tables (27 RLS policies)
- Immutable evidence and audit log tables
- Materialized views for dashboard performance
- 70+ indexes for query performance
- Helper functions for compliance calculations

### Frontend Shell (Professional UI)
- Sidebar navigation with 11 sections
- Responsive layout with collapsible sidebar
- Consistent design system with Tailwind
- Lucide icons throughout
- Card-based UI components

---

## SECTION 2: WHAT IS BROKEN / NON-FUNCTIONAL

### CRITICAL: Frontend-Backend Disconnect

**Every frontend page uses hardcoded mock data instead of real API calls.**

| Page | Lines | Status | Uses API? | Mock Data? |
|------|-------|--------|-----------|------------|
| Dashboard (page.tsx) | ~500 | Partial | Only frameworks | Yes - all stats |
| Compliance | ~400 | Partial | GET frameworks | Yes - controls/evidence |
| Controls | ~25 | Stub | No | "Coming Soon" |
| Evidence | ~300 | Mock only | No | 6 fake items |
| Policies | ~350 | Mock only | No | 5 fake policies |
| Risks | ~350 | Mock only | No | 4 fake risks |
| Vendors | ~350 | Mock only | No | 5 fake vendors |
| Audits | ~400 | Mock only | No | 5 fake audits |
| CSPM | ~386 | Mock only | No | 4 fake accounts |
| Settings | ~290 | Mock only | No | Hardcoded user |
| Admin | ~254 | Mock only | No | Fake SSO/logs |
| Assets | ~25 | Stub | No | "Coming Soon" |
| Access | ~25 | Stub | No | "Coming Soon" |
| Employees | ~25 | Stub | No | "Coming Soon" |
| Integrations | ~25 | Stub | No | "Coming Soon" |
| Reports | ~25 | Stub | No | "Coming Soon" |
| Tests | ~87 | Stub | No | Stats only |
| Training | ~25 | Stub | No | "Coming Soon" |
| Trust Vault | ~20 | Stub | No | Stats only |
| Vault | ~81 | Stub | No | Stats only |
| Updates | ~25 | Stub | No | "Coming Soon" |
| Corrective Action | ~25 | Stub | No | "Coming Soon" |
| Audit Center | ~20 | Stub | No | Stats only |

### Non-Functional Buttons (50+ broken interactions)

**Dashboard:**
- Quick Action buttons (6) - no handlers
- Recent Activity links - no navigation
- Task checkboxes - no state changes

**Compliance:**
- "Controls Mapped" and "Evidence Items" show "--"
- "View" and "Adopt Framework" buttons - no handlers
- "Map Control", "Upload Evidence", "Mark Compliant" in requirements - no handlers

**Evidence:**
- Upload modal creates client-side entry only - no file storage
- Export buttons export mock data only
- Evidence cards have no detail view

**Policies:**
- "View", "Edit", "Publish" buttons - no handlers
- Acknowledgement tracking is fake
- No policy creation form

**Risks:**
- "Add Risk" creates client-side entry only - no persistence
- Risk heat map uses mock data
- No risk detail view

**Vendors:**
- "View Details" and "Start Assessment" - no handlers
- "Add Vendor" creates client-side only
- No assessment workflow

**Audits:**
- "Generate Report" - no handler
- "View Details" - no handler
- "Create Audit" - no handler
- No audit workflow

**CSPM:**
- "Scan Now" - no handler
- "Connect Account" - no handler
- "Remediate" buttons - no handlers

**Settings:**
- "Save Changes" buttons (3) - no handlers
- "Change Avatar" - no handler
- "Invite Member" - no handler
- Integration Configure/Connect buttons - no handlers

**Header:**
- Search bar (Cmd+K) - no search logic
- Notification bell - hardcoded "3"
- User dropdown - no dropdown menu

### Dashboard Sub-Components (ALL mock data)

| Component | Lines | Functional Buttons | API Calls |
|-----------|-------|-------------------|-----------|
| Overview.tsx | 312 | 0 | None |
| ComplianceView.tsx | 305 | 0 | None |
| CSPMView.tsx | 335 | 0 | None |
| EvidenceView.tsx | 315 | 0 | None |
| PoliciesView.tsx | 419 | 0 | None |
| RiskView.tsx | 385 | 0 | None |
| VendorsView.tsx | 350 | 0 | None |

### Backend Issues

1. **Inconsistent parameter naming:** `orgId` (camelCase) in controls, risks, findings vs `org_id` (snake_case) in vendors, policies, evidence
2. **Missing auth checks** on 9 GET endpoints (any user can read any org's data)
3. **Hard deletes** on controls and frameworks (should be soft deletes for audit trail)
4. **No POST endpoint** for controls (can't create new controls via API)
5. **No POST endpoint** for findings (can't create findings)
6. **Missing `framework_domains` table** in migrations (referenced in seed data but not created)
7. **No middleware** for authentication/authorization
8. **No input validation** (no Zod or similar)
9. **Inconsistent error response format** across endpoints

### Database Issues

1. **Two conflicting schemas:** `database/schema.sql` (legacy 46 tables) vs `supabase/deploy_schema.sql` (active 30 tables)
2. **Missing tables referenced in code:** `framework_domains` (used in API but not in migrations)
3. **No `policy_versions` table** for version tracking
4. **No generic `tasks` table** (only `evidence_tasks` exists)
5. **No `comments` or `notifications` tables**
6. **No incident management tables**
7. **Service role key not configured** in .env.local (needed for admin operations)

---

## SECTION 3: DEVELOPMENT ROADMAP

### Phase 1: Foundation Fixes (Priority: CRITICAL)

**1.1 Fix Database Schema Gaps**
- Add `framework_domains` table to migration 002
- Create migration 010 for missing tables (tasks, comments, notifications)
- Remove or archive legacy `database/schema.sql`
- Configure SUPABASE_SERVICE_ROLE_KEY in .env.local

**1.2 Standardize Backend API**
- Standardize all query params to `org_id` (snake_case)
- Add auth checks to all GET endpoints
- Add POST endpoint for controls (/api/controls POST)
- Add POST endpoint for findings (/api/findings POST)
- Convert hard deletes to soft deletes (controls, frameworks)
- Standardize error response format to `ApiResponse<T>`

**1.3 Create Shared Data Hooks**
- Create `src/lib/hooks/useOrganization.ts`
- Create `src/lib/hooks/useFrameworks.ts`
- Create `src/lib/hooks/useControls.ts`
- Create `src/lib/hooks/useEvidence.ts`
- Create `src/lib/hooks/useRisks.ts`
- Create `src/lib/hooks/usePolicies.ts`
- Create `src/lib/hooks/useVendors.ts`
- Create `src/lib/hooks/useDashboard.ts`
- Create `src/lib/hooks/useFindings.ts`
- Create `src/lib/hooks/useAudit.ts`

### Phase 2: Core Module Integration (Priority: HIGH)

**2.1 Dashboard - Connect to Real Data**
- Replace hardcoded stats with `/api/dashboard` call
- Replace hardcoded frameworks with `/api/frameworks` data
- Wire up Quick Action buttons to navigate to respective pages
- Show real recent activity from audit logs
- Show real upcoming tasks

**2.2 Controls Page - Full Implementation**
- Replace "Coming Soon" with full controls management UI
- List controls from GET /api/controls
- Add "Create Control" modal with POST /api/controls
- Add control detail view with GET /api/controls/[id]
- Add edit functionality with PATCH /api/controls/[id]
- Add control-to-framework mapping UI
- Add control testing interface

**2.3 Evidence Page - Backend Integration**
- Replace mock data with GET /api/evidence calls
- Wire upload modal to POST /api/evidence (with actual file upload to Supabase Storage)
- Add evidence detail view with GET /api/evidence/[id]
- Wire export buttons to export real data
- Add evidence-to-control linking UI

**2.4 Policies Page - Backend Integration**
- Replace mock data with GET /api/policies calls
- Add "Create Policy" modal with POST /api/policies
- Wire "Edit" buttons to PATCH /api/policies/[id]
- Wire "Publish" button to POST /api/policies/[id]/publish
- Add acknowledgement tracking UI
- Add policy version history view

**2.5 Risk Register - Backend Integration**
- Replace mock data with GET /api/risks calls
- Wire CreateRiskModal to POST /api/risks (currently client-only)
- Add risk detail view with GET /api/risks/[id]
- Wire edit functionality to PATCH /api/risks/[id]
- Add treatment plan UI with GET/POST /api/risks/[id]/treatments
- Connect risk heat map to real data

**2.6 Vendor Management - Backend Integration**
- Replace mock data with GET /api/vendors calls
- Wire CreateVendorModal to POST /api/vendors
- Add vendor detail view with GET /api/vendors/[id]
- Wire edit functionality to PATCH /api/vendors/[id]
- Add assessment workflow with /api/vendors/[id]/assessments
- Add vendor risk scoring

**2.7 Compliance/Frameworks - Complete Integration**
- Framework browsing already partially works
- Add "Adopt Framework" functionality (org_frameworks)
- Wire "Map Control" to control-requirement-mapping API
- Wire "Upload Evidence" to evidence upload
- Add compliance percentage calculation display
- Add gap analysis view

### Phase 3: Secondary Modules (Priority: MEDIUM)

**3.1 Audits Page - Full Implementation**
- Create audit CRUD API endpoints (/api/audits)
- Create audit findings management
- Build audit execution workflow
- Add audit report generation

**3.2 CSPM Page - Backend Integration**
- Create cloud account connection API (/api/cloud-accounts)
- Create CSPM findings API (/api/cspm/findings)
- Wire "Connect Account" to cloud provider OAuth
- Wire "Scan Now" to trigger CSPM scan
- Add remediation workflow

**3.3 Settings Page - Backend Integration**
- Wire profile form to user update API
- Wire organization form to PATCH /api/organizations/[id]
- Add team member management (invite, role change)
- Wire integration toggles to actual connections

**3.4 Reports Page - Implementation**
- Build compliance report generator
- Add risk assessment reports
- Add vendor assessment reports
- Add evidence collection reports
- Support PDF/CSV export

### Phase 4: Advanced Features (Priority: LOW)

**4.1 Implement Remaining Stub Pages**
- Asset Management
- Access Control
- Employee Management
- Training Campaigns
- Integrations Hub
- Trust Vault
- Corrective Actions
- Audit Center
- Product Updates

**4.2 Authentication & Authorization**
- Add Supabase Auth login/signup flow
- Add role-based access control UI
- Add organization switching
- Remove hardcoded user "Subham Gupta"

**4.3 Real-Time Features**
- Add WebSocket/Supabase Realtime for live updates
- Add notification system
- Add collaborative editing indicators

**4.4 Advanced Dashboard**
- Add interactive charts with drill-down
- Add customizable widgets
- Add date range filters
- Add export dashboard as PDF

---

## SECTION 4: FILE-BY-FILE FIX REFERENCE

### Files That Need Complete Rewrite
- `src/app/controls/page.tsx` (currently just "Coming Soon")
- `src/app/assets/page.tsx` (stub)
- `src/app/access/page.tsx` (stub)
- `src/app/employees/page.tsx` (stub)
- `src/app/integrations/page.tsx` (stub)
- `src/app/reports/page.tsx` (stub)
- `src/app/training/page.tsx` (stub)
- `src/app/corrective-action/page.tsx` (stub)
- `src/app/updates/page.tsx` (stub)

### Files That Need Backend Integration (Replace Mock Data)
- `src/components/Dashboard.tsx` - Replace hardcoded stats
- `src/app/evidence/page.tsx` - Replace mock evidence array
- `src/app/policies/page.tsx` - Replace mock policies array
- `src/app/risks/page.tsx` - Replace mock risks array
- `src/app/vendors/page.tsx` - Replace mock vendors array
- `src/app/audits/page.tsx` - Replace mock audits array
- `src/app/cspm/page.tsx` - Replace mock cloud accounts/findings
- `src/app/settings/page.tsx` - Replace hardcoded settings
- `src/app/admin/page.tsx` - Replace mock SSO/audit logs
- `src/components/dashboard/Overview.tsx` - Replace all mock data
- `src/components/dashboard/ComplianceView.tsx` - Replace all mock data
- `src/components/dashboard/CSPMView.tsx` - Replace all mock data
- `src/components/dashboard/EvidenceView.tsx` - Replace all mock data
- `src/components/dashboard/PoliciesView.tsx` - Replace all mock data
- `src/components/dashboard/RiskView.tsx` - Replace all mock data
- `src/components/dashboard/VendorsView.tsx` - Replace all mock data

### Files That Need Bug Fixes
- `src/app/api/controls/route.ts` - Change `orgId` to `org_id`, add auth, add POST
- `src/app/api/risks/route.ts` - Change `orgId` to `org_id`, add auth
- `src/app/api/findings/route.ts` - Change `orgId` to `org_id`, add auth, add POST
- `src/app/api/controls/[id]/route.ts` - Add auth check
- `src/app/api/risks/[id]/route.ts` - Add auth check
- `src/app/api/evidence/[id]/route.ts` - Add auth check
- `src/app/api/vendors/[id]/route.ts` - Add auth check
- `src/app/api/dashboard/route.ts` - Add auth check
- `src/components/Header.tsx` - Implement search, notifications, user dropdown

### New Files to Create
- `src/lib/hooks/useOrganization.ts`
- `src/lib/hooks/useFrameworks.ts`
- `src/lib/hooks/useControls.ts`
- `src/lib/hooks/useEvidence.ts`
- `src/lib/hooks/useRisks.ts`
- `src/lib/hooks/usePolicies.ts`
- `src/lib/hooks/useVendors.ts`
- `src/lib/hooks/useDashboard.ts`
- `src/lib/hooks/useFindings.ts`
- `src/app/api/audits/route.ts`
- `src/app/api/audits/[id]/route.ts`
- `src/app/api/cloud-accounts/route.ts`
- `src/components/modals/CreateControlModal.tsx`
- `src/components/modals/CreatePolicyModal.tsx`
- `src/components/modals/CreateAuditModal.tsx`
- `src/components/modals/ControlDetailModal.tsx`
- `src/components/modals/RiskDetailModal.tsx`
- `src/components/modals/VendorDetailModal.tsx`
- `src/components/modals/PolicyDetailModal.tsx`
- `supabase/migrations/010_missing_tables.sql`

---

## SECTION 5: RECOMMENDED EXECUTION ORDER

For maximum impact with minimum effort, implement in this order:

1. **Create data hooks** (enables all subsequent work)
2. **Fix API parameter inconsistencies** (quick wins)
3. **Dashboard real data** (most visible improvement)
4. **Controls page** (core GRC functionality)
5. **Risk register integration** (already has modal)
6. **Evidence integration** (already has upload modal)
7. **Vendor integration** (already has creation modal)
8. **Policy integration** (needs creation modal)
9. **Compliance gap analysis** (uses existing framework data)
10. **Audits full implementation** (needs new API endpoints)
11. **CSPM integration** (needs cloud provider setup)
12. **Reports generation** (uses data from all modules)
13. **Settings/Admin** (user management)
14. **Remaining stub pages** (lower priority features)

---

*This document was generated from a complete analysis of all 70+ files in the GRC platform codebase.*
