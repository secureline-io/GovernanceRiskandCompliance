'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Shield, Plus, Download, Search, MoreVertical, ChevronLeft, ChevronRight,
  Loader2, CheckCircle2, XCircle, AlertTriangle, Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import CreateControlModal, { ControlFormData } from '@/components/modals/CreateControlModal';
import { exportToCSV } from '@/lib/export';

const DEFAULT_ORG_ID = 'default';
const ITEMS_PER_PAGE = 20;

interface ControlItem {
  id: string;
  org_id: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  control_type?: string;
  control_nature?: string;
  frequency?: string;
  status: string;
  effectiveness_score?: number;
  owner_id?: string;
  implementation_details?: string;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; borderColor: string; icon: typeof CheckCircle2 }> = {
  compliant: { label: 'Compliant', color: 'text-emerald-700', bg: 'bg-emerald-50', borderColor: 'border-emerald-200', icon: CheckCircle2 },
  non_compliant: { label: 'Non-Compliant', color: 'text-red-700', bg: 'bg-red-50', borderColor: 'border-red-200', icon: XCircle },
  not_tested: { label: 'Not Tested', color: 'text-slate-600', bg: 'bg-slate-100', borderColor: 'border-slate-200', icon: Minus },
  partially_compliant: { label: 'Partially Compliant', color: 'text-amber-700', bg: 'bg-amber-50', borderColor: 'border-amber-200', icon: AlertTriangle },
  not_applicable: { label: 'N/A', color: 'text-slate-600', bg: 'bg-slate-100', borderColor: 'border-slate-200', icon: Shield },
  accepted_risk: { label: 'Accepted Risk', color: 'text-blue-700', bg: 'bg-blue-50', borderColor: 'border-blue-200', icon: Shield },
};

const categoryLabels: Record<string, string> = {
  access_control: 'Access Control',
  change_management: 'Change Management',
  security_operations: 'Security Operations',
  risk_management: 'Risk Management',
  data_protection: 'Data Protection',
  incident_response: 'Incident Response',
  business_continuity: 'Business Continuity',
  compliance: 'Compliance',
  governance: 'Governance',
};

const controlNatureConfig: Record<string, { label: string; color: string; bg: string }> = {
  automated: { label: 'Automated', color: 'text-sky-700', bg: 'bg-sky-50' },
  manual: { label: 'Manual', color: 'text-amber-700', bg: 'bg-amber-50' },
  hybrid: { label: 'Hybrid', color: 'text-indigo-700', bg: 'bg-indigo-50' },
};

const StatCard = ({ icon: Icon, label, value, color }: { icon: typeof Shield; label: string; value: number; color: string }) => (
  <div className="rounded-xl border border-slate-200/60 bg-white p-4 flex items-center gap-4">
    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', `bg-${color}-50 text-${color}-500`)}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  </div>
);

const SkeletonRow = () => (
  <tr>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-12"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-32"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-24"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-20"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-16"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-12"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-10"></div></td>
  </tr>
);

