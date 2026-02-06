'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Shield, Plus, Download, Search, ChevronLeft, ChevronRight,
  Loader2, CheckCircle2, XCircle, AlertTriangle, Minus
} from 'lucide-react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/AuthContext';
import CreateControlModal, { ControlFormData } from '@/components/modals/CreateControlModal';
import { exportToCSV } from '@/lib/export';

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
  not_applicable: { label: 'Not Applicable', color: 'text-slate-600', bg: 'bg-slate-100', borderColor: 'border-slate-200', icon: Shield },
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

// Chart colors
const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1'];

const StatusCard = ({ icon: Icon, label, value, color, bgColor }: { icon: typeof Shield; label: string; value: number; color: string; bgColor: string }) => (
  <div className="rounded-xl border border-slate-200/60 bg-white p-6 flex items-center gap-4">
    <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', bgColor)}>
      <Icon className="w-6 h-6" style={{ color }} />
    </div>
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{label}</p>
      <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
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
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-20"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-10"></div></td>
  </tr>
);

export default function ControlsPage() {
  const { currentOrg } = useAuth();
  const orgId = currentOrg?.org_id || 'default';

  const [controls, setControls] = useState<ControlItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'all'>('dashboard');

  const fetchControls = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/controls?org_id=${orgId}`);
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
  }, [orgId]);

  useEffect(() => { fetchControls(); }, [fetchControls]);

  const handleCreateControl = async (data: ControlFormData) => {
    const res = await fetch('/api/controls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        org_id: orgId,
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

  // Dashboard metrics
  const totalControls = controls.length;
  const compliantCount = controls.filter(c => c.status === 'compliant').length;
  const nonCompliantCount = controls.filter(c => c.status === 'non_compliant').length;
  const notApplicableCount = controls.filter(c => c.status === 'not_applicable').length;

  // Function Grouping data for donut chart
  const functionGroupingData = Object.entries(categoryLabels).map(([key, label]) => {
    const count = controls.filter(c => c.category === key).length;
    return {
      name: label,
      value: count,
    };
  }).filter(item => item.value > 0);

  // By Framework data (mock data since we don't have framework mapping yet)
  const frameworkData = [
    { framework: 'SOC 2', compliant: Math.floor(compliantCount * 0.7), partial: Math.floor(nonCompliantCount * 0.5), nonCompliant: Math.floor(nonCompliantCount * 0.3) },
    { framework: 'ISO 27001', compliant: Math.floor(compliantCount * 0.65), partial: Math.floor(nonCompliantCount * 0.4), nonCompliant: Math.floor(nonCompliantCount * 0.35) },
    { framework: 'HIPAA', compliant: Math.floor(compliantCount * 0.6), partial: Math.floor(nonCompliantCount * 0.45), nonCompliant: Math.floor(nonCompliantCount * 0.4) },
    { framework: 'GDPR', compliant: Math.floor(compliantCount * 0.75), partial: Math.floor(nonCompliantCount * 0.35), nonCompliant: Math.floor(nonCompliantCount * 0.25) },
    { framework: 'PCI-DSS', compliant: Math.floor(compliantCount * 0.72), partial: Math.floor(nonCompliantCount * 0.38), nonCompliant: Math.floor(nonCompliantCount * 0.28) },
  ];

  // All Controls pagination
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
            <h1 className="text-3xl font-bold text-slate-900">Controls</h1>
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

        {/* TAB NAVIGATION */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              'px-4 py-3 text-sm font-medium transition-all border-b-2',
              activeTab === 'dashboard'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            )}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              'px-4 py-3 text-sm font-medium transition-all border-b-2',
              activeTab === 'all'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            )}
          >
            All Controls
          </button>
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* STATUS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatusCard
                icon={CheckCircle2}
                label="Compliant"
                value={compliantCount}
                color="#10b981"
                bgColor="bg-emerald-50"
              />
              <StatusCard
                icon={XCircle}
                label="Non Compliant"
                value={nonCompliantCount}
                color="#ef4444"
                bgColor="bg-red-50"
              />
              <StatusCard
                icon={Shield}
                label="Not Applicable"
                value={notApplicableCount}
                color="#64748b"
                bgColor="bg-slate-100"
              />
            </div>

            {/* CHARTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Function Grouping Donut Chart */}
              <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Function Grouping</h3>
                {functionGroupingData.length > 0 ? (
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={functionGroupingData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {functionGroupingData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => `${value} controls`}
                          contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-500">
                    No data available
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-200">
                  {functionGroupingData.slice(0, 6).map((item, idx) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <span className="text-xs text-slate-600">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Framework Bar Chart */}
              <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">By Framework</h3>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={frameworkData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <XAxis type="number" />
                      <YAxis dataKey="framework" type="category" width={90} tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Bar dataKey="compliant" stackId="a" fill="#10b981" name="Compliant" />
                      <Bar dataKey="partial" stackId="a" fill="#f59e0b" name="Partial" />
                      <Bar dataKey="nonCompliant" stackId="a" fill="#ef4444" name="Non-Compliant" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ALL CONTROLS TAB */}
        {activeTab === 'all' && (
          <div className="space-y-6">
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
