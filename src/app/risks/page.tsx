'use client';

import { useState } from 'react';
import { AlertTriangle, Plus, Filter, TrendingDown, TrendingUp, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Mock data - will be replaced with Supabase queries
const risks = [
  {
    id: '1',
    title: 'Data Breach via Third-Party Vendor',
    description: 'Risk of sensitive customer data exposure through vendor security vulnerabilities',
    category: 'Security',
    inherent_likelihood: 3,
    inherent_impact: 5,
    inherent_risk_score: 15,
    control_effectiveness: 0.6,
    residual_risk_score: 6,
    status: 'open',
    risk_response: 'mitigate',
    owner: 'Security Team'
  },
  {
    id: '2',
    title: 'Compliance Violation Penalty',
    description: 'Risk of regulatory fines due to non-compliance with data protection regulations',
    category: 'Compliance',
    inherent_likelihood: 2,
    inherent_impact: 4,
    inherent_risk_score: 8,
    control_effectiveness: 0.75,
    residual_risk_score: 2,
    status: 'mitigated',
    risk_response: 'mitigate',
    owner: 'Compliance Team'
  },
  {
    id: '3',
    title: 'System Downtime Impact',
    description: 'Risk of extended system outages affecting customer operations',
    category: 'Operational',
    inherent_likelihood: 4,
    inherent_impact: 4,
    inherent_risk_score: 16,
    control_effectiveness: 0.5,
    residual_risk_score: 8,
    status: 'open',
    risk_response: 'mitigate',
    owner: 'Engineering'
  },
  {
    id: '4',
    title: 'Insider Threat',
    description: 'Risk of malicious or accidental data exposure by employees',
    category: 'Security',
    inherent_likelihood: 2,
    inherent_impact: 5,
    inherent_risk_score: 10,
    control_effectiveness: 0.7,
    residual_risk_score: 3,
    status: 'accepted',
    risk_response: 'accept',
    owner: 'HR & Security'
  }
];

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
  closed: { label: 'Closed', color: 'text-zinc-500', bg: 'bg-zinc-50 dark:bg-zinc-900' }
};

function getSeverity(score: number): string {
  if (score >= 20) return 'critical';
  if (score >= 12) return 'high';
  if (score >= 6) return 'medium';
  return 'low';
}

// Risk Heat Map component
function RiskHeatMap() {
  const matrix = Array(5).fill(null).map(() => Array(5).fill(0));

  risks.forEach(risk => {
    const row = 5 - risk.inherent_likelihood;
    const col = risk.inherent_impact - 1;
    if (row >= 0 && row < 5 && col >= 0 && col < 5) {
      matrix[row][col]++;
    }
  });

  const getColor = (likelihood: number, impact: number) => {
    const score = likelihood * impact;
    if (score >= 20) return 'bg-red-500';
    if (score >= 12) return 'bg-orange-500';
    if (score >= 6) return 'bg-amber-400';
    return 'bg-green-400';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Risk Heat Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <div className="w-16 text-xs text-zinc-500">Likelihood</div>
            {[1, 2, 3, 4, 5].map(impact => (
              <div key={impact} className="flex-1 text-center text-xs text-zinc-500">
                {impact}
              </div>
            ))}
          </div>
          {[5, 4, 3, 2, 1].map(likelihood => (
            <div key={likelihood} className="flex items-center gap-1">
              <div className="w-16 text-right text-xs text-zinc-500 pr-2">{likelihood}</div>
              {[1, 2, 3, 4, 5].map(impact => (
                <div
                  key={impact}
                  className={cn(
                    'flex-1 aspect-square rounded flex items-center justify-center text-white text-xs font-bold transition-all hover:scale-105',
                    getColor(likelihood, impact)
                  )}
                >
                  {matrix[5 - likelihood][impact - 1] > 0 ? matrix[5 - likelihood][impact - 1] : ''}
                </div>
              ))}
            </div>
          ))}
          <div className="flex items-center gap-1 mt-2">
            <div className="w-16"></div>
            <div className="flex-1 text-center text-xs text-zinc-500">Impact</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RisksPage() {
  const [filter, setFilter] = useState<string | null>(null);

  const filteredRisks = filter
    ? risks.filter(r => r.status === filter)
    : risks;

  const openRisks = risks.filter(r => r.status === 'open').length;
  const totalInherentScore = risks.reduce((sum, r) => sum + r.inherent_risk_score, 0);
  const totalResidualScore = risks.reduce((sum, r) => sum + r.residual_risk_score, 0);
  const riskReduction = totalInherentScore > 0
    ? Math.round(((totalInherentScore - totalResidualScore) / totalInherentScore) * 100)
    : 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Risk Register
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Identify, assess, and manage organizational risks
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Add Risk
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Open Risks</p>
                <p className="mt-2 text-3xl font-bold text-red-600">{openRisks}</p>
              </div>
              <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Inherent Risk</p>
                <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  {totalInherentScore}
                </p>
              </div>
              <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-900">
                <TrendingUp className="h-6 w-6 text-zinc-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Residual Risk</p>
                <p className="mt-2 text-3xl font-bold text-green-600">{totalResidualScore}</p>
              </div>
              <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
                <TrendingDown className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Risk Reduction</p>
                <p className="mt-2 text-3xl font-bold text-blue-600">{riskReduction}%</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heat Map */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <RiskHeatMap />
        </div>

        {/* Risk List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Risks</CardTitle>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
                    <Filter className="h-4 w-4" />
                    Filter
                  </button>
                </div>
              </div>
              {/* Filter tabs */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => setFilter(null)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium',
                    filter === null
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950'
                      : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
                  )}
                >
                  All ({risks.length})
                </button>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-sm font-medium',
                      filter === key
                        ? config.bg + ' ' + config.color
                        : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
                    )}
                  >
                    {config.label} ({risks.filter(r => r.status === key).length})
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredRisks.map((risk) => {
                  const inherentSeverity = severityConfig[getSeverity(risk.inherent_risk_score)];
                  const residualSeverity = severityConfig[getSeverity(risk.residual_risk_score)];
                  const status = statusConfig[risk.status];

                  return (
                    <div
                      key={risk.id}
                      className="rounded-lg border border-zinc-200 bg-white p-4 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {risk.title}
                            </h3>
                            <span className={cn(
                              'rounded-full px-2 py-0.5 text-xs font-medium',
                              status.bg,
                              status.color
                            )}>
                              {status.label}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                            {risk.description}
                          </p>
                          <div className="mt-3 flex items-center gap-6 text-sm">
                            <div>
                              <span className="text-zinc-500">Category: </span>
                              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                {risk.category}
                              </span>
                            </div>
                            <div>
                              <span className="text-zinc-500">Owner: </span>
                              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                {risk.owner}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-xs text-zinc-500">Inherent</p>
                            <div className={cn(
                              'mt-1 rounded px-2 py-1 text-lg font-bold',
                              inherentSeverity.bg,
                              inherentSeverity.color
                            )}>
                              {risk.inherent_risk_score}
                            </div>
                          </div>
                          <div className="text-zinc-300">→</div>
                          <div className="text-center">
                            <p className="text-xs text-zinc-500">Residual</p>
                            <div className={cn(
                              'mt-1 rounded px-2 py-1 text-lg font-bold',
                              residualSeverity.bg,
                              residualSeverity.color
                            )}>
                              {risk.residual_risk_score}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
