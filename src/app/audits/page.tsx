'use client';

import { useState } from 'react';
import {
  ClipboardCheck,
  Plus,
  Filter,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  FileText,
  Building2,
  ChevronRight,
  MoreVertical,
  Search,
  Download,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Audit types
type AuditStatus = 'planning' | 'in_progress' | 'fieldwork' | 'reporting' | 'completed' | 'closed';
type AuditType = 'internal' | 'external' | 'regulatory' | 'certification';

interface AuditFinding {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'informational';
  status: 'open' | 'remediation' | 'verified' | 'closed';
  control_ref?: string;
}

interface Audit {
  id: string;
  name: string;
  audit_type: AuditType;
  status: AuditStatus;
  start_date: string;
  end_date: string;
  auditor: string;
  lead_auditor_name: string;
  scope: string[];
  frameworks: string[];
  findings_count: number;
  findings: AuditFinding[];
  progress: number;
  description?: string;
}

// Mock audit data
const audits: Audit[] = [
  {
    id: '1',
    name: 'SOC 2 Type II Annual Audit 2026',
    audit_type: 'certification',
    status: 'in_progress',
    start_date: '2026-01-15',
    end_date: '2026-03-15',
    auditor: 'Deloitte',
    lead_auditor_name: 'Sarah Johnson',
    scope: ['Security', 'Availability', 'Confidentiality'],
    frameworks: ['SOC 2'],
    findings_count: 3,
    findings: [
      { id: 'f1', title: 'Access review documentation incomplete', severity: 'medium', status: 'remediation', control_ref: 'CC6.1' },
      { id: 'f2', title: 'Vendor risk assessment overdue', severity: 'low', status: 'open', control_ref: 'CC9.2' },
      { id: 'f3', title: 'Encryption key rotation policy', severity: 'low', status: 'verified', control_ref: 'CC6.7' }
    ],
    progress: 65,
    description: 'Annual SOC 2 Type II examination covering security, availability, and confidentiality trust service criteria.'
  },
  {
    id: '2',
    name: 'ISO 27001 Surveillance Audit',
    audit_type: 'certification',
    status: 'planning',
    start_date: '2026-04-01',
    end_date: '2026-04-15',
    auditor: 'BSI',
    lead_auditor_name: 'Michael Chen',
    scope: ['ISMS', 'Risk Management', 'Asset Management'],
    frameworks: ['ISO 27001'],
    findings_count: 0,
    findings: [],
    progress: 15,
    description: 'First surveillance audit following initial ISO 27001 certification.'
  },
  {
    id: '3',
    name: 'Q4 2025 Internal Security Audit',
    audit_type: 'internal',
    status: 'completed',
    start_date: '2025-10-01',
    end_date: '2025-11-30',
    auditor: 'Internal Audit Team',
    lead_auditor_name: 'Emily Davis',
    scope: ['Access Control', 'Change Management', 'Incident Response'],
    frameworks: ['SOC 2', 'ISO 27001'],
    findings_count: 7,
    findings: [
      { id: 'f4', title: 'Privileged access review gaps', severity: 'high', status: 'closed', control_ref: 'AC-002' },
      { id: 'f5', title: 'Change management documentation', severity: 'medium', status: 'closed', control_ref: 'CM-001' },
      { id: 'f6', title: 'Incident response training', severity: 'low', status: 'closed', control_ref: 'IR-003' },
      { id: 'f7', title: 'Network segmentation review', severity: 'medium', status: 'closed', control_ref: 'SC-007' },
      { id: 'f8', title: 'Backup verification testing', severity: 'high', status: 'closed', control_ref: 'CP-009' },
      { id: 'f9', title: 'Security awareness metrics', severity: 'low', status: 'closed', control_ref: 'AT-002' },
      { id: 'f10', title: 'Third-party access controls', severity: 'medium', status: 'closed', control_ref: 'AC-017' }
    ],
    progress: 100,
    description: 'Quarterly internal security audit covering key operational controls.'
  },
  {
    id: '4',
    name: 'PCI DSS v4.0 Assessment',
    audit_type: 'regulatory',
    status: 'fieldwork',
    start_date: '2026-02-01',
    end_date: '2026-02-28',
    auditor: 'Coalfire',
    lead_auditor_name: 'Robert Martinez',
    scope: ['Cardholder Data Environment', 'Network Security', 'Access Control'],
    frameworks: ['PCI DSS'],
    findings_count: 5,
    findings: [
      { id: 'f11', title: 'Multi-factor authentication gaps', severity: 'critical', status: 'open', control_ref: 'Req 8.4' },
      { id: 'f12', title: 'Log retention configuration', severity: 'high', status: 'remediation', control_ref: 'Req 10.7' },
      { id: 'f13', title: 'Vulnerability scan schedule', severity: 'medium', status: 'open', control_ref: 'Req 11.3' },
      { id: 'f14', title: 'Password complexity policy', severity: 'low', status: 'verified', control_ref: 'Req 8.3' },
      { id: 'f15', title: 'Anti-malware monitoring', severity: 'medium', status: 'remediation', control_ref: 'Req 5.3' }
    ],
    progress: 45,
    description: 'Annual PCI DSS assessment for payment card processing compliance.'
  },
  {
    id: '5',
    name: 'HIPAA Security Rule Assessment',
    audit_type: 'regulatory',
    status: 'reporting',
    start_date: '2026-01-05',
    end_date: '2026-02-05',
    auditor: 'KPMG',
    lead_auditor_name: 'Jessica Wilson',
    scope: ['Administrative Safeguards', 'Physical Safeguards', 'Technical Safeguards'],
    frameworks: ['HIPAA'],
    findings_count: 4,
    findings: [
      { id: 'f16', title: 'Risk analysis documentation', severity: 'high', status: 'remediation', control_ref: '164.308(a)(1)' },
      { id: 'f17', title: 'Workforce training records', severity: 'medium', status: 'verified', control_ref: '164.308(a)(5)' },
      { id: 'f18', title: 'Access termination procedures', severity: 'medium', status: 'verified', control_ref: '164.308(a)(3)' },
      { id: 'f19', title: 'Encryption implementation', severity: 'low', status: 'verified', control_ref: '164.312(a)(2)' }
    ],
    progress: 85,
    description: 'Comprehensive HIPAA Security Rule assessment for healthcare data protection.'
  }
];

const statusConfig: Record<AuditStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  planning: { label: 'Planning', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950', icon: Calendar },
  in_progress: { label: 'In Progress', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950', icon: Clock },
  fieldwork: { label: 'Fieldwork', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950', icon: FileText },
  reporting: { label: 'Reporting', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950', icon: FileText },
  completed: { label: 'Completed', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950', icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'text-zinc-500', bg: 'bg-zinc-100 dark:bg-zinc-900', icon: CheckCircle2 }
};

const typeConfig: Record<AuditType, { label: string; color: string; bg: string }> = {
  internal: { label: 'Internal', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
  external: { label: 'External', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950' },
  regulatory: { label: 'Regulatory', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950' },
  certification: { label: 'Certification', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950' }
};

const severityConfig: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: 'Critical', color: 'text-red-700', bg: 'bg-red-100 dark:bg-red-950' },
  high: { label: 'High', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-950' },
  medium: { label: 'Medium', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-950' },
  low: { label: 'Low', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-950' },
  informational: { label: 'Info', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-950' }
};

const findingStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: 'Open', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950' },
  remediation: { label: 'Remediation', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950' },
  verified: { label: 'Verified', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
  closed: { label: 'Closed', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950' }
};

export default function AuditsPage() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);

  const filteredAudits = audits.filter(audit => {
    const matchesStatus = statusFilter === null || audit.status === statusFilter;
    const matchesType = typeFilter === null || audit.audit_type === typeFilter;
    const matchesSearch = searchQuery === '' ||
      audit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audit.auditor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audit.frameworks.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesType && matchesSearch;
  });

  // Calculate stats
  const activeAudits = audits.filter(a => ['planning', 'in_progress', 'fieldwork', 'reporting'].includes(a.status)).length;
  const completedAudits = audits.filter(a => ['completed', 'closed'].includes(a.status)).length;
  const totalFindings = audits.reduce((sum, a) => sum + a.findings_count, 0);
  const openFindings = audits.reduce((sum, a) => sum + a.findings.filter(f => f.status === 'open' || f.status === 'remediation').length, 0);

  return (
    <div className="space-y-6 p-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            Audit Management
          </h1>
          <p className="mt-2 text-slate-600">
            Plan, execute, and track internal and external audits
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 transition-colors">
          <Plus className="h-4 w-4" />
          Create Audit
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4 animate-fadeIn">
        <Card className="rounded-2xl border border-slate-200/60 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Audits</p>
                <p className="mt-2 text-3xl font-bold text-sky-600">{activeAudits}</p>
              </div>
              <div className="rounded-xl bg-sky-50 p-3">
                <ClipboardCheck className="h-6 w-6 text-sky-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/60 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Completed</p>
                <p className="mt-2 text-3xl font-bold text-emerald-600">{completedAudits}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/60 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Findings</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{totalFindings}</p>
              </div>
              <div className="rounded-xl bg-slate-100 p-3">
                <FileText className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/60 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Open Findings</p>
                <p className="mt-2 text-3xl font-bold text-amber-600">{openFindings}</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search audits by name, auditor, or framework..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-600 mr-2">Status:</span>
        <button
          onClick={() => setStatusFilter(null)}
          className={cn(
            'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
            statusFilter === null
              ? 'bg-sky-500 text-white'
              : 'text-slate-600 bg-slate-100 hover:bg-slate-50/30'
          )}
        >
          All
        </button>
        {Object.entries(statusConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={cn(
              'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
              statusFilter === key
                ? 'bg-sky-500 text-white'
                : 'text-slate-600 bg-slate-100 hover:bg-slate-50/30'
            )}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Type Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-600 mr-2">Type:</span>
        <button
          onClick={() => setTypeFilter(null)}
          className={cn(
            'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
            typeFilter === null
              ? 'bg-sky-500 text-white'
              : 'text-slate-600 bg-slate-100 hover:bg-slate-50/30'
          )}
        >
          All
        </button>
        {Object.entries(typeConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setTypeFilter(key)}
            className={cn(
              'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
              typeFilter === key
                ? 'bg-sky-500 text-white'
                : 'text-slate-600 bg-slate-100 hover:bg-slate-50/30'
            )}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Audits List */}
      <Card className="rounded-2xl border border-slate-200/60 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Audits ({filteredAudits.length})</CardTitle>
            <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAudits.map((audit) => {
              const status = statusConfig[audit.status];
              const type = typeConfig[audit.audit_type];
              const StatusIcon = status.icon;

              return (
                <div
                  key={audit.id}
                  className="rounded-2xl border border-slate-200/60 bg-white p-5 transition-all hover:shadow-md cursor-pointer"
                  onClick={() => setSelectedAudit(selectedAudit?.id === audit.id ? null : audit)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={cn('rounded-xl p-2.5', status.bg)}>
                        <StatusIcon className={cn('h-5 w-5', status.color)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-slate-900">
                            {audit.name}
                          </h3>
                          <span className={cn(
                            'rounded-full px-2.5 py-1 text-xs font-medium border',
                            status.bg,
                            status.color
                          )}>
                            {status.label}
                          </span>
                          <span className={cn(
                            'rounded-full px-2.5 py-1 text-xs font-medium border',
                            type.bg,
                            type.color
                          )}>
                            {type.label}
                          </span>
                        </div>
                        {audit.description && (
                          <p className="mt-1 text-sm text-slate-600 line-clamp-1">
                            {audit.description}
                          </p>
                        )}
                        <div className="mt-3 flex items-center gap-6 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            <span>{audit.auditor}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{audit.lead_auditor_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(audit.start_date).toLocaleDateString()} - {new Date(audit.end_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {audit.frameworks.map((fw, i) => (
                            <span
                              key={i}
                              className="rounded-lg bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-600"
                            >
                              {fw}
                            </span>
                          ))}
                          {audit.scope.map((s, i) => (
                            <span
                              key={i}
                              className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Progress */}
                      <div className="text-center min-w-[80px]">
                        <div className="relative h-12 w-12 mx-auto">
                          <svg className="h-12 w-12 -rotate-90 transform">
                            <circle
                              className="text-slate-200"
                              strokeWidth="4"
                              stroke="currentColor"
                              fill="transparent"
                              r="20"
                              cx="24"
                              cy="24"
                            />
                            <circle
                              className={cn(
                                audit.progress === 100 ? 'text-emerald-500' :
                                audit.progress >= 50 ? 'text-sky-500' : 'text-amber-500'
                              )}
                              strokeWidth="4"
                              strokeDasharray={`${audit.progress * 1.26} 126`}
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="transparent"
                              r="20"
                              cx="24"
                              cy="24"
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                            {audit.progress}%
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">Progress</p>
                      </div>

                      {/* Findings */}
                      <div className="text-center min-w-[60px]">
                        <p className={cn(
                          'text-2xl font-bold',
                          audit.findings_count > 0 ? 'text-amber-600' : 'text-emerald-600'
                        )}>
                          {audit.findings_count}
                        </p>
                        <p className="text-xs text-slate-500">Findings</p>
                      </div>

                      <ChevronRight className={cn(
                        'h-5 w-5 text-slate-400 transition-transform',
                        selectedAudit?.id === audit.id ? 'rotate-90' : ''
                      )} />
                    </div>
                  </div>

                  {/* Expanded Findings Section */}
                  {selectedAudit?.id === audit.id && audit.findings.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <h4 className="text-sm font-semibold text-slate-900 mb-3">
                        Audit Findings
                      </h4>
                      <div className="space-y-2">
                        {audit.findings.map((finding) => {
                          const severity = severityConfig[finding.severity];
                          const findingStatus = findingStatusConfig[finding.status];

                          return (
                            <div
                              key={finding.id}
                              className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center gap-3">
                                <span className={cn(
                                  'rounded-lg px-2 py-0.5 text-xs font-medium',
                                  severity.bg,
                                  severity.color
                                )}>
                                  {severity.label}
                                </span>
                                <span className="text-sm text-slate-900">
                                  {finding.title}
                                </span>
                                {finding.control_ref && (
                                  <span className="text-xs text-slate-500 font-mono">
                                    [{finding.control_ref}]
                                  </span>
                                )}
                              </div>
                              <span className={cn(
                                'rounded-full px-2.5 py-1 text-xs font-medium border',
                                findingStatus.bg,
                                findingStatus.color
                              )}>
                                {findingStatus.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-3 flex justify-end gap-2">
                        <button className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                          <Eye className="h-4 w-4" />
                          View Details
                        </button>
                        <button className="flex items-center gap-1 rounded-xl bg-sky-500 px-3 py-2 text-sm font-medium text-white hover:bg-sky-600 transition-colors">
                          <FileText className="h-4 w-4" />
                          Generate Report
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredAudits.length === 0 && (
              <div className="text-center py-12">
                <ClipboardCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No audits found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Audit Calendar */}
      <Card className="rounded-2xl border border-slate-200/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Audit Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {audits
              .filter(a => new Date(a.start_date) >= new Date() || a.status === 'in_progress' || a.status === 'fieldwork')
              .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
              .slice(0, 3)
              .map((audit) => {
                const status = statusConfig[audit.status];
                const startDate = new Date(audit.start_date);
                const endDate = new Date(audit.end_date);
                const daysUntilStart = Math.ceil((startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={audit.id}
                    className="rounded-2xl border border-slate-200/60 p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-slate-900">
                          {startDate.getDate()}
                        </p>
                        <p className="text-xs text-slate-500">
                          {startDate.toLocaleString('default', { month: 'short' })}
                        </p>
                      </div>
                      <span className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-medium border',
                        status.bg,
                        status.color
                      )}>
                        {status.label}
                      </span>
                    </div>
                    <h4 className="font-medium text-slate-900 line-clamp-1">
                      {audit.name}
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">
                      {audit.auditor}
                    </p>
                    <div className="mt-2 text-xs text-slate-500">
                      {daysUntilStart > 0 ? (
                        <span className="text-sky-600">Starts in {daysUntilStart} days</span>
                      ) : daysUntilStart === 0 ? (
                        <span className="text-emerald-600">Starts today</span>
                      ) : (
                        <span>In progress - {audit.progress}% complete</span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
