'use client';

import { useState } from 'react';
import { Cloud, Plus, RefreshCw, AlertTriangle, CheckCircle2, XCircle, Shield, Server, Database, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Mock data
const cloudAccounts = [
  {
    id: '1',
    provider: 'aws',
    account_id: '123456789012',
    account_name: 'Production',
    status: 'connected',
    last_scan_at: '2026-02-05T10:00:00Z',
    findings: { critical: 2, high: 5, medium: 12, low: 8 }
  },
  {
    id: '2',
    provider: 'aws',
    account_id: '234567890123',
    account_name: 'Development',
    status: 'connected',
    last_scan_at: '2026-02-05T09:30:00Z',
    findings: { critical: 0, high: 2, medium: 8, low: 15 }
  },
  {
    id: '3',
    provider: 'azure',
    account_id: 'sub-abc-123',
    account_name: 'Azure Production',
    status: 'connected',
    last_scan_at: '2026-02-05T08:45:00Z',
    findings: { critical: 1, high: 3, medium: 6, low: 4 }
  },
  {
    id: '4',
    provider: 'gcp',
    account_id: 'project-xyz-456',
    account_name: 'GCP Analytics',
    status: 'error',
    last_scan_at: '2026-02-03T14:00:00Z',
    findings: { critical: 0, high: 0, medium: 0, low: 0 }
  }
];

const findings = [
  {
    id: '1',
    title: 'S3 Bucket Public Access Enabled',
    severity: 'critical',
    status: 'open',
    resource_type: 'S3 Bucket',
    resource_id: 'arn:aws:s3:::company-data-bucket',
    policy_code: 'AWS-S3-001',
    first_detected_at: '2026-02-04T15:30:00Z'
  },
  {
    id: '2',
    title: 'EC2 Instance without IMDSv2',
    severity: 'high',
    status: 'open',
    resource_type: 'EC2 Instance',
    resource_id: 'i-0abc123def456',
    policy_code: 'AWS-EC2-003',
    first_detected_at: '2026-02-03T10:00:00Z'
  },
  {
    id: '3',
    title: 'RDS Instance Publicly Accessible',
    severity: 'critical',
    status: 'in_progress',
    resource_type: 'RDS Instance',
    resource_id: 'arn:aws:rds:us-east-1:123456789012:db:prod-db',
    policy_code: 'AWS-RDS-002',
    first_detected_at: '2026-02-01T08:00:00Z'
  },
  {
    id: '4',
    title: 'Security Group Allows 0.0.0.0/0 Ingress',
    severity: 'high',
    status: 'open',
    resource_type: 'Security Group',
    resource_id: 'sg-0123456789abcdef0',
    policy_code: 'AWS-VPC-001',
    first_detected_at: '2026-02-02T12:00:00Z'
  },
  {
    id: '5',
    title: 'CloudTrail Logging Disabled',
    severity: 'high',
    status: 'resolved',
    resource_type: 'CloudTrail',
    resource_id: 'arn:aws:cloudtrail:us-east-1:123456789012:trail/main',
    policy_code: 'AWS-CT-001',
    first_detected_at: '2026-01-28T09:00:00Z'
  }
];

const providerConfig: Record<string, { label: string; color: string; bg: string; logo: string }> = {
  aws: { label: 'AWS', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950', logo: 'AWS' },
  azure: { label: 'Azure', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950', logo: 'Azure' },
  gcp: { label: 'GCP', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950', logo: 'GCP' }
};

const severityConfig: Record<string, { label: string; color: string; bg: string; icon: typeof AlertTriangle }> = {
  critical: { label: 'Critical', color: 'text-red-700', bg: 'bg-red-100 dark:bg-red-950', icon: XCircle },
  high: { label: 'High', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-950', icon: AlertTriangle },
  medium: { label: 'Medium', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-950', icon: AlertTriangle },
  low: { label: 'Low', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-950', icon: CheckCircle2 }
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: 'Open', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950' },
  in_progress: { label: 'In Progress', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950' },
  resolved: { label: 'Resolved', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950' },
  suppressed: { label: 'Suppressed', color: 'text-zinc-500', bg: 'bg-zinc-100 dark:bg-zinc-900' }
};

const resourceTypeIcons: Record<string, typeof Server> = {
  'S3 Bucket': Database,
  'EC2 Instance': Server,
  'RDS Instance': Database,
  'Security Group': Shield,
  'CloudTrail': Globe
};

export default function CSPMPage() {
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);

  const filteredFindings = severityFilter
    ? findings.filter(f => f.severity === severityFilter)
    : findings;

  const totalFindings = findings.filter(f => f.status !== 'resolved').length;
  const criticalFindings = findings.filter(f => f.severity === 'critical' && f.status === 'open').length;
  const connectedAccounts = cloudAccounts.filter(a => a.status === 'connected').length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Cloud Security Posture
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Monitor and remediate security misconfigurations across your cloud infrastructure
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
            <RefreshCw className="h-4 w-4" />
            Scan Now
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Connect Account
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Cloud Accounts</p>
                <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  {connectedAccounts}/{cloudAccounts.length}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                <Cloud className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Open Findings</p>
                <p className="mt-2 text-3xl font-bold text-amber-600">{totalFindings}</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Critical</p>
                <p className="mt-2 text-3xl font-bold text-red-600">{criticalFindings}</p>
              </div>
              <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Resolved Today</p>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {findings.filter(f => f.status === 'resolved').length}
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cloud Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Cloud Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cloudAccounts.map((account) => {
              const provider = providerConfig[account.provider];
              const totalIssues = Object.values(account.findings).reduce((a, b) => a + b, 0);

              return (
                <div
                  key={account.id}
                  className={cn(
                    'rounded-lg border p-4 transition-all hover:shadow-md',
                    account.status === 'connected'
                      ? 'border-zinc-200 dark:border-zinc-800'
                      : 'border-red-200 dark:border-red-900'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className={cn(
                      'rounded px-2 py-1 text-xs font-bold',
                      provider.bg,
                      provider.color
                    )}>
                      {provider.logo}
                    </div>
                    <span className={cn(
                      'h-2 w-2 rounded-full',
                      account.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                    )} />
                  </div>
                  <h3 className="mt-3 font-semibold text-zinc-900 dark:text-zinc-100">
                    {account.account_name}
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono">{account.account_id}</p>

                  {account.status === 'connected' && (
                    <div className="mt-3 flex items-center gap-2">
                      {account.findings.critical > 0 && (
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950">
                          {account.findings.critical} Critical
                        </span>
                      )}
                      {account.findings.high > 0 && (
                        <span className="rounded bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-600 dark:bg-orange-950">
                          {account.findings.high} High
                        </span>
                      )}
                      {totalIssues === 0 && (
                        <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-600 dark:bg-green-950">
                          No Issues
                        </span>
                      )}
                    </div>
                  )}

                  <p className="mt-2 text-xs text-zinc-500">
                    Last scan: {account.status === 'connected'
                      ? new Date(account.last_scan_at).toLocaleString()
                      : 'Error connecting'}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Findings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Security Findings</CardTitle>
            <div className="flex items-center gap-2">
              {Object.entries(severityConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSeverityFilter(severityFilter === key ? null : key)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium',
                    severityFilter === key
                      ? config.bg + ' ' + config.color
                      : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
                  )}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredFindings.map((finding) => {
              const severity = severityConfig[finding.severity];
              const status = statusConfig[finding.status];
              const SeverityIcon = severity.icon;
              const ResourceIcon = resourceTypeIcons[finding.resource_type] || Server;

              return (
                <div
                  key={finding.id}
                  className={cn(
                    'flex items-start gap-4 rounded-lg border-l-4 border border-zinc-200 p-4 transition-all hover:shadow-md dark:border-zinc-800',
                    finding.severity === 'critical' ? 'border-l-red-500' :
                    finding.severity === 'high' ? 'border-l-orange-500' :
                    finding.severity === 'medium' ? 'border-l-amber-500' : 'border-l-green-500'
                  )}
                >
                  <div className={cn('rounded-lg p-2', severity.bg)}>
                    <SeverityIcon className={cn('h-5 w-5', severity.color)} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {finding.title}
                      </h3>
                      <span className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        status.bg,
                        status.color
                      )}>
                        {status.label}
                      </span>
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-mono text-zinc-600 dark:bg-zinc-800">
                        {finding.policy_code}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-zinc-500">
                        <ResourceIcon className="h-4 w-4" />
                        <span>{finding.resource_type}</span>
                      </div>
                      <span className="font-mono text-xs text-zinc-400">
                        {finding.resource_id}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-zinc-500">
                      First detected: {new Date(finding.first_detected_at).toLocaleString()}
                    </p>
                  </div>

                  <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
                    Remediate
                  </button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
