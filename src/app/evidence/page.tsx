'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FileText, Plus, Download, Search, FolderOpen, Cloud, User, CheckCircle2,
  RefreshCw, Clock, Code
} from 'lucide-react';
import { cn } from '@/lib/utils';
import EvidenceUploadModal, { EvidenceData } from '@/components/modals/EvidenceUploadModal';
import { exportToCSV, exportToJSON } from '@/lib/export';

const DEFAULT_ORG_ID = 'default';

const sourceConfig: Record<string, { label: string; color: string; bg: string; badge: string; icon: typeof Cloud }> = {
  aws: { label: 'AWS', color: 'text-orange-600', bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700', icon: Cloud },
  azure: { label: 'Azure', color: 'text-sky-600', bg: 'bg-sky-50', badge: 'bg-sky-100 text-sky-700', icon: Cloud },
  gcp: { label: 'GCP', color: 'text-red-600', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700', icon: Cloud },
  manual: { label: 'Manual', color: 'text-slate-600', bg: 'bg-slate-50', badge: 'bg-slate-100 text-slate-700', icon: User },
  github: { label: 'GitHub', color: 'text-slate-700', bg: 'bg-slate-50', badge: 'bg-slate-100 text-slate-700', icon: Code },
  integration: { label: 'Integration', color: 'text-emerald-600', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  cspm_scan: { label: 'CSPM', color: 'text-cyan-600', bg: 'bg-cyan-50', badge: 'bg-cyan-100 text-cyan-700', icon: Cloud }
};

const fileTypeConfig: Record<string, { color: string }> = {
  json: { color: 'text-amber-600' }, pdf: { color: 'text-red-600' }, xlsx: { color: 'text-emerald-600' },
  csv: { color: 'text-sky-600' }, png: { color: 'text-purple-600' }, jpg: { color: 'text-pink-600' }
};

const SkeletonRow = () => (
  <tr>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-32"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-24"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-16"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-24"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-32"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-12"></div></td>
  </tr>
);

export default function EvidencePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvidence = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/evidence?org_id=${DEFAULT_ORG_ID}`);
      const json = await res.json();
      const data = json.data || json || [];
      setEvidenceList(Array.isArray(data) ? data : []);
    } catch { setEvidenceList([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEvidence(); }, [fetchEvidence]);

  const handleUpload = async (evidenceData: EvidenceData) => {
    const res = await fetch('/api/evidence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        org_id: DEFAULT_ORG_ID,
        title: evidenceData.title,
        description: evidenceData.description,
        source: evidenceData.source,
        file_path: evidenceData.file?.name || null,
        file_type: evidenceData.file?.name?.split('.').pop() || null,
        file_size_bytes: evidenceData.file?.size || null,
        control_ids: [],
      }),
    });

    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || 'Failed to upload evidence');
    }

    await fetchEvidence();
  };

  const handleExport = () => {
    const exportData = evidenceList.map(item => ({
      Title: item.title,
      Description: item.description || '',
      Source: item.source,
      'File Type': item.file_type || '',
      'Upload Date': item.collected_at || item.created_at,
      Hash: item.hash || ''
    }));
    exportToCSV(exportData, `evidence-export-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const filteredEvidence = evidenceList.filter(item => {
    const matchesSearch = searchQuery === '' ||
      (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = sourceFilter === null || item.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  const totalEvidence = evidenceList.length;
  const automatedEvidence = evidenceList.filter(e => e.source !== 'manual').length;
  const manualEvidence = totalEvidence - automatedEvidence;
  const recentEvidence = evidenceList.filter(e => {
    const collected = new Date(e.collected_at || e.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return collected > weekAgo;
  }).length;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="space-y-6 p-8 max-w-7xl mx-auto">
        {/* PAGE HEADER */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Evidence Library</h1>
            <p className="text-sm text-slate-500 mt-1">
              Total: <span className="font-semibold text-slate-700">{totalEvidence}</span> item{totalEvidence !== 1 ? 's' : ''}
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
              onClick={() => setUploadModalOpen(true)}
              className="rounded-xl px-4 py-2.5 text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/25 transition-all active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Upload Evidence
            </button>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
          {/* Total Evidence */}
          <div className="rounded-xl border border-slate-200/60 bg-white p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 text-slate-500">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Total Evidence</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalEvidence}</p>
            </div>
          </div>

          {/* Automated */}
          <div className="rounded-xl border border-slate-200/60 bg-white p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Automated</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{automatedEvidence}</p>
            </div>
          </div>

          {/* Manual */}
          <div className="rounded-xl border border-slate-200/60 bg-white p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 text-amber-500">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Manual</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{manualEvidence}</p>
            </div>
          </div>

          {/* Recent */}
          <div className="rounded-xl border border-slate-200/60 bg-white p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-sky-50 text-sky-500">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Last 7 Days</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{recentEvidence}</p>
            </div>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative w-full sm:w-auto sm:max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSourceFilter(null)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all',
                sourceFilter === null
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              All
            </button>
            {Object.entries(sourceConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSourceFilter(key)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all',
                  sourceFilter === key
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {config.label}
              </button>
            ))}
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
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Source</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Hash</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Upload Date</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                </tbody>
              </table>
            </div>
          ) : filteredEvidence.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center mb-4">
                <FolderOpen className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-lg font-semibold text-slate-900">
                {totalEvidence === 0 ? 'No evidence collected yet' : 'No evidence matches your filters'}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {totalEvidence === 0
                  ? 'Upload evidence to start building your compliance audit trail.'
                  : 'Try adjusting your search or filters'}
              </p>
              {totalEvidence === 0 && (
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="mt-6 rounded-xl px-4 py-2.5 text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/25 transition-all active:scale-95 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Upload Evidence
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Source</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Hash</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Upload Date</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvidence.map(item => {
                    const source = sourceConfig[item.source] || sourceConfig.manual;
                    const ft = fileTypeConfig[item.file_type || ''] || { color: 'text-slate-600' };
                    const uploadDate = new Date(item.collected_at || item.created_at);

                    return (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-sky-50/30 transition-colors cursor-pointer">
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{item.title}</p>
                            {item.description && (
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', source.badge)}>
                            {source.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {item.file_type ? (
                            <span className={cn('inline-flex items-center rounded-lg px-2 py-1 text-xs font-mono font-medium bg-slate-100', ft.color)}>
                              {item.file_type.toUpperCase()}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {item.hash ? (
                            <code className="text-xs font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded">
                              {item.hash.substring(0, 12)}...
                            </code>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {uploadDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => {}}
                            className="text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors"
                          >
                            View
                          </button>
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

      <EvidenceUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
}
