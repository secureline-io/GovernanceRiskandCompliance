'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle, Plus, Download, RefreshCw, ChevronDown, ChevronUp,
  Shield, Link as LinkIcon, TrendingDown, TrendingUp, CheckCircle, AlertCircle, Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import CreateRiskModal, { RiskFormData } from '@/components/modals/CreateRiskModal';
import { exportToCSV } from '@/lib/export';

const DEFAULT_ORG_ID = 'default';

const severityConfig: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: 'Critical', color: 'text-red-700', bg: 'bg-red-100 dark:bg-red-950' },
  high: { label: 'High', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-950' },
  medium: { label: 'Medium', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-950' },
  low: { label: 'Low', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-950' }
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: 'Open', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950' },
  mitigated: { label: 'Mitigated', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950' },
  accepted: { label: 'Accepted', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
  transferred: { label: 'Transferred', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950' },
  closed: { label: 'Closed', color: 'text-zinc-500', bg: 'bg-zinc-50 dark:bg-zinc-900' }
};

function getSeverity(score: number): string {
  if (score >= 20) return 'critical';
  if (score >= 12) return 'high';
  if (score >= 6) return 'medium';
  return 'low';
}

function getRiskScoreBg(severity: string): string {
  const map = {
    critical: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-emerald-100 text-emerald-700'
  };
  return map[severity as keyof typeof map] || 'bg-slate-100 text-slate-700';
}

function getHeatMapCellColor(score: number): string {
  if (score >= 16) return 'bg-red-100 hover:bg-red-150';
  if (score >= 10) return 'bg-orange-100 hover:bg-orange-150';
  if (score >= 5) return 'bg-amber-50 hover:bg-amber-100';
  return 'bg-emerald-50 hover:bg-emerald-100';
}

function RiskHeatMap({ risks }: { risks: any[] }) {
  const matrix = Array(5).fill(null).map(() => Array(5).fill(0));
  risks.forEach(risk => {
    const l = risk.inherent_likelihood || 3;
    const i = risk.inherent_impact || 3;
    const row = 5 - l;
    const col = i - 1;
    if (row >= 0 && row < 5 && col >= 0 && col < 5) matrix[row][col]++;
  });

  const likelihoodLabels = ['Almost Certain', 'Likely', 'Possible', 'Unlikely', 'Rare'];
  const impactLabels = ['Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic'];

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-slate-900" />
        <h3 className="text-lg font-semibold text-slate-900">Risk Heat Map</h3>
      </div>

      <div className="space-y-4">
        <div className="overflow-x-auto">
          <div className="min-w-max">
            <div className="mb-2 flex items-start gap-2">
              <div className="w-32"></div>
              <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Impact</div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-32">
                <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Likelihood</div>
                <div className="space-y-2">
                  {likelihoodLabels.map((label, idx) => (
                    <div key={idx} className="h-12 flex items-center justify-end pr-2 text-xs font-medium text-slate-600">
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((l, rowIdx) => (
                  <div key={l} className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((i) => {
                      const count = matrix[5 - l][i - 1];
                      const score = l * i;
                      return (
                        <div
                          key={i}
                          className={cn(
                            'w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200',
                            getHeatMapCellColor(score),
                            'border border-slate-200 cursor-default'
                          )}
                        >
                          {count > 0 && (
                            <div className="text-center">
                              <div className="text-sm font-bold text-slate-900">{count}</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 ml-32 pl-2">
              {impactLabels.map((label, idx) => (
                <div key={idx} className="w-12 text-center text-xs font-medium text-slate-600">
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4 mt-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-50 border border-emerald-200"></div>
              <span className="text-xs text-slate-600">Low Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-50 border border-amber-200"></div>
              <span className="text-xs text-slate-600">Medium Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-100 border border-orange-200"></div>
              <span className="text-xs text-slate-600">High Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-100 border border-red-200"></div>
              <span className="text-xs text-slate-600">Critical Risk</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RisksPage() {
  const [filter, setFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [risks, setRisks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);
  const [linkedControls, setLinkedControls] = useState<any>(null);
  const [loadingTreatments, setLoadingTreatments] = useState(false);

  const fetchRisks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/risks?org_id=${DEFAULT_ORG_ID}`);
      const json = await res.json();
      const data = json.data || json || [];
      setRisks(Array.isArray(data) ? data : []);
    } catch (err) { setRisks([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRisks(); }, [fetchRisks]);

  const handleRiskRowClick = useCallback(async (riskId: string) => {
    if (selectedRiskId === riskId) {
      setSelectedRiskId(null);
      setLinkedControls(null);
      return;
    }

    setSelectedRiskId(riskId);
    setLoadingTreatments(true);
    try {
      const res = await fetch(`/api/risks/${riskId}/treatments`);
      if (res.ok) {
        const json = await res.json();
        setLinkedControls(json.data || null);
      } else {
        setLinkedControls(null);
      }
    } catch (err) {
      setLinkedControls(null);
    } finally {
      setLoadingTreatments(false);
    }
  }, [selectedRiskId]);

  const handleCreateRisk = async (data: RiskFormData) => {
    const likelihoodScore = { low: 1, medium: 2, high: 3, critical: 4 }[data.likelihood] || 3;
    const impactScore = { low: 1, medium: 2, high: 3, critical: 4 }[data.impact] || 3;

    const res = await fetch('/api/risks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        org_id: DEFAULT_ORG_ID,
        title: data.title,
        description: data.description,
        category: data.category,
        inherent_likelihood: likelihoodScore,
        inherent_impact: impactScore,
        risk_appetite: data.treatment_strategy,
        owner_id: null,
        target_resolution_date: data.due_date || null,
      }),
    });

    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || 'Failed to create risk');
    }

    await fetchRisks();
  };

  const handleExportRisks = () => {
    const exportData = risks.map(risk => ({
      Title: risk.title, Description: risk.description || '',
      Category: risk.category || '', Likelihood: risk.inherent_likelihood,
      Impact: risk.inherent_impact, 'Inherent Score': risk.inherent_risk_score,
      'Residual Score': risk.residual_risk_score || '', Status: risk.status,
    }));
    exportToCSV(exportData, `risks-export-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const criticalCount = risks.filter(r => getSeverity(r.inherent_risk_score || 0) === 'critical').length;
  const highCount = risks.filter(r => getSeverity(r.inherent_risk_score || 0) === 'high').length;
  const mediumLowCount = risks.filter(r => ['medium', 'low'].includes(getSeverity(r.inherent_risk_score || 0))).length;
  const totalInherentScore = risks.reduce((sum, r) => sum + (r.inherent_risk_score || 0), 0);
  const totalResidualScore = risks.reduce((sum, r) => sum + (r.residual_risk_score || 0), 0);
  const riskReduction = totalInherentScore > 0 ? Math.round(((totalInherentScore - totalResidualScore) / totalInherentScore) * 100) : 0;

  const severityFilters = ['All', 'Critical', 'High', 'Medium', 'Low'] as const;
  const filteredRisks = risks.filter(risk => {
    const matchesSeverity = !filter || filter === 'All' || getSeverity(risk.inherent_risk_score || 0) === filter.toLowerCase();
    const matchesSearch = !searchTerm ||
      risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      risk.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (risk.description && risk.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSeverity && matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Risk Register</h1>
          <p className="mt-1 text-sm text-slate-600">Manage organizational risks and treatment plans</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportRisks}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-sky-600 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Risk
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
        {/* Total Risks */}
        <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Risks</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{risks.length}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <AlertTriangle className="h-5 w-5 text-slate-600" />
            </div>
          </div>
        </div>

        {/* Critical */}
        <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">Critical</p>
              <p className="mt-2 text-2xl font-bold text-red-600">{criticalCount}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>

        {/* High */}
        <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">High</p>
              <p className="mt-2 text-2xl font-bold text-orange-600">{highCount}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Medium & Low */}
        <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">Medium/Low</p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">{mediumLowCount}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
              <TrendingDown className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Heat Map */}
      <RiskHeatMap risks={risks} />

      {/* Filter Bar and Risk Table */}
      <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm">
        {/* Filter Section */}
        <div className="border-b border-slate-200/60 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 transition-all hover:border-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {severityFilters.map((severity) => (
              <button
                key={severity}
                onClick={() => setFilter(filter === severity ? null : severity)}
                className={cn(
                  'rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all',
                  (filter === null && severity === 'All') || filter === severity
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {severity}
              </button>
            ))}
          </div>
        </div>

        {/* Risk List */}
        <div className="divide-y divide-slate-200/60 p-6">
          {filteredRisks.length === 0 ? (
            <div className="py-12 text-center">
              <AlertTriangle className="mx-auto h-16 w-16 text-slate-200 mb-4" />
              <p className="text-slate-600 font-medium">
                {risks.length === 0 ? 'No risks identified' : 'No matching risks found'}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {risks.length === 0
                  ? 'Add risks to your register to start tracking and mitigating.'
                  : 'Try adjusting your search or filters.'}
              </p>
              {risks.length === 0 && (
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="mt-4 rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-sky-600 active:scale-95"
                >
                  Add Your First Risk
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-0 -m-6">
              {filteredRisks.map((risk, idx) => {
                const inherentSeverity = getSeverity(risk.inherent_risk_score || 0);
                const residualSeverity = getSeverity(risk.residual_risk_score || 0);
                const status = statusConfig[risk.status] || statusConfig.open;
                const isExpanded = selectedRiskId === risk.id;
                const inherentScore = risk.inherent_risk_score || 0;
                const residualScore = risk.residual_risk_score || 0;
                const riskReductionPercentage = inherentScore > 0 ? Math.round(((inherentScore - residualScore) / inherentScore) * 100) : 0;
                const hasControls = linkedControls && Array.isArray(linkedControls) && linkedControls.length > 0;

                return (
                  <div key={risk.id}>
                    <button
                      onClick={() => handleRiskRowClick(risk.id)}
                      className="w-full text-left px-6 py-4 hover:bg-slate-50 transition-colors border-b border-slate-200/60 last:border-b-0 flex items-start justify-between gap-4 group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">{risk.title}</h3>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap', status.bg, status.color)}>
                              {status.label}
                            </span>
                            {riskReductionPercentage > 0 && (
                              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 whitespace-nowrap">
                                <TrendingDown className="h-3 w-3" />
                                {riskReductionPercentage}%
                              </span>
                            )}
                          </div>
                        </div>

                        {risk.description && (
                          <p className="text-sm text-slate-600 mb-3 line-clamp-1">{risk.description}</p>
                        )}

                        <div className="flex items-center flex-wrap gap-4 text-sm">
                          {risk.category && (
                            <div className="flex items-center gap-1">
                              <span className="text-slate-500">Category:</span>
                              <span className="font-medium text-slate-900">{risk.category}</span>
                            </div>
                          )}
                          {risk.risk_response && (
                            <div className="flex items-center gap-1">
                              <span className="text-slate-500">Response:</span>
                              <span className="font-medium text-slate-900 capitalize">{risk.risk_response}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-slate-500 font-medium mb-1">Inherent</p>
                          <div className={cn('px-3 py-1.5 rounded-lg font-bold text-sm', getRiskScoreBg(inherentSeverity))}>
                            {risk.inherent_risk_score || 0}
                          </div>
                        </div>

                        <div className="text-slate-300">
                          <TrendingDown className="h-4 w-4" />
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-slate-500 font-medium mb-1">Residual</p>
                          <div className={cn('px-3 py-1.5 rounded-lg font-bold text-sm', getRiskScoreBg(residualSeverity))}>
                            {risk.residual_risk_score || 0}
                          </div>
                        </div>

                        <div className="text-slate-400">
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="bg-blue-50/40 border-b border-slate-200/60 px-6 py-4">
                        <div className="space-y-6">
                          {/* Linked Controls Section */}
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <LinkIcon className="h-4 w-4 text-slate-600" />
                              <h4 className="font-semibold text-slate-900">Linked Controls</h4>
                            </div>

                            {loadingTreatments ? (
                              <div className="flex items-center justify-center py-4">
                                <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
                              </div>
                            ) : hasControls ? (
                              <div className="space-y-3">
                                {linkedControls.map((treatment: any, idx: number) => (
                                  <div key={idx} className="rounded-lg border border-slate-200 bg-white p-4">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1">
                                        {treatment.control_name && (
                                          <p className="font-semibold text-slate-900">{treatment.control_name}</p>
                                        )}
                                        {treatment.treatment_strategy && (
                                          <div className="mt-2">
                                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Strategy</p>
                                            <p className="mt-1 text-sm text-slate-700">{treatment.treatment_strategy}</p>
                                          </div>
                                        )}
                                        {treatment.description && (
                                          <p className="mt-2 text-sm text-slate-600">{treatment.description}</p>
                                        )}
                                      </div>
                                      {treatment.residual_risk_score !== undefined && treatment.inherent_risk_score !== undefined && (
                                        <div className="text-right flex-shrink-0">
                                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Effectiveness</p>
                                          <div className={cn(
                                            'rounded-lg px-3 py-1.5 text-sm font-medium flex items-center gap-2 whitespace-nowrap',
                                            treatment.residual_risk_score < treatment.inherent_risk_score
                                              ? 'bg-emerald-100 text-emerald-700'
                                              : 'bg-amber-100 text-amber-700'
                                          )}>
                                            {treatment.residual_risk_score < treatment.inherent_risk_score ? (
                                              <>
                                                <CheckCircle className="h-4 w-4" />
                                                Effective
                                              </>
                                            ) : (
                                              <>
                                                <AlertCircle className="h-4 w-4" />
                                                Pending
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
                                <p className="text-sm text-slate-600">
                                  No controls linked to this risk.
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Risk Summary */}
                          <div className="border-t border-slate-200 pt-4">
                            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Risk Summary</p>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="rounded-lg border border-slate-200 bg-white p-3">
                                <p className="text-xs text-slate-500 font-medium mb-2">Inherent Risk Score</p>
                                <p className="text-xl font-bold text-slate-900">{inherentScore}</p>
                              </div>
                              <div className="rounded-lg border border-slate-200 bg-white p-3">
                                <p className="text-xs text-slate-500 font-medium mb-2">Residual Risk Score</p>
                                <p className="text-xl font-bold text-slate-900">{residualScore}</p>
                              </div>
                              <div className={cn(
                                'rounded-lg border p-3',
                                riskReductionPercentage > 0
                                  ? 'border-emerald-200 bg-emerald-50'
                                  : 'border-slate-200 bg-white'
                              )}>
                                <p className={cn('text-xs font-medium mb-2', riskReductionPercentage > 0 ? 'text-emerald-700' : 'text-slate-500')}>
                                  Risk Reduction
                                </p>
                                <p className={cn('text-xl font-bold', riskReductionPercentage > 0 ? 'text-emerald-700' : 'text-slate-900')}>
                                  {riskReductionPercentage}%
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <CreateRiskModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} onSubmit={handleCreateRisk} />
    </div>
  );
}