export default function ControlsPage() {
  const [controls, setControls] = useState<ControlItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchControls = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/controls?org_id=${DEFAULT_ORG_ID}`);
      const json = await res.json();
      const data = json.data || json || [];
      setControls(Array.isArray(data) ? data : []);
      setError(null);
      setCurrentPage(1);
    } catch (err: any) {
      setError(err.message);
      setControls([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchControls(); }, [fetchControls]);

  const handleCreateControl = async (data: ControlFormData) => {
    const res = await fetch('/api/controls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        org_id: DEFAULT_ORG_ID,
        code: data.code,
        name: data.name,
        description: data.description,
        category: data.category,
        control_type: data.control_type,
        control_nature: data.control_nature,
        frequency: data.frequency,
        implementation_details: data.implementation_details,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create control');
    await fetchControls();
  };

  const handleStatusChange = async (controlId: string, newStatus: string) => {
    setUpdatingId(controlId);
    try {
      const res = await fetch(`/api/controls/${controlId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      await fetchControls();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExport = () => {
    const exportData = controls.map(c => ({
      Code: c.code,
      Name: c.name,
      Description: c.description || '',
      Category: c.category || '',
      Type: c.control_type || '',
      Nature: c.control_nature || '',
      Status: c.status,
      Effectiveness: c.effectiveness_score ?? '',
      Frequency: c.frequency || ''
    }));
    exportToCSV(exportData, `controls-export-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const filteredControls = controls.filter(c => {
    const matchesSearch = searchQuery === '' ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === null || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalControls = controls.length;
  const compliantCount = controls.filter(c => c.status === 'compliant').length;
  const nonCompliantCount = controls.filter(c => c.status === 'non_compliant').length;
  const inProgressCount = controls.filter(c => c.status === 'partially_compliant' || c.status === 'not_tested').length;

  const totalPages = Math.ceil(filteredControls.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedControls = filteredControls.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const statusFilterOptions = ['compliant', 'partially_compliant', 'non_compliant', 'not_tested'];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="space-y-6 p-8 max-w-7xl mx-auto">
        {/* PAGE HEADER */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Controls</h1>
            <p className="text-sm text-slate-500 mt-1">
              Total: <span className="font-semibold text-slate-700">{totalControls}</span> control{totalControls !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="rounded-xl px-4 py-2.5 text-sm font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="rounded-xl px-4 py-2.5 text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/25 transition-all active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Control
            </button>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Shield} label="Total Controls" value={totalControls} color="slate" />
          <StatCard icon={CheckCircle2} label="Compliant" value={compliantCount} color="emerald" />
          <StatCard icon={AlertTriangle} label="In Progress" value={inProgressCount} color="amber" />
          <StatCard icon={XCircle} label="Non-Compliant" value={nonCompliantCount} color="red" />
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative w-full sm:w-auto sm:max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by code, name, or description..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setStatusFilter(null); setCurrentPage(1); }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all',
                statusFilter === null
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              All
            </button>
            {statusFilterOptions.map(key => {
              const config = statusConfig[key];
              const count = controls.filter(c => c.status === key).length;
              return (
                <button
                  key={key}
                  onClick={() => { setStatusFilter(key); setCurrentPage(1); }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all',
                    statusFilter === key
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nature</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Effectiveness</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                </tbody>
              </table>
            </div>
          ) : filteredControls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-lg font-semibold text-slate-900">
                {controls.length === 0 ? 'No controls yet' : 'No controls match your filters'}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {controls.length === 0 ? 'Create your first control to start tracking compliance.' : 'Try adjusting your search or filters'}
              </p>
              {controls.length === 0 && (
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="mt-6 rounded-xl px-4 py-2.5 text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/25 transition-all active:scale-95 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Control
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nature</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Effectiveness</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedControls.map(control => {
                    const status = statusConfig[control.status] || statusConfig.not_tested;
                    const natureConfig = control.control_nature
                      ? controlNatureConfig[control.control_nature] || { label: 'Unclassified', color: 'text-slate-600', bg: 'bg-slate-100' }
                      : { label: 'Unclassified', color: 'text-slate-600', bg: 'bg-slate-100' };
                    const categoryLabel = control.category ? categoryLabels[control.category] || control.category : '-';
                    const effectivenessPercent = control.effectiveness_score !== null && control.effectiveness_score !== undefined
                      ? Math.round(control.effectiveness_score * 100)
                      : null;

                    return (
                      <tr key={control.id} className="border-b border-slate-100 hover:bg-sky-50/30 transition-colors cursor-pointer">
                        <td className="px-5 py-4 text-sm">
                          <code className="font-mono text-xs bg-slate-100 px-2 py-1 rounded-md text-slate-700">{control.code}</code>
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{control.name}</p>
                            {control.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{control.description}</p>}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">{categoryLabel}</td>
                        <td className="px-5 py-4">
                          <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium border', status.bg, status.color, status.borderColor)}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', natureConfig.bg, natureConfig.color)}>
                            {natureConfig.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {effectivenessPercent !== null ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                <div
                                  className="h-full bg-sky-500 transition-all"
                                  style={{ width: `${effectivenessPercent}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-medium text-slate-600 w-8">{effectivenessPercent}%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={control.status}
                              onChange={e => handleStatusChange(control.id, e.target.value)}
                              disabled={updatingId === control.id}
                              className={cn(
                                'rounded-lg border px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-all',
                                'bg-white border-slate-200 text-slate-700',
                                updatingId === control.id && 'opacity-50 cursor-not-allowed'
                              )}
                            >
                              {Object.entries(statusConfig).map(([key, cfg]) => (
                                <option key={key} value={key}>{cfg.label}</option>
                              ))}
                            </select>
                            {updatingId === control.id && (
                              <Loader2 className="w-4 h-4 text-sky-500 animate-spin" />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {!loading && filteredControls.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-slate-200/60">
            <p className="text-sm text-slate-600">
              Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
              <span className="font-semibold">{Math.min(startIndex + ITEMS_PER_PAGE, filteredControls.length)}</span> of{' '}
              <span className="font-semibold">{filteredControls.length}</span> controls
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                      currentPage === page
                        ? 'bg-sky-500 text-white'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateControlModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateControl}
      />
    </div>
  );
}
