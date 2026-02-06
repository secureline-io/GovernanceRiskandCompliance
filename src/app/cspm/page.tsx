'use client';

import { useState } from 'react';
import {
  Cloud,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Shield,
  Server,
  Database,
  Globe,
  ChevronDown,
  Search,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Type definitions
interface CloudAccount {
  id: string;
  provider: 'aws' | 'azure' | 'gcp';
  account_id: string;
  account_name: string;
  status: 'connected' | 'disconnected' | 'error';
  last_scan_at: string;
  findings: { critical: number; high: number; medium: number; low: number };
  compliance_score?: number;
  region?: string;
}

interface Finding {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved' | 'suppressed' | 'accepted';
  resource_type: string;
  resource_id: string;
  policy_code: string;
  first_detected_at: string;
  service?: string;
  region?: string;
  remediation?: string;
}

interface ComplianceService {
  name: string;
  passed: number;
  total: number;
  score: number;
}

// Mock data
const cloudAccounts: CloudAccount[] = [
  {
    id: '1',
    provider: 'aws',
    account_id: '123456789012',
    account_name: 'Production',
    status: 'connected',
    last_scan_at: '2026-02-05T10:00:00Z',
    findings: { critical: 2, high: 5, medium: 12, low: 8 },
    compliance_score: 87,
    region: 'us-east-1',
  },
  {
    id: '2',
    provider: 'aws',
    account_id: '234567890123',
    account_name: 'Development',
    status: 'connected',
    last_scan_at: '2026-02-05T09:30:00Z',
    findings: { critical: 0, high: 2, medium: 8, low: 15 },
    compliance_score: 92,
    region: 'us-west-2',
  },
  {
    id: '3',
    provider: 'azure',
    account_id: 'sub-abc-123',
    account_name: 'Azure Production',
    status: 'connected',
    last_scan_at: '2026-02-05T08:45:00Z',
    findings: { critical: 1, high: 3, medium: 6, low: 4 },
    compliance_score: 84,
    region: 'eastus',
  },
  {
    id: '4',
    provider: 'gcp',
    account_id: 'project-xyz-456',
    account_name: 'GCP Analytics',
    status: 'error',
    last_scan_at: '2026-02-03T14:00:00Z',
    findings: { critical: 0, high: 0, medium: 0, low: 0 },
    compliance_score: 0,
    region: 'us-central1',
  },
];

const findings: Finding[] = [
  {
    id: '1',
    title: 'S3 Bucket Public Access Enabled',
    severity: 'critical',
    status: 'open',
    resource_type: 'S3 Bucket',
    resource_id: 'arn:aws:s3:::company-data-bucket',
    policy_code: 'AWS-S3-001',
    first_detected_at: '2026-02-04T15:30:00Z',
    service: 'S3',
    region: 'us-east-1',
    remediation: 'Block all public access in S3 bucket settings',
  },
  {
    id: '2',
    title: 'EC2 Instance without IMDSv2',
    severity: 'high',
    status: 'open',
    resource_type: 'EC2 Instance',
    resource_id: 'i-0abc123def456',
    policy_code: 'AWS-EC2-003',
    first_detected_at: '2026-02-03T10:00:00Z',
    service: 'EC2',
    region: 'us-east-1',
    remediation: 'Enable IMDSv2 in EC2 instance metadata options',
  },
  {
    id: '3',
    title: 'RDS Instance Publicly Accessible',
    severity: 'critical',
    status: 'in_progress',
    resource_type: 'RDS Instance',
    resource_id: 'arn:aws:rds:us-east-1:123456789012:db:prod-db',
    policy_code: 'AWS-RDS-002',
    first_detected_at: '2026-02-01T08:00:00Z',
    service: 'RDS',
    region: 'us-east-1',
    remediation: 'Disable public accessibility and use security groups',
  },
  {
    id: '4',
    title: 'Security Group Allows 0.0.0.0/0 Ingress',
    severity: 'high',
    status: 'open',
    resource_type: 'Security Group',
    resource_id: 'sg-0123456789abcdef0',
    policy_code: 'AWS-VPC-001',
    first_detected_at: '2026-02-02T12:00:00Z',
    service: 'VPC',
    region: 'us-west-2',
    remediation: 'Restrict ingress rules to specific CIDR blocks',
  },
  {
    id: '5',
    title: 'CloudTrail Logging Disabled',
    severity: 'high',
    status: 'resolved',
    resource_type: 'CloudTrail',
    resource_id: 'arn:aws:cloudtrail:us-east-1:123456789012:trail/main',
    policy_code: 'AWS-CT-001',
    first_detected_at: '2026-01-28T09:00:00Z',
    service: 'CloudTrail',
    region: 'us-east-1',
    remediation: 'Enable CloudTrail for all regions',
  },
];

const complianceServices: ComplianceService[] = [
  { name: 'S3', passed: 18, total: 22, score: 82 },
  { name: 'EC2', passed: 24, total: 30, score: 80 },
  { name: 'IAM', passed: 28, total: 35, score: 80 },
  { name: 'RDS', passed: 15, total: 18, score: 83 },
  { name: 'VPC', passed: 20, total: 24, score: 83 },
  { name: 'CloudTrail', passed: 10, total: 10, score: 100 },
];

const providerConfig: Record<
  string,
  { label: string; color: string; bg: string; accentColor: string; logo: string }
> = {
  aws: {
    label: 'AWS',
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    accentColor: 'border-orange-200 dark:border-orange-900/30',
    logo: 'AWS',
  },
  azure: {
    label: 'Azure',
    color: 'text-sky-500',
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    accentColor: 'border-sky-200 dark:border-sky-900/30',
    logo: 'Azure',
  },
  gcp: {
    label: 'GCP',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    accentColor: 'border-emerald-200 dark:border-emerald-900/30',
    logo: 'GCP',
  },
};

const severityConfig: Record<
  string,
  { label: string; color: string; bg: string; icon: typeof AlertTriangle; dotColor: string }
> = {
  critical: {
    label: 'Critical',
    color: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-100/50 dark:bg-red-950/30',
    icon: XCircle,
    dotColor: 'bg-red-500',
  },
  high: {
    label: 'High',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-100/50 dark:bg-orange-950/30',
    icon: AlertTriangle,
    dotColor: 'bg-orange-500',
  },
  medium: {
    label: 'Medium',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100/50 dark:bg-amber-950/30',
    icon: AlertTriangle,
    dotColor: 'bg-amber-500',
  },
  low: {
    label: 'Low',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100/50 dark:bg-emerald-950/30',
    icon: CheckCircle2,
    dotColor: 'bg-emerald-500',
  },
};

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; icon: typeof CheckCircle2 }
> = {
  open: {
    label: 'Open',
    color: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-100/50 dark:bg-red-950/30',
    icon: AlertTriangle,
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100/50 dark:bg-amber-950/30',
    icon: RefreshCw,
  },
  resolved: {
    label: 'Resolved',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100/50 dark:bg-emerald-950/30',
    icon: CheckCircle2,
  },
  accepted: {
    label: 'Accepted',
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-100/50 dark:bg-sky-950/30',
    icon: CheckCircle2,
  },
  suppressed: {
    label: 'Suppressed',
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-100/50 dark:bg-slate-900/30',
    icon: XCircle,
  },
};

