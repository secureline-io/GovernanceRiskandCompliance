'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, Upload, ChevronRight, ChevronDown, Check, X,
  Shield, FileText, AlertCircle, CheckCircle, RefreshCw,
  BarChart3, Filter, Layers, Library, Grid3X3, ArrowUpDown,
  ExternalLink, Info, Zap, Target, TrendingUp, Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/AuthContext';

// ─── Type Definitions ────────────────────────────────────────────────────────

interface UCFControl {
  id: string;
  code: string;
  title: string;
  description: string | null;
  category: string | null;
  objective: string | null;
  guidance: string | null;
  testing_procedures: string | null;
  implementation_status?: string;
  mapped_requirements_count: number;
  frameworks_impacted: string[];
}

interface Framework {
  id: string;
  code: string;
  name: string;
  version: string | null;
  authority: string | null;
  category: string | null;
  description: string | null;
  is_custom: boolean;
  framework_requirements: { count: number }[];
}

interface FrameworkRequirement {
  id: string;
  framework_id: string;
  code: string;
  name: string;
  title?: string;
  description?: string;
  guidance?: string;
  category?: string;
  evidence_requirements?: string;
  evidence_examples?: string[];
  domain?: {
    id: string;
    code: string;
    name: string;
  };
  ucf_mappings?: {
    ucf_control_code: string;
    ucf_control_id: string;
    mapping_strength?: string;
  }[];
  evidence_count?: number;
  coverage_status?: 'covered' | 'partial' | 'gap';
}

interface PortfolioData {
  frameworks: {
    id: string;
    code: string;
    name: string;
    total_requirements: number;
    covered_requirements: number;
    coverage_pct: number;
  }[];
  gaps: {
    framework_code: string;
    framework_name: string;
    requirement_code: string;
    requirement_name: string;
  }[];
  overlaps: {
    ucf_code: string;
    ucf_title: string;
    frameworks: string[];
    framework_count: number;
  }[];
}

interface FrameworkPack {
  id: string;
  name: string;
  version: string;
  authority: string;
  requirements_count: number;
  ucf_mappings_count: number;
  imported_at: string;
  status: string;
}

type TabKey = 'framework' | 'ucf' | 'portfolio' | 'import';

// ─── Helper Functions ────────────────────────────────────────────────────────

const getFrameworkColor = (code: string): string => {
  const colors: Record<string, string> = {
    'SOC2': 'bg-blue-100 text-blue-700 border-blue-200',
    'ISO27001': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'NIST-CSF': 'bg-purple-100 text-purple-700 border-purple-200',
    'PCI-DSS': 'bg-amber-100 text-amber-700 border-amber-200',
    'HIPAA': 'bg-rose-100 text-rose-700 border-rose-200',
    'GDPR': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'CIS-CSC': 'bg-teal-100 text-teal-700 border-teal-200',
    'CMMC': 'bg-orange-100 text-orange-700 border-orange-200',
    'CSA-CCM': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'FedRAMP': 'bg-violet-100 text-violet-700 border-violet-200',
  };
  return colors[code] || 'bg-slate-100 text-slate-700 border-slate-200';
};

