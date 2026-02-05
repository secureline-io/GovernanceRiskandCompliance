'use client';

import { useState } from 'react';
import { Users, Plus, Filter, AlertTriangle, CheckCircle2, Clock, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Mock data
const vendors = [
  {
    id: '1',
    name: 'AWS',
    industry: 'Cloud Infrastructure',
    risk_level: 'low',
    status: 'active',
    last_assessed_at: '2026-01-15',
    contact_email: 'enterprise@aws.com',
    data_shared: ['Infrastructure', 'Compute'],
    score: 95
  },
  {
    id: '2',
    name: 'Stripe',
    industry: 'Payment Processing',
    risk_level: 'medium',
    status: 'active',
    last_assessed_at: '2025-11-20',
    contact_email: 'security@stripe.com',
    data_shared: ['Payment Data', 'Customer PII'],
    score: 82
  },
  {
    id: '3',
    name: 'Salesforce',
    industry: 'CRM',
    risk_level: 'medium',
    status: 'active',
    last_assessed_at: '2025-10-05',
    contact_email: 'trust@salesforce.com',
    data_shared: ['Customer Data', 'Contact Information'],
    score: 78
  },
  {
    id: '4',
    name: 'New SaaS Vendor',
    industry: 'Marketing',
    risk_level: 'high',
    status: 'pending_review',
    last_assessed_at: null,
    contact_email: 'security@newvendor.com',
    data_shared: ['Marketing Data'],
    score: null
  },
  {
    id: '5',
    name: 'Datadog',
    industry: 'Monitoring',
    risk_level: 'low',
    status: 'active',
    last_assessed_at: '2026-01-10',
    contact_email: 'security@datadoghq.com',
    data_shared: ['Logs', 'Metrics'],
    score: 91
  }
];

const riskConfig: Record<string, { label: string; color: string; bg: string; icon: typeof AlertTriangle }> = {
  critical: { label: 'Critical', color: 'text-red-700', bg: 'bg-red-100 dark:bg-red-950', icon: AlertTriangle },
  high: { label: 'High', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-950', icon: AlertTriangle },
  medium: { label: 'Medium', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-950', icon: Clock },
  low: { label: 'Low', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-950', icon: CheckCircle2 }
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950' },
  inactive: { label: 'Inactive', color: 'text-zinc-500', bg: 'bg-zinc-50 dark:bg-zinc-900' },
  pending_review: { label: 'Pending Review', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950' }
};

export default function VendorsPage() {
  const [filter, setFilter] = useState<string | null>(null);

  const filteredVendors = filter
    ? vendors.filter(v => v.risk_level === filter)
    : vendors;

  const activeVendors = vendors.filter(v => v.status === 'active').length;
  const highRiskVendors = vendors.filter(v => v.risk_level === 'high' || v.risk_level === 'critical').length;
  const pendingAssessments = vendors.filter(v => !v.last_assessed_at).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Vendor Management
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Assess and monitor third-party vendor security posture
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Add Vendor
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Vendors</p>
                <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  {vendors.length}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Active</p>
                <p className="mt-2 text-3xl font-bold text-green-600">{activeVendors}</p>
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
                <p className="text-sm text-zinc-500 dark:text-zinc-400">High Risk</p>
                <p className="mt-2 text-3xl font-bold text-red-600">{highRiskVendors}</p>
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
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Not Assessed</p>
                <p className="mt-2 text-3xl font-bold text-amber-600">{pendingAssessments}</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950">
                <Clock className="h-6 w-6 text-amber-600" />
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
            All ({vendors.length})
          </button>
          {Object.entries(riskConfig).map(([key, config]) => (
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
              {config.label} ({vendors.filter(v => v.risk_level === key).length})
            </button>
          ))}
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredVendors.map((vendor) => {
          const risk = riskConfig[vendor.risk_level];
          const status = statusConfig[vendor.status];
          const RiskIcon = risk.icon;

          return (
            <Card key={vendor.id} className="transition-all hover:shadow-lg cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 text-xl font-bold text-zinc-600 dark:bg-zinc-800">
                      {vendor.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {vendor.name}
                      </h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {vendor.industry}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                    risk.bg,
                    risk.color
                  )}>
                    <RiskIcon className="h-3 w-3" />
                    {risk.label}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Status</span>
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      status.bg,
                      status.color
                    )}>
                      {status.label}
                    </span>
                  </div>

                  {vendor.score !== null && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500">Security Score</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-zinc-100 dark:bg-zinc-800">
                          <div
                            className={cn(
                              'h-2 rounded-full',
                              vendor.score >= 80 ? 'bg-green-500' :
                              vendor.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                            )}
                            style={{ width: `${vendor.score}%` }}
                          />
                        </div>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {vendor.score}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Last Assessed</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {vendor.last_assessed_at
                        ? new Date(vendor.last_assessed_at).toLocaleDateString()
                        : 'Never'}
                    </span>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-zinc-500 mb-2">Data Shared:</p>
                    <div className="flex flex-wrap gap-1">
                      {vendor.data_shared.map((data, i) => (
                        <span
                          key={i}
                          className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        >
                          {data}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
                    View Details
                  </button>
                  <button className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
                    Start Assessment
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
