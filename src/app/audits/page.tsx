'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Eye,
  X,
  Loader
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/AuthContext';

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
  org_id: string;
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
  created_at: string;
}

const statusConfig: Record<AuditStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  planning: { label: 'Planning', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950', icon: Calendar },
  in_progress: { label: 'In Progress', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950', icon: Clock },
  fieldwork: { label: 'Fieldwork', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950', icon: FileText },
  reporting: { label: 'Reporting', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950', icon: FileText },
  completed: { label: 'Completed', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950', icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'text-zinc-500', bg: 'bg-zinc-100 dark:bg-zinc-900', icon: CheckCircle2 }
};

interface CreateAuditFormData {
  name: string;
  audit_type: AuditType;
  start_date: string;
  end_date: string;
  auditor: string;
  lead_auditor_name: string;
  description: string;
  scope: string;
  frameworks: string;
}

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
  const { currentOrg } = useAuth();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [findings, setFindings] = useState<Record<string, AuditFinding[]>>({});
  const [loadingFindings, setLoadingFindings] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<CreateAuditFormData>({
    name: '',
    audit_type: 'internal',
    start_date: '',
    end_date: '',
    auditor: '',
    lead_auditor_name: '',
    description: '',
    scope: '',
    frameworks: ''
  });

  const orgId = currentOrg?.org_id || 'default';

  // Fetch audits from API
  const fetchAudits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/audits?org_id=${orgId}`);
      if (!response.ok) throw new Error('Failed to fetch audits');
      const result = await response.json();
      const auditData = result.data || [];

      // Calculate progress for each audit
      const auditsWithProgress = auditData.map((audit: any) => ({
        ...audit,
        progress: calculateProgress(audit.status),
        findings: [] // Initialize empty findings, will load on expand
      }));

      setAudits(auditsWithProgress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audits');
      console.error('Error fetching audits:', err);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  // Fetch findings for an audit
  const fetchFindings = useCallback(async (auditId: string) => {
    if (findings[auditId]) return; // Already loaded

    try {
      setLoadingFindings(prev => ({ ...prev, [auditId]: true }));
      const response = await fetch(`/api/audits/${auditId}/findings?org_id=${orgId}`);
      if (!response.ok) throw new Error('Failed to fetch findings');
      const result = await response.json();
      setFindings(prev => ({ ...prev, [auditId]: result.data || [] }));
    } catch (err) {
      console.error('Error fetching findings:', err);
    } finally {
      setLoadingFindings(prev => ({ ...prev, [auditId]: false }));
    }
  }, [orgId, findings]);

  // Calculate progress based on status
  const calculateProgress = (status: AuditStatus): number => {
    const progressMap: Record<AuditStatus, number> = {
      planning: 15,
      in_progress: 50,
      fieldwork: 65,
      reporting: 85,
      completed: 100,
      closed: 100
    };
    return progressMap[status];
  };

  // Handle audit expansion - load findings when expanded
  const handleAuditClick = (audit: Audit) => {
    setSelectedAudit(selectedAudit?.id === audit.id ? null : audit);
    if (selectedAudit?.id !== audit.id && audit.findings_count > 0) {
      fetchFindings(audit.id);
    }
  };

  // Create new audit
  const handleCreateAudit = async () => {
    try {
      if (!formData.name || !formData.audit_type) {
        setError('Name and audit type are required');
        return;
      }

      const response = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: orgId,
          name: formData.name,
          audit_type: formData.audit_type,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          auditor: formData.auditor || null,
          lead_auditor_name: formData.lead_auditor_name || null,
          description: formData.description || null,
          scope: formData.scope ? formData.scope.split(',').map(s => s.trim()).filter(s => s) : [],
          frameworks: formData.frameworks ? formData.frameworks.split(',').map(f => f.trim()).filter(f => f) : []
        })
      });

      if (!response.ok) throw new Error('Failed to create audit');

      // Reset form and close modal
      setFormData({
        name: '',
        audit_type: 'internal',
        start_date: '',
        end_date: '',
        auditor: '',
        lead_auditor_name: '',
        description: '',
        scope: '',
        frameworks: ''
      });
      setShowCreateModal(false);

      // Refresh audits list
      await fetchAudits();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create audit');
      console.error('Error creating audit:', err);
    }
  };

  // Export audits as CSV
  const handleExportCSV = () => {
    const headers = ['Name', 'Type', 'Status', 'Auditor', 'Lead Auditor', 'Start Date', 'End Date', 'Progress', 'Findings'];
    const rows = filteredAudits.map(a => [
      a.name,
      a.audit_type,
      a.status,
      a.auditor,
      a.lead_auditor_name,
      a.start_date,
      a.end_date,
      `${a.progress}%`,
      a.findings_count
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audits-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle report generation
  const handleGenerateReport = (audit: Audit) => {
    alert(`Report generation started for "${audit.name}". You will receive a notification when it's ready.`);
  };

  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  const filteredAudits = audits.filter(audit => {
    const matchesStatus = statusFilter === null || audit.status === statusFilter;
    const matchesType = typeFilter === null || audit.audit_type === typeFilter;
    const matchesSearch = searchQuery === '' ||
      audit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audit.auditor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audit.frameworks.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesType && matchesSearch;
  });

  // Calculate stats from actual data
  const activeAudits = audits.filter(a => ['planning', 'in_progress', 'fieldwork', 'reporting'].includes(a.status)).length;
  const completedAudits = audits.filter(a => ['completed', 'closed'].includes(a.status)).length;
  const totalFindings = audits.reduce((sum, a) => sum + (a.findings_count || 0), 0);

  // For open findings, count from loaded findings data
  const openFindings = Object.values(findings).flat()
    .filter(f => f.status === 'open' || f.status === 'remediation').length ||
    audits.reduce((sum, a) => {
      const auditFindings = findings[a.id] || [];
      return sum + auditFindings.filter(f => f.status === 'open' || f.status === 'remediation').length;
    }, 0);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin text-sky-500 mx-auto mb-4" />
            <p className="text-slate-600">Loading audits...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 animate-fadeIn">
      {/* Create Audit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="rounded-2xl border border-slate-200/60 shadow-lg max-w-md w-full">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Create New Audit</CardTitle>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Audit Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="e.g., SOC 2 Type II Annual Audit"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Type *</label>
                  <select
                    value={formData.audit_type}
                    onChange={(e) => setFormData({ ...formData, audit_type: e.target.value as AuditType })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="internal">Internal</option>
                    <option value="external">External</option>
                    <option value="regulatory">Regulatory</option>
                    <option value="certification">Certification</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">End Date</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Auditor/Organization</label>
                  <input
                    type="text"
                    value={formData.auditor}
                    onChange={(e) => setFormData({ ...formData, auditor: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="e.g., Deloitte"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Lead Auditor Name</label>
                  <input
                    type="text"
                    value={formData.lead_auditor_name}
                    onChange={(e) => setFormData({ ...formData, lead_auditor_name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="e.g., Sarah Johnson"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="Audit description..."
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Scope (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="e.g., Security, Availability, Confidentiality"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Frameworks (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.frameworks}
                    onChange={(e) => setFormData({ ...formData, frameworks: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="e.g., SOC 2, ISO 27001"
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAudit}
                    className="flex-1 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 transition-colors"
                  >
                    Create Audit
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 transition-colors"
        >
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
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
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
                  onClick={() => handleAuditClick(audit)}
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
                  {selectedAudit?.id === audit.id && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <h4 className="text-sm font-semibold text-slate-900 mb-3">
                        Audit Findings
                      </h4>
                      {loadingFindings[audit.id] ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader className="h-4 w-4 animate-spin text-sky-500 mr-2" />
                          <span className="text-sm text-slate-600">Loading findings...</span>
                        </div>
                      ) : (findings[audit.id] && findings[audit.id].length > 0) ? (
                        <div className="space-y-2">
                          {findings[audit.id].map((finding) => {
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
                      ) : (
                        <div className="text-center py-4 text-slate-500 text-sm">
                          No findings recorded for this audit.
                        </div>
                      )}
                      <div className="mt-3 flex justify-end gap-2">
                        <button className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                          <Eye className="h-4 w-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => handleGenerateReport(audit)}
                          className="flex items-center gap-1 rounded-xl bg-sky-500 px-3 py-2 text-sm font-medium text-white hover:bg-sky-600 transition-colors"
                        >
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
            {filteredAudits
              .filter(a => a.start_date && (new Date(a.start_date) >= new Date() || a.status === 'in_progress' || a.status === 'fieldwork'))
              .sort((a, b) => {
                if (!a.start_date || !b.start_date) return 0;
                return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
              })
              .slice(0, 3)
              .map((audit) => {
                const status = statusConfig[audit.status];
                const startDate = new Date(audit.start_date || '');
                const daysUntilStart = audit.start_date ? Math.ceil((startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

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
