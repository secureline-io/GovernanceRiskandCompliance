'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FileText, Plus, Download, Search, AlertTriangle, RefreshCw,
  CheckCircle2, Clock, AlertCircle, Eye, X, Edit, Trash2, Zap
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/AuthContext';
import { exportToCSV } from '@/lib/export';

// Toast notification component
const Toast = ({ type, message, onClose }: { type: 'success' | 'error'; message: string; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={cn(
      'fixed bottom-6 right-6 rounded-lg px-4 py-3 text-sm font-medium flex items-center gap-2 z-50 animate-fadeIn',
      type === 'success'
        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
        : 'bg-red-500 text-white shadow-lg shadow-red-500/30'
    )}>
      {type === 'success' ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : (
        <AlertCircle className="w-4 h-4" />
      )}
      {message}
    </div>
  );
};

const statusConfig: Record<string, { label: string; color: string; bg: string; borderColor: string }> = {
  draft: { label: 'Draft', color: 'text-slate-700', bg: 'bg-slate-50', borderColor: 'border-slate-200' },
  active: { label: 'Active', color: 'text-sky-700', bg: 'bg-sky-50', borderColor: 'border-sky-200' },
  published: { label: 'Published', color: 'text-emerald-700', bg: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  archived: { label: 'Archived', color: 'text-amber-700', bg: 'bg-amber-50', borderColor: 'border-amber-200' }
};

const typeConfig: Record<string, { label: string }> = {
  security: { label: 'Security' },
  acceptable_use: { label: 'Acceptable Use' },
  data_retention: { label: 'Data Retention' },
  incident_response: { label: 'Incident Response' },
  access_control: { label: 'Access Control' }
};

const chartColors = ['#0ea5e9', '#10b981', '#f59e0b', '#64748b', '#ef4444'];

const SkeletonRow = () => (
  <tr>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-40"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-12"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-20"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-24"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-24"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-16"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-12"></div></td>
  </tr>
);

export default function PoliciesPage() {
  const { currentOrg } = useAuth();
  const orgId = currentOrg?.org_id || 'default';

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'all'>('dashboard');
  const [aiReadable, setAiReadable] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<any | null>(null);
  const [editingPolicy, setEditingPolicy] = useState<any | null>(null);
  const [newPolicy, setNewPolicy] = useState({ title: '', policy_type: 'security', content_markdown: '' });
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isEditSaving, setIsEditSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/policies?org_id=${orgId}`);
      const json = await res.json();
      const data = json.data || json || [];
      setPolicies(Array.isArray(data) ? data : []);
    } catch { setPolicies([]); }
    finally { setLoading(false); }
  }, [orgId]);

  useEffect(() => { fetchPolicies(); }, [fetchPolicies]);

  const handleCreate = async () => {
    if (!newPolicy.title) return;
    try {
      const res = await fetch('/api/policies', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: orgId, title: newPolicy.title, policy_type: newPolicy.policy_type, content_markdown: newPolicy.content_markdown }),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error); }
      setShowCreateForm(false);
      setNewPolicy({ title: '', policy_type: 'security', content_markdown: '' });
      await fetchPolicies();
      showNotification('Policy created successfully');
    } catch (err: any) {
      showNotification('Error creating policy: ' + err.message, 'error');
    }
  };

  const handlePublish = async (policyId: string) => {
    try {
      const res = await fetch(`/api/policies/${policyId}/publish`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error); }
      await fetchPolicies();
      showNotification('Policy published successfully');
    } catch (err: any) {
      showNotification('Error publishing policy: ' + err.message, 'error');
    }
  };

  const handleEditSave = async () => {
    if (!editingPolicy || !editingPolicy.title) {
      showNotification('Policy title is required', 'error');
      return;
    }

    setIsEditSaving(true);
    try {
      const res = await fetch(`/api/policies/${editingPolicy.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingPolicy.title,
          policy_type: editingPolicy.policy_type,
          content_markdown: editingPolicy.content_markdown,
        }),
      });

      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || 'Failed to save policy');
      }

      const { data: updatedPolicy } = await res.json();
      setSelectedPolicy(updatedPolicy);
      setEditingPolicy(null);
      await fetchPolicies();
      showNotification('Policy saved successfully');
    } catch (err: any) {
      showNotification('Error saving policy: ' + err.message, 'error');
    } finally {
      setIsEditSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPolicy) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/policies/${selectedPolicy.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || 'Failed to delete policy');
      }

      setSelectedPolicy(null);
      setShowDeleteConfirm(false);
      await fetchPolicies();
      showNotification('Policy archived successfully');
    } catch (err: any) {
      showNotification('Error deleting policy: ' + err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = () => {
    const exportData = policies.map(p => ({
      Title: p.title,
      Version: `v${p.version || 1}`,
      Status: p.status,
      Type: typeConfig[p.policy_type]?.label || p.policy_type,
      'Published Date': p.published_at ? new Date(p.published_at).toLocaleDateString() : '',
      'Last Updated': p.updated_at ? new Date(p.updated_at).toLocaleDateString() : '',
      'Ack Rate': p.acknowledgement_stats?.total > 0 ? Math.round((p.acknowledgement_stats.acknowledged / p.acknowledgement_stats.total) * 100) + '%' : ''
    }));
    exportToCSV(exportData, `policies-export-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const filteredPolicies = policies.filter(p => {
    const matchesSearch = searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filter === null || p.status === filter;
    return matchesSearch && matchesStatus;
  });

  const totalPolicies = policies.length;
  const publishedPolicies = policies.filter(p => p.status === 'published').length;
  const draftPolicies = policies.filter(p => p.status === 'draft').length;
  const archivedPolicies = policies.filter(p => p.status === 'archived').length;
  const activePolicies = policies.filter(p => p.status === 'active').length;
  const pendingAck = policies.reduce((s, p) => s + (p.acknowledgement_stats?.pending || 0), 0);

  // Calculate overall acknowledgement rate
  const totalAckStats = policies.reduce((acc, p) => {
    const stats = p.acknowledgement_stats || {};
    return {
      acknowledged: acc.acknowledged + (stats.acknowledged || 0),
      total: acc.total + (stats.total || 0)
    };
  }, { acknowledged: 0, total: 0 });
  const overallAckRate = totalAckStats.total > 0 ? Math.round((totalAckStats.acknowledged / totalAckStats.total) * 100) : 0;

  // Chart data for Policies by Type
  const policiesByTypeData = Object.entries(typeConfig).map(([key, config]) => ({
    name: config.label,
    count: policies.filter(p => p.policy_type === key).length
  }));

  // Chart data for Policy Status Distribution
  const statusDistributionData = [
    { name: 'Published', value: publishedPolicies, fill: chartColors[0] },
    { name: 'Draft', value: draftPolicies, fill: chartColors[1] },
    { name: 'Active', value: activePolicies, fill: chartColors[2] },
    { name: 'Archived', value: archivedPolicies, fill: chartColors[4] }
  ].filter(item => item.value > 0);

  const isNeedsReview = (updatedAt: string) => {
    if (!updatedAt) return false;
    const updated = new Date(updatedAt);
    const now = new Date();
    const daysSinceUpdate = (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate >= 90;
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="space-y-6 p-8 max-w-7xl mx-auto">
        {/* PAGE HEADER */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Policy Management</h1>
            <p className="text-sm text-slate-500 mt-1">
              Total: <span className="font-semibold text-slate-700">{totalPolicies}</span> policy{totalPolicies !== 1 ? 'ies' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAiReadable(!aiReadable)}
              className={cn(
                'rounded-xl px-4 py-2.5 text-sm font-medium transition-all active:scale-95 flex items-center gap-2',
                aiReadable
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/25 hover:bg-sky-600'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-sm'
              )}
            >
              <Zap className="w-4 h-4" />
              {aiReadable ? 'AI Enhanced' : 'AI Readability'}
            </button>
            <button
              onClick={handleExport}
              className="rounded-xl px-4 py-2.5 text-sm font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="rounded-xl px-4 py-2.5 text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/25 transition-all active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Policy
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="border-b border-slate-200 bg-white rounded-t-xl">
          <div className="flex gap-8 px-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={cn(
                'py-4 font-medium text-sm transition-colors relative',
                activeTab === 'dashboard'
                  ? 'text-sky-600'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Dashboard
              {activeTab === 'dashboard' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                'py-4 font-medium text-sm transition-colors relative',
                activeTab === 'all'
                  ? 'text-sky-600'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              All Policies
              {activeTab === 'all' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600"></div>
              )}
            </button>
          </div>
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* STATUS CARDS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Policies */}
              <div className="rounded-xl border border-slate-200/60 bg-white p-4 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 text-slate-500">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Total Policies</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{totalPolicies}</p>
                </div>
              </div>

              {/* Published */}
              <div className="rounded-xl border border-slate-200/60 bg-white p-4 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-500">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Published</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{publishedPolicies}</p>
                </div>
              </div>

              {/* Draft */}
              <div className="rounded-xl border border-slate-200/60 bg-white p-4 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 text-slate-500">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Draft</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{draftPolicies}</p>
                </div>
              </div>

              {/* Pending Acknowledgements */}
              <div className="rounded-xl border border-slate-200/60 bg-white p-4 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 text-amber-500">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Pending Acknowledgements</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{pendingAck}</p>
                </div>
              </div>
            </div>

            {/* CHARTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Policies by Type */}
              <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Policies by Type</h3>
                {policiesByTypeData.some(d => d.count > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={policiesByTypeData}>
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-72 flex items-center justify-center text-slate-500">
                    <p className="text-sm">No policies data available</p>
                  </div>
                )}
              </div>

              {/* Policy Status Distribution */}
              <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Policy Status Distribution</h3>
                {statusDistributionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {statusDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-72 flex items-center justify-center text-slate-500">
                    <p className="text-sm">No policies data available</p>
                  </div>
                )}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  {statusDistributionData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                      <span className="text-sm text-slate-600">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ACKNOWLEDGEMENT OVERVIEW */}
            <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Acknowledgement Overview</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-700">Overall Acknowledgement Rate</span>
                    <span className="text-lg font-bold text-slate-900">{overallAckRate}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        overallAckRate === 100 ? 'bg-emerald-500' : overallAckRate >= 80 ? 'bg-amber-500' : 'bg-red-500'
                      )}
                      style={{ width: `${overallAckRate}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Total Recipients</p>
                    <p className="text-2xl font-bold text-slate-900">{totalAckStats.total}</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-xs text-emerald-600 uppercase tracking-wider font-medium mb-2">Acknowledged</p>
                    <p className="text-2xl font-bold text-emerald-700">{totalAckStats.acknowledged}</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-xs text-amber-600 uppercase tracking-wider font-medium mb-2">Pending</p>
                    <p className="text-2xl font-bold text-amber-700">{pendingAck}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ALL POLICIES TAB */}
        {activeTab === 'all' && (
          <div className="space-y-6 animate-fadeIn">
            {/* INLINE CREATION FORM */}
            {showCreateForm && (
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm animate-fadeIn">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">New Policy</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Policy Title *</label>
                    <input
                      type="text"
                      placeholder="Enter policy title..."
                      value={newPolicy.title}
                      onChange={e => setNewPolicy(p => ({ ...p, title: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Policy Type</label>
                    <select
                      value={newPolicy.policy_type}
                      onChange={e => setNewPolicy(p => ({ ...p, policy_type: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    >
                      <option value="security">Security</option>
                      <option value="acceptable_use">Acceptable Use</option>
                      <option value="data_retention">Data Retention</option>
                      <option value="incident_response">Incident Response</option>
                      <option value="access_control">Access Control</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Content (Markdown)</label>
                    <textarea
                      rows={6}
                      placeholder="Enter policy content in markdown format..."
                      value={newPolicy.content_markdown}
                      onChange={e => setNewPolicy(p => ({ ...p, content_markdown: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreate}
                      className="rounded-xl bg-sky-500 hover:bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition-all active:scale-95"
                    >
                      Create Policy
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* FILTER BAR */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative w-full sm:w-auto sm:max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter(null)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all',
                    filter === null
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  All
                </button>
                {['draft', 'active', 'published', 'archived'].map(key => {
                  const config = statusConfig[key];
                  const count = policies.filter(p => p.status === key).length;
                  return (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all',
                        filter === key
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
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Version</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ack Rate</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Updated</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Review</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                    </tbody>
                  </table>
                </div>
              ) : filteredPolicies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-lg font-semibold text-slate-900">
                    {totalPolicies === 0 ? 'No policies yet' : 'No policies match your filters'}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {totalPolicies === 0
                      ? 'Create your first security policy to start.'
                      : 'Try adjusting your search or filters'}
                  </p>
                  {totalPolicies === 0 && (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="mt-6 rounded-xl px-4 py-2.5 text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/25 transition-all active:scale-95 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create First Policy
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200">
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Version</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ack Rate</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Updated</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Review</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPolicies.map(policy => {
                        const status = statusConfig[policy.status] || statusConfig.draft;
                        const ackStats = policy.acknowledgement_stats || {};
                        const ackRate = ackStats.total > 0 ? Math.round((ackStats.acknowledged / ackStats.total) * 100) : 0;
                        const needsReview = policy.updated_at && isNeedsReview(policy.updated_at);
                        const lastUpdated = new Date(policy.updated_at || policy.created_at);

                        return (
                          <tr key={policy.id} className="border-b border-slate-100 hover:bg-sky-50/30 transition-colors cursor-pointer">
                            <td className="px-5 py-4">
                              <div>
                                <p className="text-sm font-medium text-slate-900">{policy.title}</p>
                                {typeConfig[policy.policy_type] && (
                                  <p className="text-xs text-slate-500 mt-0.5">{typeConfig[policy.policy_type].label}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded-md text-slate-700">
                                v{policy.version || 1}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium border', status.bg, status.color, status.borderColor)}>
                                {status.label}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              {ackStats.total > 0 ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-20 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                    <div
                                      className={cn(
                                        'h-full rounded-full transition-all',
                                        ackRate === 100 ? 'bg-emerald-500' : ackRate >= 80 ? 'bg-amber-500' : 'bg-red-500'
                                      )}
                                      style={{ width: `${ackRate}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium text-slate-600 w-10">{ackRate}%</span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400">-</span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-600">
                              {lastUpdated.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                            <td className="px-5 py-4">
                              {needsReview ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                                  <AlertTriangle className="h-3 w-3" />
                                  Review
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">-</span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                {policy.status === 'draft' && (
                                  <button
                                    onClick={() => handlePublish(policy.id)}
                                    className="text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors bg-sky-50 hover:bg-sky-100 px-2.5 py-1.5 rounded-lg"
                                  >
                                    Publish
                                  </button>
                                )}
                                {policy.status !== 'draft' && (
                                  <button
                                    onClick={() => setSelectedPolicy(policy)}
                                    className="text-xs font-medium text-slate-600 hover:text-slate-700 transition-colors"
                                  >
                                    View
                                  </button>
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
          </div>
        )}
      </div>

      {/* POLICY DETAIL PANEL */}
      {selectedPolicy && !editingPolicy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 bg-white">
              <h2 className="text-xl font-bold text-slate-900">Policy Details</h2>
              <button
                onClick={() => setSelectedPolicy(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</label>
                <p className="text-sm font-medium text-slate-900 mt-1">{selectedPolicy.title}</p>
              </div>

              {/* Policy Type */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</label>
                <p className="text-sm text-slate-700 mt-1">{typeConfig[selectedPolicy.policy_type]?.label || selectedPolicy.policy_type}</p>
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
                <div className="mt-1">
                  <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium border', statusConfig[selectedPolicy.status].bg, statusConfig[selectedPolicy.status].color, statusConfig[selectedPolicy.status].borderColor)}>
                    {statusConfig[selectedPolicy.status].label}
                  </span>
                </div>
              </div>

              {/* Version */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Version</label>
                <p className="text-sm font-mono text-slate-700 mt-1">v{selectedPolicy.version || 1}</p>
              </div>

              {/* Owner */}
              {selectedPolicy.owner && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Owner</label>
                  <p className="text-sm text-slate-700 mt-1">{selectedPolicy.owner}</p>
                </div>
              )}

              {/* Approval Status */}
              {selectedPolicy.approval_status && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approval Status</label>
                  <p className="text-sm text-slate-700 mt-1">{selectedPolicy.approval_status}</p>
                </div>
              )}

              {/* Effective Date */}
              {selectedPolicy.effective_date && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Effective Date</label>
                  <p className="text-sm text-slate-700 mt-1">
                    {new Date(selectedPolicy.effective_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {/* Review Date */}
              {selectedPolicy.review_date && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Review Date</label>
                  <p className="text-sm text-slate-700 mt-1">
                    {new Date(selectedPolicy.review_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {/* Content */}
              {selectedPolicy.content_markdown && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Content</label>
                  <div className="mt-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">{selectedPolicy.content_markdown}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 flex justify-between gap-3 p-6 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => {
                  setShowDeleteConfirm(true);
                }}
                className="rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2.5 text-sm font-medium transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Archive
              </button>
              <div className="flex gap-3">
                {selectedPolicy.status === 'draft' && (
                  <button
                    onClick={async () => {
                      await handlePublish(selectedPolicy.id);
                      setSelectedPolicy(null);
                    }}
                    className="rounded-xl bg-sky-500 hover:bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition-all active:scale-95"
                  >
                    Publish
                  </button>
                )}
                <button
                  onClick={() => setEditingPolicy(selectedPolicy)}
                  className="rounded-xl border border-sky-200 bg-sky-50 text-sky-600 hover:bg-sky-100 px-4 py-2.5 text-sm font-medium transition-all flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => setSelectedPolicy(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POLICY EDIT MODAL */}
      {editingPolicy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 bg-white">
              <h2 className="text-xl font-bold text-slate-900">Edit Policy</h2>
              <button
                onClick={() => setEditingPolicy(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Title</label>
                <input
                  type="text"
                  value={editingPolicy.title}
                  onChange={e => setEditingPolicy({ ...editingPolicy, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>

              {/* Policy Type */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Policy Type</label>
                <select
                  value={editingPolicy.policy_type}
                  onChange={e => setEditingPolicy({ ...editingPolicy, policy_type: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="security">Security</option>
                  <option value="acceptable_use">Acceptable Use</option>
                  <option value="data_retention">Data Retention</option>
                  <option value="incident_response">Incident Response</option>
                  <option value="access_control">Access Control</option>
                </select>
              </div>

              {/* Content */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Content (Markdown)</label>
                <textarea
                  rows={8}
                  value={editingPolicy.content_markdown}
                  onChange={e => setEditingPolicy({ ...editingPolicy, content_markdown: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setEditingPolicy(null)}
                disabled={isEditSaving}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={isEditSaving}
                className="rounded-xl bg-sky-500 hover:bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEditSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && selectedPolicy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Archive Policy</h3>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to archive <span className="font-semibold">"{selectedPolicy.title}"</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-xl bg-red-500 hover:bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? 'Archiving...' : 'Archive Policy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {notification && (
        <Toast
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
