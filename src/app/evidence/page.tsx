'use client';

import { useState } from 'react';
import { FileText, Plus, Filter, Upload, Download, Search, Clock, CheckCircle2, Cloud, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Mock data
const evidenceItems = [
  {
    id: '1',
    title: 'AWS CloudTrail Logs - January 2026',
    description: 'Audit logs from AWS CloudTrail for privileged access monitoring',
    source: 'aws',
    collected_at: '2026-02-01T10:30:00Z',
    file_type: 'json',
    hash: 'a1b2c3d4e5f6...',
    controls: ['AC-001', 'AC-002', 'MON-003']
  },
  {
    id: '2',
    title: 'Access Review - Q4 2025',
    description: 'Quarterly access review documentation for all systems',
    source: 'manual',
    collected_at: '2026-01-15T14:20:00Z',
    file_type: 'pdf',
    hash: 'b2c3d4e5f6a1...',
    controls: ['AC-003', 'AC-004']
  },
  {
    id: '3',
    title: 'Vulnerability Scan Report',
    description: 'Monthly vulnerability assessment results from security scanning',
    source: 'integration',
    collected_at: '2026-01-28T09:00:00Z',
    file_type: 'pdf',
    hash: 'c3d4e5f6a1b2...',
    controls: ['VM-001', 'VM-002', 'SEC-005']
  },
  {
    id: '4',
    title: 'GitHub Repository Settings',
    description: 'Branch protection and security settings configuration',
    source: 'integration',
    collected_at: '2026-02-02T16:45:00Z',
    file_type: 'json',
    hash: 'd4e5f6a1b2c3...',
    controls: ['CM-001', 'CM-002']
  },
  {
    id: '5',
    title: 'Security Awareness Training Completion',
    description: 'Employee training completion records for security awareness',
    source: 'manual',
    collected_at: '2026-01-20T11:00:00Z',
    file_type: 'xlsx',
    hash: 'e5f6a1b2c3d4...',
    controls: ['HR-001', 'SEC-010']
  },
  {
    id: '6',
    title: 'Azure AD MFA Configuration',
    description: 'Multi-factor authentication settings and enforcement status',
    source: 'azure',
    collected_at: '2026-02-03T08:15:00Z',
    file_type: 'json',
    hash: 'f6a1b2c3d4e5...',
    controls: ['AC-005', 'AC-006']
  }
];

const sourceConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Cloud }> = {
  aws: { label: 'AWS', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950', icon: Cloud },
  azure: { label: 'Azure', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950', icon: Cloud },
  gcp: { label: 'GCP', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950', icon: Cloud },
  manual: { label: 'Manual', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950', icon: User },
  integration: { label: 'Integration', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950', icon: CheckCircle2 },
  cspm_scan: { label: 'CSPM Scan', color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-950', icon: Cloud }
};

const fileTypeConfig: Record<string, { color: string }> = {
  json: { color: 'text-amber-600' },
  pdf: { color: 'text-red-600' },
  xlsx: { color: 'text-green-600' },
  csv: { color: 'text-blue-600' },
  png: { color: 'text-purple-600' },
  jpg: { color: 'text-pink-600' }
};

export default function EvidencePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);

  const filteredEvidence = evidenceItems.filter(item => {
    const matchesSearch = searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.controls.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSource = sourceFilter === null || item.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  const totalEvidence = evidenceItems.length;
  const automatedEvidence = evidenceItems.filter(e => e.source !== 'manual').length;
  const recentEvidence = evidenceItems.filter(e => {
    const collected = new Date(e.collected_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return collected > weekAgo;
  }).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Evidence Vault
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Immutable evidence collection for compliance and audits
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Upload className="h-4 w-4" />
          Upload Evidence
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Evidence</p>
                <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  {totalEvidence}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Automated</p>
                <p className="mt-2 text-3xl font-bold text-green-600">{automatedEvidence}</p>
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
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Manual</p>
                <p className="mt-2 text-3xl font-bold text-purple-600">
                  {totalEvidence - automatedEvidence}
                </p>
              </div>
              <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-950">
                <User className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Last 7 Days</p>
                <p className="mt-2 text-3xl font-bold text-amber-600">{recentEvidence}</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search evidence by title, description, or control..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Source Filter Pills */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSourceFilter(null)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium',
            sourceFilter === null
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950'
              : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
          )}
        >
          All Sources
        </button>
        {Object.entries(sourceConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setSourceFilter(key)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium',
              sourceFilter === key
                ? config.bg + ' ' + config.color
                : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
            )}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Evidence List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Evidence Items</CardTitle>
            <span className="text-sm text-zinc-500">
              {filteredEvidence.length} items
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredEvidence.map((item) => {
              const source = sourceConfig[item.source] || sourceConfig.manual;
              const SourceIcon = source.icon;
              const fileType = fileTypeConfig[item.file_type] || { color: 'text-zinc-600' };

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn('rounded-lg p-2', source.bg)}>
                      <SourceIcon className={cn('h-5 w-5', source.color)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {item.title}
                        </h3>
                        <span className={cn(
                          'rounded px-1.5 py-0.5 text-xs font-mono uppercase',
                          fileType.color,
                          'bg-zinc-100 dark:bg-zinc-800'
                        )}>
                          {item.file_type}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {item.description}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-xs">
                        <span className={cn('font-medium', source.color)}>
                          {source.label}
                        </span>
                        <span className="text-zinc-500">
                          {new Date(item.collected_at).toLocaleString()}
                        </span>
                        <span className="font-mono text-zinc-400">
                          SHA256: {item.hash}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-wrap gap-1 max-w-48">
                      {item.controls.map((control, i) => (
                        <span
                          key={i}
                          className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-950"
                        >
                          {control}
                        </span>
                      ))}
                    </div>
                    <button className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900">
                      <Download className="h-4 w-4" />
                    </button>
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