const getStatusIndicator = (status: string | undefined) => {
  switch (status) {
    case 'covered':
      return { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Covered' };
    case 'partial':
      return { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Partial' };
    case 'gap':
      return { icon: X, color: 'text-red-500', bg: 'bg-red-50', label: 'Gap' };
    default:
      return { icon: AlertCircle, color: 'text-slate-400', bg: 'bg-slate-50', label: 'Not Assessed' };
  }
};

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function ComplianceMapperPage() {
  const { currentOrg } = useAuth();
  const orgId = currentOrg?.org_id || 'default';

  // Global state
  const [activeTab, setActiveTab] = useState<TabKey>('framework');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Data state
  const [ucfControls, setUcfControls] = useState<UCFControl[]>([]);
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loadingUcf, setLoadingUcf] = useState(true);
  const [loadingFrameworks, setLoadingFrameworks] = useState(true);

  // ─── Data Fetching ───────────────────────────────────────────────────────

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    fetchUcfControls();
    fetchFrameworks();
  }, []);

  const fetchUcfControls = async () => {
    setLoadingUcf(true);
    try {
      const response = await fetch('/api/ucf');
      const result = await response.json();
      if (result.data) {
        setUcfControls(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch UCF controls:', error);
    } finally {
      setLoadingUcf(false);
    }
  };

  const fetchFrameworks = async () => {
    setLoadingFrameworks(true);
    try {
      const response = await fetch('/api/frameworks');
      const result = await response.json();
      if (result.data) {
        setFrameworks(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch frameworks:', error);
    } finally {
      setLoadingFrameworks(false);
    }
  };

  // ─── Computed Stats ──────────────────────────────────────────────────────

  const totalUcfControls = ucfControls.length;
  const frameworksMapped = frameworks.length;
  const totalFrameworkRequirements = frameworks.reduce(
    (sum, f) => sum + (f.framework_requirements?.[0]?.count || 0),
    0
  );
  const coveredRequirements = ucfControls.reduce(
    (sum, c) => sum + c.mapped_requirements_count,
    0
  );
  const implementedControls = ucfControls.filter(
    (c) => c.implementation_status === 'implemented' || c.implementation_status === 'active'
  ).length;
  const implementationRate = totalUcfControls > 0
    ? Math.round((implementedControls / totalUcfControls) * 100)
    : 0;
  const coveragePct = totalFrameworkRequirements > 0
    ? Math.round((coveredRequirements / totalFrameworkRequirements) * 100)
    : 0;

  // ─── Tab Config ──────────────────────────────────────────────────────────

  const tabs: { key: TabKey; label: string; icon: typeof Shield }[] = [
    { key: 'framework', label: 'Framework View', icon: Shield },
    { key: 'ucf', label: 'UCF Library', icon: Library },
    { key: 'portfolio', label: 'Portfolio Dashboard', icon: BarChart3 },
    { key: 'import', label: 'Import', icon: Upload },
  ];

  // ─── Loading State ───────────────────────────────────────────────────────

  const isLoading = loadingUcf || loadingFrameworks;

  if (isLoading) {
    return (
      <div className="p-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
        <div className="mb-8">
          <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-96 bg-slate-100 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse mb-3" />
              <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
            <p className="text-gray-600 text-sm">Loading compliance data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg text-white z-50 transition-all ${
            toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3">
          <Layers className="w-8 h-8 text-sky-600" />
          <h1 className="text-3xl font-bold text-gray-900">Compliance Mapper</h1>
        </div>
        <p className="text-gray-600 mt-2">
          Map controls across frameworks, track coverage, and identify gaps
        </p>
      </div>

      {/* ─── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">UCF Controls</p>
              <p className="text-3xl font-bold text-gray-900">{totalUcfControls}</p>
              <p className="text-xs text-gray-500 mt-1">Unified control framework</p>
            </div>
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
              <Grid3X3 className="w-6 h-6 text-sky-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Frameworks Mapped</p>
              <p className="text-3xl font-bold text-gray-900">{frameworksMapped}</p>
              <p className="text-xs text-gray-500 mt-1">{coveragePct}% coverage</p>
            </div>
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-violet-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Requirements Covered</p>
              <p className="text-3xl font-bold text-gray-900">
                {coveredRequirements}
                <span className="text-lg font-normal text-gray-400">/{totalFrameworkRequirements}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">Across all frameworks</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Implementation Rate</p>
              <p className="text-3xl font-bold text-gray-900">{implementationRate}%</p>
              <p className="text-xs text-gray-500 mt-1">
                {implementedControls} of {totalUcfControls} UCF controls
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tab Navigation ──────────────────────────────────────────────── */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-3 px-0.5 border-b-2 font-medium text-sm transition-all flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ─── Tab Content ─────────────────────────────────────────────────── */}
      {activeTab === 'framework' && (
        <FrameworkViewTab
          frameworks={frameworks}
          showToast={showToast}
        />
      )}
      {activeTab === 'ucf' && (
        <UCFLibraryTab
          ucfControls={ucfControls}
          showToast={showToast}
        />
      )}
      {activeTab === 'portfolio' && (
        <PortfolioDashboardTab
          frameworks={frameworks}
          orgId={orgId}
          showToast={showToast}
        />
      )}
      {activeTab === 'import' && (
        <ImportTab
          showToast={showToast}
          onImportComplete={() => {
            fetchFrameworks();
            fetchUcfControls();
          }}
        />
      )}
    </div>
  );
}

// ─── Tab 1: Framework View ───────────────────────────────────────────────────

function FrameworkViewTab({
  frameworks,
  showToast,
}: {
  frameworks: Framework[];
  showToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>('');
  const [requirements, setRequirements] = useState<FrameworkRequirement[]>([]);
  const [loadingReqs, setLoadingReqs] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedRequirement, setExpandedRequirement] = useState<string | null>(null);

  useEffect(() => {
    if (selectedFrameworkId) {
      fetchRequirements(selectedFrameworkId);
    } else {
      setRequirements([]);
    }
  }, [selectedFrameworkId]);

  const fetchRequirements = async (frameworkId: string) => {
    setLoadingReqs(true);
    try {
      const response = await fetch(`/api/frameworks/${frameworkId}/requirements`);
      const result = await response.json();
      if (result.data) {
        // Enrich requirements with UCF mapping data
        const enriched = result.data.map((req: FrameworkRequirement) => {
          // Determine coverage status based on available data
          const mappings = req.ucf_mappings || [];
          let coverage_status: 'covered' | 'partial' | 'gap' = 'gap';
          if (mappings.length > 0) {
            coverage_status = 'covered';
          }
          return {
            ...req,
            coverage_status,
            evidence_count: req.evidence_count || 0,
          };
        });
        setRequirements(enriched);
        // Auto-expand all categories
        const cats = new Set<string>(
          enriched.map((r: FrameworkRequirement) => r.domain?.name || r.category || 'General')
        );
        setExpandedCategories(cats);
      }
    } catch (error) {
      console.error('Failed to fetch requirements:', error);
      showToast('Failed to load framework requirements', 'error');
    } finally {
      setLoadingReqs(false);
    }
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  // Group requirements by category/domain
  const grouped = requirements.reduce((acc, req) => {
    const cat = req.domain?.name || req.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(req);
    return acc;
  }, {} as Record<string, FrameworkRequirement[]>);

  const selectedFramework = frameworks.find((f) => f.id === selectedFrameworkId);

  return (
    <div className="space-y-6">
      {/* Framework Selector */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
            Select Framework
          </label>
          <select
            value={selectedFrameworkId}
            onChange={(e) => setSelectedFrameworkId(e.target.value)}
            className="flex-1 max-w-md px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
          >
            <option value="">Choose a framework...</option>
            {frameworks.map((fw) => (
              <option key={fw.id} value={fw.id}>
                {fw.code} - {fw.name} {fw.version ? `(v${fw.version})` : ''}
              </option>
            ))}
          </select>
          {selectedFramework && (
            <span className="text-xs text-gray-500">
              {selectedFramework.framework_requirements?.[0]?.count || 0} requirements
            </span>
          )}
        </div>
      </div>

      {/* Empty State */}
      {!selectedFrameworkId && (
        <div className="text-center py-20">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a framework</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Choose a compliance framework from the dropdown above to view its requirements,
            UCF control mappings, and coverage status.
          </p>
        </div>
      )}

      {/* Loading */}
      {loadingReqs && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
            <p className="text-gray-600 text-sm">Loading requirements...</p>
          </div>
        </div>
      )}

      {/* Requirements grouped by category */}
      {selectedFrameworkId && !loadingReqs && requirements.length === 0 && (
        <div className="text-center py-20">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No requirements found</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            This framework has no requirements configured yet. Import a framework pack
            or add requirements manually.
          </p>
        </div>
      )}

      {selectedFrameworkId && !loadingReqs && requirements.length > 0 && (
        <div className="space-y-3">
          {Object.entries(grouped).map(([category, reqs]) => (
            <div
              key={category}
              className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {expandedCategories.has(category) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="font-semibold text-gray-900">{category}</span>
                  <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-gray-600 rounded-lg">
                    {reqs.length} requirements
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-emerald-600 font-medium">
                    {reqs.filter((r) => r.coverage_status === 'covered').length} covered
                  </span>
                  <span className="text-xs text-amber-600 font-medium">
                    {reqs.filter((r) => r.coverage_status === 'partial').length} partial
                  </span>
                  <span className="text-xs text-red-500 font-medium">
                    {reqs.filter((r) => r.coverage_status === 'gap').length} gaps
                  </span>
                </div>
              </button>

              {/* Requirements List */}
              {expandedCategories.has(category) && (
                <div className="border-t border-slate-100 divide-y divide-slate-100">
                  {reqs.map((req) => {
                    const status = getStatusIndicator(req.coverage_status);
                    const StatusIcon = status.icon;
                    const isExpanded = expandedRequirement === req.id;

                    return (
                      <div key={req.id} className={isExpanded ? 'bg-sky-50/40' : ''}>
                        {/* Requirement Row */}
                        <div
                          onClick={() =>
                            setExpandedRequirement(isExpanded ? null : req.id)
                          }
                          className="px-6 py-4 cursor-pointer hover:bg-slate-50/60 transition-colors flex items-center gap-4"
                        >
                          <ChevronRight
                            className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />

                          {/* Code + Title */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-sm text-sky-600 font-semibold bg-sky-50 px-2.5 py-0.5 rounded-lg">
                                {req.code}
                              </span>
                              <span className="text-sm text-gray-900 font-medium truncate">
                                {req.name || req.title}
                              </span>
                            </div>
                          </div>

                          {/* UCF Mapping Badges */}
                          <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap max-w-xs">
                            {req.ucf_mappings && req.ucf_mappings.length > 0 ? (
                              req.ucf_mappings.slice(0, 3).map((mapping, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs font-medium px-2 py-0.5 bg-sky-100 text-sky-700 rounded-md border border-sky-200"
                                >
                                  {mapping.ucf_control_code}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400 italic">No mappings</span>
                            )}
                            {req.ucf_mappings && req.ucf_mappings.length > 3 && (
                              <span className="text-xs text-sky-600 font-medium">
                                +{req.ucf_mappings.length - 3}
                              </span>
                            )}
                          </div>

                          {/* Evidence Count */}
                          {(req.evidence_count ?? 0) > 0 && (
                            <span className="text-xs font-medium px-2 py-0.5 bg-violet-50 text-violet-600 rounded-md border border-violet-200 flex-shrink-0">
                              {req.evidence_count} evidence
                            </span>
                          )}

                          {/* Status Indicator */}
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0 ${status.bg}`}>
                            <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                            <span className={status.color}>{status.label}</span>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="px-6 pb-5 pl-14 space-y-4 bg-white/50">
                            {req.description && (
                              <div className="bg-white rounded-xl p-4 border border-slate-200/60">
                                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                                  Description
                                </h4>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {req.description}
                                </p>
                              </div>
                            )}

                            {req.guidance && (
                              <div className="bg-white rounded-xl p-4 border border-slate-200/60">
                                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                                  Implementation Guidance
                                </h4>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {req.guidance}
                                </p>
                              </div>
                            )}

                            {req.evidence_requirements && (
                              <div className="bg-white rounded-xl p-4 border border-slate-200/60">
                                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                                  Evidence Requirements
                                </h4>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {req.evidence_requirements}
                                </p>
                              </div>
                            )}

                            {req.evidence_examples && req.evidence_examples.length > 0 && (
                              <div className="bg-white rounded-xl p-4 border border-slate-200/60">
                                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">
                                  Evidence Types
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {req.evidence_examples.map((example, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 text-sm rounded-lg border border-sky-200 font-medium"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                      {example}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab 2: UCF Library ──────────────────────────────────────────────────────

function UCFLibraryTab({
  ucfControls,
  showToast,
}: {
  ucfControls: UCFControl[];
  showToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = [...new Set(ucfControls.map((c) => c.category).filter(Boolean))] as string[];

  const filtered = ucfControls.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const grouped = filtered.reduce((acc, c) => {
    const cat = c.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(c);
    return acc;
  }, {} as Record<string, UCFControl[]>);

  const getImplementationBadge = (status: string | undefined) => {
    switch (status) {
      case 'implemented':
      case 'active':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'in_progress':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'planned':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'not_implemented':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search UCF controls by code, title, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-20">
          <Library className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {ucfControls.length === 0 ? 'No UCF controls yet' : 'No matching controls'}
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {ucfControls.length === 0
              ? 'Import a framework pack to automatically populate UCF controls, or create them manually.'
              : 'Try adjusting your search or filter to find the controls you are looking for.'}
          </p>
        </div>
      )}

      {/* Grouped Controls */}
      {Object.entries(grouped).map(([category, controls]) => (
        <div key={category}>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Target className="w-4 h-4" />
            {category}
            <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-gray-600 rounded-full">
              {controls.length}
            </span>
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {controls.map((control) => (
              <div
                key={control.id}
                className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 hover:shadow-md hover:border-sky-200 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-sm text-sky-600 font-bold">
                      {control.code}
                    </span>
                    <h4 className="text-base font-semibold text-gray-900 mt-1 line-clamp-2">
                      {control.title}
                    </h4>
                  </div>
                  {control.category && (
                    <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-gray-600 rounded-lg ml-3 flex-shrink-0">
                      {control.category}
                    </span>
                  )}
                </div>

                {/* Description */}
                {control.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {control.description}
                  </p>
                )}

                {/* Framework Impact Badges */}
                {control.frameworks_impacted.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {control.frameworks_impacted.map((fwCode) => (
                      <span
                        key={fwCode}
                        className={`text-xs font-medium px-2 py-0.5 rounded-md border ${getFrameworkColor(fwCode)}`}
                      >
                        {fwCode}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <p className="text-xs text-gray-500">
                    Maps to{' '}
                    <span className="font-semibold text-gray-700">
                      {control.mapped_requirements_count}
                    </span>{' '}
                    requirements across{' '}
                    <span className="font-semibold text-gray-700">
                      {control.frameworks_impacted.length}
                    </span>{' '}
                    frameworks
                  </p>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${getImplementationBadge(
                      control.implementation_status
                    )}`}
                  >
                    {control.implementation_status
                      ? control.implementation_status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
                      : 'Not Assessed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Tab 3: Portfolio Dashboard ──────────────────────────────────────────────

function PortfolioDashboardTab({
  frameworks,
  orgId,
  showToast,
}: {
  frameworks: Framework[];
  orgId: string;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [selectedFrameworkIds, setSelectedFrameworkIds] = useState<Set<string>>(new Set());
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);

  const toggleFramework = (id: string) => {
    setSelectedFrameworkIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const fetchPortfolio = async () => {
    if (selectedFrameworkIds.size === 0) {
      setPortfolioData(null);
      return;
    }

    setLoadingPortfolio(true);
    try {
      const ids = Array.from(selectedFrameworkIds).join(',');
      const response = await fetch(
        `/api/compliance/portfolio?org_id=${orgId}&framework_ids=${ids}`
      );
      const result = await response.json();
      if (result.data) {
        setPortfolioData(result.data);
      } else {
        // Build portfolio data locally from available framework data
        const localData: PortfolioData = {
          frameworks: frameworks
            .filter((f) => selectedFrameworkIds.has(f.id))
            .map((f) => ({
              id: f.id,
              code: f.code,
              name: f.name,
              total_requirements: f.framework_requirements?.[0]?.count || 0,
              covered_requirements: 0,
              coverage_pct: 0,
            })),
          gaps: [],
          overlaps: [],
        };
        setPortfolioData(localData);
      }
    } catch (error) {
      console.error('Failed to fetch portfolio data:', error);
      // Build local fallback
      const localData: PortfolioData = {
        frameworks: frameworks
          .filter((f) => selectedFrameworkIds.has(f.id))
          .map((f) => ({
            id: f.id,
            code: f.code,
            name: f.name,
            total_requirements: f.framework_requirements?.[0]?.count || 0,
            covered_requirements: 0,
            coverage_pct: 0,
          })),
        gaps: [],
        overlaps: [],
      };
      setPortfolioData(localData);
    } finally {
      setLoadingPortfolio(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [selectedFrameworkIds]);

  return (
    <div className="space-y-6">
      {/* Framework Multi-Select */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Select Frameworks to Compare
        </h3>
        <div className="flex flex-wrap gap-3">
          {frameworks.map((fw) => {
            const isSelected = selectedFrameworkIds.has(fw.id);
            return (
              <label
                key={fw.id}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all text-sm font-medium ${
                  isSelected
                    ? 'bg-sky-50 border-sky-300 text-sky-700 shadow-sm'
                    : 'bg-white border-slate-200 text-gray-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleFramework(fw.id)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'bg-sky-500 border-sky-500' : 'border-slate-300'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                {fw.code}
                <span className="text-xs text-gray-400">
                  ({fw.framework_requirements?.[0]?.count || 0})
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {selectedFrameworkIds.size === 0 && (
        <div className="text-center py-20">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Select frameworks to analyze
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Choose two or more compliance frameworks above to see coverage comparison,
            gap analysis, and control overlap insights.
          </p>
        </div>
      )}

      {/* Loading */}
      {loadingPortfolio && (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
        </div>
      )}

      {/* Portfolio Results */}
      {portfolioData && selectedFrameworkIds.size > 0 && !loadingPortfolio && (
        <div className="space-y-6">
          {/* Coverage Bar Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-sky-600" />
              Framework Coverage
            </h3>
            <div className="space-y-5">
              {portfolioData.frameworks.map((fw) => (
                <div key={fw.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{fw.code}</span>
                      <span className="text-xs text-gray-500">{fw.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">
                        {fw.covered_requirements}/{fw.total_requirements}
                      </span>
                      <span className="text-sm font-bold text-gray-900 w-12 text-right">
                        {fw.coverage_pct}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        fw.coverage_pct >= 80
                          ? 'bg-emerald-500'
                          : fw.coverage_pct >= 50
                          ? 'bg-amber-500'
                          : fw.coverage_pct > 0
                          ? 'bg-red-400'
                          : 'bg-slate-200'
                      }`}
                      style={{ width: `${Math.max(fw.coverage_pct, 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gap Analysis */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Gap Analysis
              {portfolioData.gaps.length > 0 && (
                <span className="text-xs font-medium px-2.5 py-1 bg-red-50 text-red-600 rounded-lg">
                  {portfolioData.gaps.length} gaps
                </span>
              )}
            </h3>

            {portfolioData.gaps.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {portfolioData.gaps.map((gap, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 px-4 py-3 bg-red-50/50 rounded-xl border border-red-100"
                  >
                    <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-md border ${getFrameworkColor(
                        gap.framework_code
                      )}`}
                    >
                      {gap.framework_code}
                    </span>
                    <span className="font-mono text-xs text-gray-600">
                      {gap.requirement_code}
                    </span>
                    <span className="text-sm text-gray-700 truncate">
                      {gap.requirement_name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">
                  {portfolioData.frameworks.some((f) => f.total_requirements > 0)
                    ? 'No uncovered requirements found across selected frameworks.'
                    : 'Select frameworks with requirements to see gap analysis.'}
                </p>
              </div>
            )}
          </div>

          {/* Overlap / Bang for Buck */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Control Overlap
              <span className="text-xs text-gray-500 font-normal">
                UCF controls satisfying 2+ frameworks
              </span>
            </h3>

            {portfolioData.overlaps.length > 0 ? (
              <div className="space-y-3">
                {portfolioData.overlaps.map((overlap, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 px-4 py-3 bg-amber-50/50 rounded-xl border border-amber-100"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-sky-600 font-bold">
                          {overlap.ucf_code}
                        </span>
                        <span className="text-sm text-gray-900 font-medium truncate">
                          {overlap.ucf_title}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {overlap.frameworks.map((fwCode) => (
                        <span
                          key={fwCode}
                          className={`text-xs font-medium px-2 py-0.5 rounded-md border ${getFrameworkColor(
                            fwCode
                          )}`}
                        >
                          {fwCode}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2.5 py-1 rounded-lg flex-shrink-0">
                      {overlap.framework_count}x impact
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Layers className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">
                  {selectedFrameworkIds.size >= 2
                    ? 'No overlapping controls found across the selected frameworks.'
                    : 'Select at least two frameworks to see control overlap analysis.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 4: Import ───────────────────────────────────────────────────────────

function ImportTab({
  showToast,
  onImportComplete,
}: {
  showToast: (msg: string, type?: 'success' | 'error') => void;
  onImportComplete: () => void;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<{
    name: string;
    version: string;
    authority: string;
    requirements_count: number;
    ucf_mappings_count: number;
  } | null>(null);
  const [importing, setImporting] = useState(false);
  const [importHistory, setImportHistory] = useState<FrameworkPack[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImportHistory();
  }, []);

  const fetchImportHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch('/api/framework-packs');
      const result = await response.json();
      if (result.data) {
        setImportHistory(result.data);
      }
    } catch (error) {
      // API may not exist yet -- that is fine
      console.error('Failed to fetch import history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.json')) {
      showToast('Please upload a .json file', 'error');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const preview = {
          name: json.framework?.name || json.name || 'Unknown',
          version: json.framework?.version || json.version || '-',
          authority: json.framework?.authority || json.authority || '-',
          requirements_count: json.requirements?.length || json.framework?.requirements?.length || 0,
          ucf_mappings_count: json.ucf_mappings?.length || json.mappings?.length || 0,
        };
        setPreviewData(preview);
      } catch (err) {
        showToast('Invalid JSON file. Please check the file format.', 'error');
        setSelectedFile(null);
        setPreviewData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/framework-packs/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Import failed');
      }

      showToast('Framework pack imported successfully!');
      setSelectedFile(null);
      setPreviewData(null);
      fetchImportHistory();
      onImportComplete();
    } catch (error: any) {
      showToast(error.message || 'Failed to import framework pack', 'error');
    } finally {
      setImporting(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-sky-600" />
          Import Framework Pack
        </h3>

        {/* Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-sky-400 bg-sky-50'
              : selectedFile
              ? 'border-emerald-300 bg-emerald-50/50'
              : 'border-slate-200 hover:border-sky-300 hover:bg-sky-50/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileInput}
            className="hidden"
          />

          {selectedFile ? (
            <div className="space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold text-gray-900">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                className="text-xs text-red-500 hover:text-red-600 font-medium mt-2"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="w-10 h-10 text-slate-400 mx-auto" />
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Drop a framework pack JSON file here
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  or click to browse your files
                </p>
              </div>
              <p className="text-xs text-gray-400">Accepts .json files</p>
            </div>
          )}
        </div>

        {/* Preview */}
        {previewData && (
          <div className="mt-6 space-y-4">
            <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Pack Preview
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs text-gray-500 mb-1">Framework</p>
                <p className="text-sm font-semibold text-gray-900">{previewData.name}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs text-gray-500 mb-1">Version</p>
                <p className="text-sm font-semibold text-gray-900">{previewData.version}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs text-gray-500 mb-1">Authority</p>
                <p className="text-sm font-semibold text-gray-900">{previewData.authority}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs text-gray-500 mb-1">Requirements</p>
                <p className="text-sm font-semibold text-gray-900">
                  {previewData.requirements_count}
                </p>
              </div>
            </div>
            <div className="bg-sky-50 rounded-xl p-4 border border-sky-100">
              <p className="text-xs text-gray-500 mb-1">UCF Mappings</p>
              <p className="text-sm font-semibold text-sky-700">
                {previewData.ucf_mappings_count} control mappings included
              </p>
            </div>

            {/* Import Button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleImport}
                disabled={importing}
                className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-all font-medium text-sm shadow-lg shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Import Framework Pack
                  </>
                )}
              </button>
              <button
                onClick={clearSelection}
                className="px-4 py-3 text-sm font-medium text-gray-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Import History */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-500" />
          Import History
        </h3>

        {loadingHistory ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : importHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                    Version
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                    Requirements
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                    Mappings
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                    Imported
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {importHistory.map((pack) => (
                  <tr key={pack.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {pack.name}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{pack.version}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {pack.requirements_count}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {pack.ucf_mappings_count}
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      {new Date(pack.imported_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                          pack.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : pack.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {pack.status.charAt(0).toUpperCase() + pack.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 text-sm">No framework packs imported yet.</p>
            <p className="text-gray-400 text-xs mt-1">
              Upload a JSON framework pack above to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
