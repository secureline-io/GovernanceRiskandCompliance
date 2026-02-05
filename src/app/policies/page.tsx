'use client';

import { useState } from 'react';
import { FileCheck, Plus, Filter, CheckCircle2, Clock, AlertCircle, Eye, Edit, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Mock data
const policies = [
  {
    id: '1',
    title: 'Information Security Policy',
    policy_type: 'security',
    status: 'active',
    version: 3,
    review_date: '2026-06-15',
    published_at: '2025-12-01',
    acknowledgement_stats: { total: 45, acknowledged: 42, pending: 2, overdue: 1 }
  },
  {
    id: '2',
    title: 'Acceptable Use Policy',
    policy_type: 'acceptable_use',
    status: 'active',
    version: 2,
    review_date: '2026-04-20',
    published_at: '2025-10-15',
    acknowledgement_stats: { total: 45, acknowledged: 45, pending: 0, overdue: 0 }
  },
  {
    id: '3',
    title: 'Data Retention Policy',
    policy_type: 'data_retention',
    status: 'active',
    version: 1,
    review_date: '2026-08-01',
    published_at: '2025-11-20',
    acknowledgement_stats: { total: 45, acknowledged: 40, pending: 5, overdue: 0 }
  },
  {
    id: '4',
    title: 'Incident Response Plan',
    policy_type: 'incident_response',
    status: 'draft',
    version: 1,
    review_date: null,
    published_at: null,
    acknowledgement_stats: { total: 0, acknowledged: 0, pending: 0, overdue: 0 }
  },
  {
    id: '5',
    title: 'Password Policy (Deprecated)',
    policy_type: 'security',
    status: 'archived',
    version: 4,
    review_date: '2025-01-15',
    published_at: '2024-06-01',
    acknowledgement_stats: { total: 40, acknowledged: 40, pending: 0, overdue: 0 }
  }
];

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  active: { label: 'Active', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950', icon: CheckCircle2 },
  draft: { label: 'Draft', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950', icon: Edit },
  archived: { label: 'Archived', color: 'text-zinc-500', bg: 'bg-zinc-100 dark:bg-zinc-900', icon: AlertCircle }
};

const typeConfig: Record<string, { label: string; color: string }> = {
  security: { label: 'Security', color: 'text-blue-600' },
  acceptable_use: { label: 'Acceptable Use', color: 'text-purple-600' },
  data_retention: { label: 'Data Retention', color: 'text-green-600' },
  incident_response: { label: 'Incident Response', color: 'text-red-600' },
  access_control: { label: 'Access Control', color: 'text-amber-600' }
};

export default function PoliciesPage() {
  const [filter, setFilter] = useState<string | null>(null);

  const filteredPolicies = filter
    ? policies.filter(p => p.status === filter)
    : policies;

  const activePolicies = policies.filter(p => p.status === 'active').length;
  const totalAcknowledgements = policies.reduce((sum, p) => sum + p.acknowledgement_stats.total, 0);
  const completedAcknowledgements = policies.reduce((sum, p) => sum + p.acknowledgement_stats.acknowledged, 0);
  const overdueAcknowledgements = policies.reduce((sum, p) => sum + p.acknowledgement_stats.overdue, 0);
  const completionRate = totalAcknowledgements > 0
    ? Math.round((completedAcknowledgements / totalAcknowledgements) * 100)
    : 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Policy Management
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Create, distribute, and track policy acknowledgements
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Create Policy
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Active Policies</p>
                <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  {activePolicies}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                <FileCheck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Acknowledgement Rate</p>
                <p className="mt-2 text-3xl font-bold text-green-600">{completionRate}%</p>
              </div>
              <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Pending</p>
                <p className="mt-2 text-3xl font-bold text-amber-600">
                  {policies.reduce((sum, p) => sum + p.acknowledgement_stats.pending, 0)}
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Overdue</p>
                <p className="mt-2 text-3xl font-bold text-red-600">{overdueAcknowledgements}</p>
              </div>
              <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
          <Filter className="h-4 w-4" />
          Filter
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter(null)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium',
              filter === null
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950'
                : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
            )}
          >
            All ({policies.length})
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
              {config.label} ({policies.filter(p => p.status === key).length})
            </button>
          ))}
        </div>
      </div>

      {/* Policies List */}
      <Card>
        <CardHeader>
          <CardTitle>Policies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredPolicies.map((policy) => {
              const status = statusConfig[policy.status];
              const type = typeConfig[policy.policy_type] || { label: policy.policy_type, color: 'text-zinc-600' };
              const StatusIcon = status.icon;
              const ackRate = policy.acknowledgement_stats.total > 0
                ? Math.round((policy.acknowledgement_stats.acknowledged / policy.acknowledgement_stats.total) * 100)
                : 0;

              return (
                <div
                  key={policy.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'rounded-lg p-2',
                      status.bg
                    )}>
                      <StatusIcon className={cn('h-5 w-5', status.color)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {policy.title}
                        </h3>
                        <span className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          status.bg,
                          status.color
                        )}>
                          {status.label}
                        </span>
                        <span className="text-xs text-zinc-500">v{policy.version}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-zinc-500">
                        <span className={type.color}>{type.label}</span>
                        {policy.published_at && (
                          <span>
                            Published: {new Date(policy.published_at).toLocaleDateString()}
                          </span>
                        )}
                        {policy.review_date && (
                          <span>
                            Review: {new Date(policy.review_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {policy.status === 'active' && (
                      <div className="text-center">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-32 rounded-full bg-zinc-100 dark:bg-zinc-800">
                            <div
                              className={cn(
                                'h-2 rounded-full',
                                ackRate === 100 ? 'bg-green-500' :
                                ackRate >= 80 ? 'bg-amber-500' : 'bg-red-500'
                              )}
                              style={{ width: `${ackRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {ackRate}%
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-500">
                          {policy.acknowledgement_stats.acknowledged}/{policy.acknowledgement_stats.total} acknowledged
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      {policy.status === 'draft' && (
                        <button className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
                          <Send className="h-3 w-3" />
                          Publish
                        </button>
                      )}
                    </div>
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