const resourceTypeIcons: Record<string, typeof Server> = {
  'S3 Bucket': Database,
  'EC2 Instance': Server,
  'RDS Instance': Database,
  'Security Group': Shield,
  CloudTrail: Globe,
};

export default function CSPMPage() {
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [showRemediationModal, setShowRemediationModal] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [showFindingDetailsModal, setShowFindingDetailsModal] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<CloudAccount[]>(cloudAccounts);
  const [findingsList, setFindingsList] = useState<Finding[]>(findings);
  const [formData, setFormData] = useState({
    provider: 'aws',
    accountId: '',
    accountName: '',
  });

  // Calculate statistics
  const connectedAccountsCount = connectedAccounts.filter((a) => a.status === 'connected').length;
  const totalAccountFindings = connectedAccounts.reduce(
    (acc, account) =>
      acc +
      Object.values(account.findings).reduce((a, b) => a + b, 0),
    0
  );
  const criticalFindings = findingsList.filter(
    (f) => f.severity === 'critical' && (f.status === 'open' || f.status === 'in_progress')
  ).length;
  const highFindings = findingsList.filter(
    (f) => f.severity === 'high' && (f.status === 'open' || f.status === 'in_progress')
  ).length;
  const overallComplianceScore = Math.round(
    complianceServices.reduce((sum, s) => sum + s.score, 0) / complianceServices.length
  );

  // Filter findings
  const filteredFindings = findingsList.filter((finding) => {
    if (severityFilter && finding.severity !== severityFilter) return false;
    if (statusFilter && finding.status !== statusFilter) return false;
    if (
      searchQuery &&
      !finding.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !finding.resource_id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !finding.policy_code.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const showToast = (message: string, type: 'success' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleScanAll = () => {
    showToast('Security scan initiated across all connected cloud accounts. Results will appear shortly.', 'info');
  };

  const handleConnectAccount = () => {
    setShowAddAccount(true);
  };

  const handleScanNow = (accountName: string) => {
    showToast(`Scanning ${accountName}...`, 'info');
  };

  const handleRemediateClick = (finding: Finding) => {
    setSelectedFinding(finding);
    setShowRemediationModal(true);
  };

  const handleMarkAsRemediated = () => {
    if (!selectedFinding) return;
    // In a real app, this would call PATCH /api/findings/${selectedFinding.id}
    const updatedFindings = findingsList.map((f) =>
      f.id === selectedFinding.id ? { ...f, status: 'resolved' as const } : f
    );
    setFindingsList(updatedFindings);
    showToast('Finding marked as remediated', 'success');
    setShowRemediationModal(false);
    setSelectedFinding(null);
  };

  const handleConnectAccountSubmit = () => {
    if (!formData.accountId.trim() || !formData.accountName.trim()) {
      showToast('Please fill in all required fields', 'info');
      return;
    }

    // Create new account with default values
    const newAccount: CloudAccount = {
      id: String(connectedAccounts.length + 1),
      provider: formData.provider as 'aws' | 'azure' | 'gcp',
      account_id: formData.accountId,
      account_name: formData.accountName,
      status: 'connected',
      last_scan_at: new Date().toISOString(),
      findings: { critical: 0, high: 0, medium: 0, low: 0 },
      compliance_score: 85,
      region: 'us-east-1',
    };

    // Add to connected accounts
    setConnectedAccounts([...connectedAccounts, newAccount]);

    // Reset form
    setFormData({ provider: 'aws', accountId: '', accountName: '' });
    setShowAddAccount(false);

    showToast(`Cloud account "${formData.accountName}" connected successfully`, 'success');
  };

  const handleViewFindingDetails = (finding: Finding) => {
    setSelectedFinding(finding);
    setShowFindingDetailsModal(true);
  };

  return (
    <div className="space-y-6 p-6 animate-fadeIn">
      {/* Toast Notification */}
      {toast && (
        <div
          className={cn(
            'fixed top-4 right-4 px-4 py-3 rounded-xl text-sm font-medium text-white shadow-lg z-50 animate-fadeIn',
            toast.type === 'success' ? 'bg-emerald-500' : 'bg-sky-500'
          )}
        >
          {toast.message}
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">
            Cloud Security Posture
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Monitor and remediate security misconfigurations across your cloud infrastructure
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleScanAll}
            className="flex items-center gap-2 rounded-2xl border border-slate-200/60 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700/40 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            <RefreshCw className="h-4 w-4" />
            Scan All
          </button>
          <button
            onClick={() => setShowAddAccount(!showAddAccount)}
            className="flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-sky-600 dark:hover:bg-sky-400"
          >
            <Plus className="h-4 w-4" />
            Add Account
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid gap-4 md:grid-cols-4 animate-fadeIn">
        <Card className="border-slate-200/60 bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 shadow-sm rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Cloud Accounts
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">
                  {connectedAccountsCount}/{connectedAccounts.length}
                </p>
              </div>
              <div className="rounded-2xl bg-sky-100/50 p-3 dark:bg-sky-950/30">
                <Cloud className="h-6 w-6 text-sky-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 shadow-sm rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Findings
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">
                  {totalAccountFindings}
                </p>
              </div>
              <div className="rounded-2xl bg-amber-100/50 p-3 dark:bg-amber-950/30">
                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 shadow-sm rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Critical / High
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">
                  {criticalFindings}/{highFindings}
                </p>
              </div>
              <div className="rounded-2xl bg-red-100/50 p-3 dark:bg-red-950/30">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 shadow-sm rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Compliance Score
                </p>
                <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {overallComplianceScore}%
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-100/50 p-3 dark:bg-emerald-950/30">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Account Inline Form */}
      {showAddAccount && (
        <Card className="border-slate-200/60 bg-white dark:bg-slate-950 shadow-sm rounded-2xl animate-fadeIn">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Add Cloud Account</CardTitle>
              <button
                onClick={() => setShowAddAccount(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Provider
                </label>
                <select
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200/60 bg-white px-3 py-2 dark:border-slate-700/40 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="aws">AWS</option>
                  <option value="azure">Azure</option>
                  <option value="gcp">GCP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Account ID
                </label>
                <input
                  type="text"
                  placeholder="Enter account ID"
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200/60 bg-white px-3 py-2 dark:border-slate-700/40 dark:bg-slate-900 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Account Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Production"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200/60 bg-white px-3 py-2 dark:border-slate-700/40 dark:bg-slate-900 dark:text-slate-200"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleConnectAccountSubmit}
                className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 transition-colors"
              >
                Connect Account
              </button>
              <button
                onClick={() => setShowAddAccount(false)}
                className="rounded-xl border border-slate-200/60 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700/40 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                Cancel
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cloud Accounts Section */}
      <Card className="border-slate-200/60 bg-white dark:bg-slate-950 shadow-sm rounded-2xl animate-fadeIn">
        <CardHeader>
          <CardTitle>Connected Cloud Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {connectedAccounts.map((account) => {
              const provider = providerConfig[account.provider];
              const totalIssues = Object.values(account.findings).reduce((a, b) => a + b, 0);

              return (
                <div
                  key={account.id}
                  className={cn(
                    'group rounded-2xl border transition-all duration-200 p-4 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600',
                    account.status === 'connected'
                      ? 'border-slate-200/60 dark:border-slate-700/40 bg-white dark:bg-slate-900/50'
                      : 'border-red-200/60 dark:border-red-900/40 bg-red-50/30 dark:bg-red-950/20'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        'rounded-lg px-2.5 py-1.5 text-xs font-bold',
                        provider.bg,
                        provider.color
                      )}
                    >
                      {provider.logo}
                    </div>
                    <div
                      className={cn(
                        'h-2.5 w-2.5 rounded-full',
                        account.status === 'connected'
                          ? 'bg-emerald-500'
                          : account.status === 'error'
                            ? 'bg-red-500'
                            : 'bg-amber-500'
                      )}
                    />
                  </div>

                  <h3 className="mt-3 font-semibold text-slate-900 dark:text-slate-50">
                    {account.account_name}
                  </h3>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {account.account_id}
                  </p>

                  {account.status === 'connected' && (
                    <>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-400">Compliance</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-50">
                            {account.compliance_score}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-200/50 dark:bg-slate-700/30">
                          <div
                            className="h-full rounded-full bg-sky-500"
                            style={{ width: `${account.compliance_score}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {account.findings.critical > 0 && (
                          <span className="rounded-lg bg-red-100/60 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400">
                            {account.findings.critical}C
                          </span>
                        )}
                        {account.findings.high > 0 && (
                          <span className="rounded-lg bg-orange-100/60 px-2 py-1 text-xs font-medium text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
                            {account.findings.high}H
                          </span>
                        )}
                        {account.findings.medium > 0 && (
                          <span className="rounded-lg bg-amber-100/60 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                            {account.findings.medium}M
                          </span>
                        )}
                        {account.findings.low > 0 && (
                          <span className="rounded-lg bg-emerald-100/60 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                            {account.findings.low}L
                          </span>
                        )}
                        {totalIssues === 0 && (
                          <span className="rounded-lg bg-emerald-100/60 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                            Clean
                          </span>
                        )}
                      </div>
                    </>
                  )}

                  <div className="mt-4 space-y-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Last scan:{' '}
                      {account.status === 'connected'
                        ? new Date(account.last_scan_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          } as any)
                        : 'Error'}
                    </p>
                    <button
                      onClick={() => handleScanNow(account.account_name)}
                      className="w-full rounded-xl border border-slate-200/60 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700/40 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Scan Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Compliance by Service */}
      <Card className="border-slate-200/60 bg-white dark:bg-slate-950 shadow-sm rounded-2xl animate-fadeIn">
        <CardHeader>
          <CardTitle>Compliance by Service</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {complianceServices.map((service) => (
              <div key={service.name}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {service.name}
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {service.score}%
                  </span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-200/50 dark:bg-slate-700/30">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      service.score >= 90
                        ? 'bg-emerald-500'
                        : service.score >= 80
                          ? 'bg-sky-500'
                          : 'bg-amber-500'
                    )}
                    style={{ width: `${service.score}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {service.passed} / {service.total} checks passed
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Findings Section */}
      <Card className="border-slate-200/60 bg-white dark:bg-slate-950 shadow-sm rounded-2xl animate-fadeIn">
        <CardHeader>
          <div className="space-y-4">
            <CardTitle>Security Findings</CardTitle>

            {/* Filters and Search */}
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search findings by title, resource, or policy code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/60 bg-white pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/10 dark:border-slate-700/40 dark:bg-slate-900 dark:text-slate-50 dark:placeholder-slate-500"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Severity:
                </span>
                {Object.entries(severityConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setSeverityFilter(severityFilter === key ? null : key)}
                    className={cn(
                      'rounded-xl px-3 py-1.5 text-xs font-medium transition-all',
                      severityFilter === key
                        ? cn(config.bg, config.color, 'ring-2 ring-offset-1 ring-slate-900/20')
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900'
                    )}
                  >
                    {config.label}
                  </button>
                ))}

                <span className="ml-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                  Status:
                </span>
                {['open', 'in_progress', 'resolved', 'accepted', 'suppressed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(statusFilter === status ? null : status)}
                    className={cn(
                      'rounded-xl px-3 py-1.5 text-xs font-medium transition-all',
                      statusFilter === status
                        ? cn(
                            statusConfig[status].bg,
                            statusConfig[status].color,
                            'ring-2 ring-offset-1 ring-slate-900/20'
                          )
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900'
                    )}
                  >
                    {statusConfig[status].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredFindings.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200/60 bg-slate-50/30 p-8 text-center dark:border-slate-700/40 dark:bg-slate-900/20">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  No findings match your filters
                </p>
              </div>
            ) : (
              filteredFindings.map((finding) => {
                const severity = severityConfig[finding.severity];
                const status = statusConfig[finding.status];
                const SeverityIcon = severity.icon;
                const StatusIcon = status.icon;
                const ResourceIcon = resourceTypeIcons[finding.resource_type] || Server;
                const isExpanded = expandedFinding === finding.id;

                return (
                  <div
                    key={finding.id}
                    className={cn(
                      'rounded-2xl border transition-all duration-200',
                      isExpanded
                        ? 'border-slate-300/60 bg-slate-50/40 dark:border-slate-600/40 dark:bg-slate-900/30 shadow-md'
                        : 'border-slate-200/60 bg-white dark:border-slate-700/40 dark:bg-slate-950 hover:border-slate-300/60 hover:shadow-sm'
                    )}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Severity Icon */}
                        <div className={cn('rounded-xl p-2.5', severity.bg)}>
                          <SeverityIcon className={cn('h-5 w-5', severity.color)} />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                              {finding.title}
                            </h3>
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium',
                                status.bg,
                                status.color
                              )}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </span>
                            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              {finding.policy_code}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                              <ResourceIcon className="h-4 w-4" />
                              <span>{finding.resource_type}</span>
                            </div>
                            {finding.service && (
                              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                <span className="text-xs">Service:</span>
                                <span className="font-medium">{finding.service}</span>
                              </div>
                            )}
                            {finding.region && (
                              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                <span className="text-xs">Region:</span>
                                <span className="font-medium">{finding.region}</span>
                              </div>
                            )}
                          </div>

                          <p className="mt-2 font-mono text-xs text-slate-500 dark:text-slate-400 break-all">
                            {finding.resource_id}
                          </p>

                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            First detected:{' '}
                            {new Date(finding.first_detected_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: '2-digit',
                            } as any)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setExpandedFinding(isExpanded ? null : finding.id)
                            }
                            className="rounded-lg p-2 text-slate-400 transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <ChevronDown
                              className={cn('h-5 w-5 transition-transform', {
                                'rotate-180': isExpanded,
                              })}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && finding.remediation && (
                        <div className="mt-4 space-y-3 border-t border-slate-200/60 pt-4 dark:border-slate-700/40">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                              Remediation Suggestion
                            </h4>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                              {finding.remediation}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRemediateClick(finding)}
                              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-sky-600"
                            >
                              Remediate
                            </button>
                            <button
                              onClick={() => handleViewFindingDetails(finding)}
                              className="rounded-lg border border-slate-200/60 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700/40 dark:text-slate-300 dark:hover:bg-slate-900"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Remediation Modal */}
      {showRemediationModal && selectedFinding && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl border-slate-200/60 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Remediation Steps</CardTitle>
                <button
                  onClick={() => {
                    setShowRemediationModal(false);
                    setSelectedFinding(null);
                  }}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-2">
                  {selectedFinding.title}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Resource Type</p>
                    <p className="font-medium text-slate-900 dark:text-slate-50">
                      {selectedFinding.resource_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Status</p>
                    <p className="font-medium text-slate-900 dark:text-slate-50">
                      {statusConfig[selectedFinding.status].label}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3">
                  Remediation Suggestion
                </h4>
                <div className="bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 rounded-lg p-4">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {selectedFinding.remediation}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/40">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  <strong>Resource ID:</strong>
                </p>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 break-all bg-slate-50 dark:bg-slate-900/30 p-2 rounded">
                  {selectedFinding.resource_id}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleMarkAsRemediated}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                >
                  Mark as Remediated
                </button>
                <button
                  onClick={() => {
                    setShowRemediationModal(false);
                    setSelectedFinding(null);
                  }}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700/40 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Finding Details Modal */}
      {showFindingDetailsModal && selectedFinding && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl border-slate-200/60 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Finding Details</CardTitle>
                <button
                  onClick={() => {
                    setShowFindingDetailsModal(false);
                    setSelectedFinding(null);
                  }}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-3">
                  {selectedFinding.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium',
                      severityConfig[selectedFinding.severity].bg,
                      severityConfig[selectedFinding.severity].color
                    )}
                  >
                    {severityConfig[selectedFinding.severity].label}
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium',
                      statusConfig[selectedFinding.status].bg,
                      statusConfig[selectedFinding.status].color
                    )}
                  >
                    {statusConfig[selectedFinding.status].label}
                  </span>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {selectedFinding.policy_code}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Resource Type</p>
                  <p className="mt-1 font-medium text-slate-900 dark:text-slate-50">
                    {selectedFinding.resource_type}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Service</p>
                  <p className="mt-1 font-medium text-slate-900 dark:text-slate-50">
                    {selectedFinding.service || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Region</p>
                  <p className="mt-1 font-medium text-slate-900 dark:text-slate-50">
                    {selectedFinding.region || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400">First Detected</p>
                  <p className="mt-1 font-medium text-slate-900 dark:text-slate-50">
                    {new Date(selectedFinding.first_detected_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    } as any)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-2">
                  Resource ID
                </p>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 break-all bg-slate-50 dark:bg-slate-900/30 p-3 rounded-lg">
                  {selectedFinding.resource_id}
                </p>
              </div>

              {selectedFinding.remediation && (
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-2">
                    Remediation Suggestion
                  </p>
                  <div className="bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 rounded-lg p-4">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {selectedFinding.remediation}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 border-t border-slate-200/60 pt-6 dark:border-slate-700/40">
                <button
                  onClick={() => {
                    setShowFindingDetailsModal(false);
                    handleRemediateClick(selectedFinding);
                  }}
                  className="flex-1 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-medium"
                >
                  Remediate
                </button>
                <button
                  onClick={() => {
                    setShowFindingDetailsModal(false);
                    setSelectedFinding(null);
                  }}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700/40 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
