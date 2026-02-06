'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FileText, Plus, Download, Search, AlertTriangle, RefreshCw,
  CheckCircle2, Clock, AlertCircle, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { exportToCSV } from '@/lib/export';

const DEFAULT_ORG_ID = 'default';

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
  const [filter, setFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPolicy, setNewPolicy] = useState({ title: '', policy_type: 'security', content_markdown: '' });

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/policies?org_id=${DEFAULT_ORG_ID}`);
      const json = await res.json();
      const data = json.data || json || [];
      setPolicies(Array.isArray(data) ? data : []);
    } catch { setPolicies([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPolicies(); }, [fetchPolicies]);

  const handleCreate = async () => {
    if (!newPolicy.title) return;
    try {
      const res = await fetch('/api/policies', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: DEFAULT_ORG_ID, title: newPolicy.title, policy_type: newPolicy.policy_type, content_markdown: newPolicy.content_markdown }),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error); }
      setShowCreateForm(false);
      setNewPolicy({ title: '', policy_type: 'security', content_markdown: '' });
      await fetchPolicies();
    } catch (err: any) { alert('Error: ' + err.message); }
  };

  const handlePublish = async (policyId: string) => {
    try {
      const res = await fetch(`/api/policies/${policyId}/publish`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error); }
      await fetchPolicies();
    } catch (err: any) { alert('Error: ' + err.message); }
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
  const pendingAck = policies.reduce((s, p) => s + (p.acknowledgement_stats?.pending || 0), 0);

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

        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
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
                                onClick={() => {}}
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
    </div>
  );
}
