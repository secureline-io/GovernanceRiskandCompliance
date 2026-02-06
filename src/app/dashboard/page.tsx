'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Shield,
  AlertTriangle,
  FileText,
  Users,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Building2,
  ClipboardCheck,
  BarChart3,
  Activity,
  Calendar,
  RefreshCw,
  Eye,
  FolderOpen,
  Plus,
  Upload,
  FileCheck,
  AlertCircle,
  Zap,
  CheckCheck,
  Loader2,
  Search,
  Settings,
  Check,
  AlertOctagon,
  Cloud
} from 'lucide-react';
import {
  PieChart,
  Pie,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { cn } from '@/lib/utils';

// Mock data generators
const generateComplianceTrendData = () => [
  { month: 'Jan', compliance: 65 },
  { month: 'Feb', compliance: 70 },
  { month: 'Mar', compliance: 73 },
  { month: 'Apr', compliance: 78 },
  { month: 'May', compliance: 80 },
  { month: 'Jun', compliance: 82.7 },
];

const generateCloudSecurityData = () => [
  { service: 'IAM', ok: 45, needsAttention: 8 },
  { service: 'EC2', ok: 52, needsAttention: 15 },
  { service: 'CloudTrail', ok: 28, needsAttention: 3 },
  { service: 'S3', ok: 38, needsAttention: 12 },
  { service: 'RDS', ok: 22, needsAttention: 5 },
];

const mockFrameworks = [
  {
    id: '1',
    name: 'SOC 2 Type II',
    logo: '🔒',
    compliance: 92,
    policies: '28/30',
    evidence: '156/180',
    tests: '89/95'
  },
  {
    id: '2',
    name: 'ISO 27001',
    logo: '🌐',
    compliance: 88,
    policies: '42/45',
    evidence: '210/250',
    tests: '145/160'
  },
  {
    id: '3',
    name: 'NIST CSF',
    logo: '🛡️',
    compliance: 75,
    policies: '35/50',
    evidence: '180/280',
    tests: '120/200'
  },
  {
    id: '4',
    name: 'PCI-DSS',
    logo: '💳',
    compliance: 85,
    policies: '25/30',
    evidence: '145/170',
    tests: '110/130'
  },
];

const mockAudits = [
  {
    id: '1',
    month: 'Mar',
    year: 2024,
    framework: 'SOC 2',
    type: 'Annual Assessment',
    scope: 'Full',
    icon: '📋'
  },
  {
    id: '2',
    month: 'Jun',
    year: 2024,
    framework: 'ISO 27001',
    type: 'Surveillance',
    scope: 'Sampled',
    icon: '🔍'
  },
  {
    id: '3',
    month: 'Sep',
    year: 2024,
    framework: 'PCI-DSS',
    type: 'Annual Assessment',
    scope: 'Full',
    icon: '💳'
  },
];

interface ComplianceData {
  compliant: number;
  nonCompliant: number;
  percentage: number;
}

interface JobNeedsAttention {
  id: string;
  title: string;
  framework: string;
  priority: 'high' | 'medium' | 'low';
}

interface TabData {
  policies: JobNeedsAttention[];
  evidenceTasks: JobNeedsAttention[];
  automatedTests: JobNeedsAttention[];
}

export default function Dashboard() {
  const [complianceData, setComplianceData] = useState<ComplianceData>({
    compliant: 153,
    nonCompliant: 32,
    percentage: 82.7
  });

  const [jobsData, setJobsData] = useState<TabData>({
    policies: [],
    evidenceTasks: [
      {
        id: '1',
        title: 'Upload SOC 2 Audit Report',
        framework: 'SOC 2',
        priority: 'high'
      },
      {
        id: '2',
        title: 'Provide ISO 27001 Risk Assessment',
        framework: 'ISO 27001',
        priority: 'high'
      },
      {
        id: '3',
        title: 'Document Access Control Procedures',
        framework: 'NIST CSF',
        priority: 'medium'
      }
    ],
    automatedTests: [
      {
        id: '1',
        title: 'CloudTrail Logging Verification',
        framework: 'PCI-DSS',
        priority: 'high'
      },
      {
        id: '2',
        title: 'MFA Enforcement Check',
        framework: 'SOC 2',
        priority: 'high'
      },
      {
        id: '3',
        title: 'Data Encryption Validation',
        framework: 'ISO 27001',
        priority: 'medium'
      },
      // Add more mock tests to reach 32
      ...Array.from({ length: 29 }, (_, i) => ({
        id: `test-${i + 4}`,
        title: `Security Test ${i + 4}`,
        framework: ['SOC 2', 'ISO 27001', 'PCI-DSS'][i % 3],
        priority: (i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
      }))
    ]
  });

  const [activeTab, setActiveTab] = useState<'policies' | 'evidenceTasks' | 'automatedTests'>('evidenceTasks');
  const [showComplianceTrend, setShowComplianceTrend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState('All Entities');

  // Fetch data on component mount
  useEffect(() => {
    // In a real app, fetch from APIs here
    setLoading(false);
  }, []);

  const getTabData = () => {
    switch (activeTab) {
      case 'policies':
        return jobsData.policies;
      case 'evidenceTasks':
        return jobsData.evidenceTasks;
      case 'automatedTests':
        return jobsData.automatedTests;
      default:
        return [];
    }
  };

  const getCurrentTabCount = () => {
    switch (activeTab) {
      case 'policies':
        return jobsData.policies.length;
      case 'evidenceTasks':
        return jobsData.evidenceTasks.length;
      case 'automatedTests':
        return jobsData.automatedTests.length;
      default:
        return 0;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-amber-600';
      case 'low':
        return 'text-emerald-600';
      default:
        return 'text-slate-600';
    }
  };

  const getPriorityBgColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border border-red-200';
      case 'medium':
        return 'bg-amber-50 border border-amber-200';
      case 'low':
        return 'bg-emerald-50 border border-emerald-200';
      default:
        return 'bg-slate-50 border border-slate-200';
    }
  };

  const complianceTrendData = generateComplianceTrendData();
  const cloudSecurityData = generateCloudSecurityData();

  const miniProgressIndicators = [
    { label: 'Policies', percentage: 93.3 },
    { label: 'Evidence Tasks', percentage: 95.2 },
    { label: 'Automated Tests', percentage: 72.1 }
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* All Entities Dropdown */}
          <div className="relative group">
            <button className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
              {selectedEntity}
              <ChevronRight className="w-4 h-4 transform group-hover:rotate-90 transition-transform" />
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="p-2">
                {['All Entities', 'Production', 'Staging', 'Development'].map((entity) => (
                  <button
                    key={entity}
                    onClick={() => setSelectedEntity(entity)}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-sky-50 rounded-md transition-colors"
                  >
                    {entity}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => window.location.reload()}
            className="p-2.5 hover:bg-white rounded-lg transition-all duration-200 border border-slate-200"
            title="Refresh dashboard"
          >
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* TOP ROW: Compliance Progress & Jobs That Need Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COMPLIANCE PROGRESS CARD */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Compliance Progress</h2>
            <Settings className="w-5 h-5 text-slate-400" />
          </div>

          {/* Donut Chart */}
          <div className="flex flex-col items-center justify-center mb-8">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Compliant', value: complianceData.compliant, fill: '#10b981' },
                    { name: 'Non Compliant', value: complianceData.nonCompliant, fill: '#ef4444' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute mt-2 text-center">
              <p className="text-2xl font-bold text-slate-900">{complianceData.percentage}%</p>
              <p className="text-sm text-slate-600">Compliant</p>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 mb-6 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-slate-600">Non Compliant</span>
              </div>
              <span className="font-semibold text-slate-900">{complianceData.nonCompliant}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Compliant</span>
              </div>
              <span className="font-semibold text-slate-900">{complianceData.compliant}</span>
            </div>
          </div>

          {/* Mini Progress Indicators */}
          <div className="space-y-3 mb-6 border-t border-slate-200 pt-4">
            {miniProgressIndicators.map((indicator) => (
              <div key={indicator.label} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-sky-50 border-2 border-sky-200">
                  <span className="text-xs font-bold text-sky-600">{indicator.percentage}%</span>
                </div>
                <span className="text-sm text-slate-600 flex-1">{indicator.label}</span>
              </div>
            ))}
          </div>

          {/* View Trend Link */}
          <button
            onClick={() => setShowComplianceTrend(!showComplianceTrend)}
            className="w-full text-center text-sky-600 hover:text-sky-700 text-sm font-medium transition-colors py-2 border-t border-slate-200"
          >
            {showComplianceTrend ? 'Hide Compliance Trend' : 'View Compliance Trend'}
          </button>

          {/* Compliance Trend Chart */}
          {showComplianceTrend && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={complianceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="compliance"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    dot={{ fill: '#0ea5e9', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* JOBS THAT NEED YOUR ATTENTION CARD */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 hover:shadow-md transition-all duration-300 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Jobs That Need Your Attention</h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 border-b border-slate-200 pb-4">
            {[
              { key: 'policies', label: 'Policies', count: jobsData.policies.length },
              { key: 'evidenceTasks', label: 'Evidence Tasks', count: jobsData.evidenceTasks.length },
              { key: 'automatedTests', label: 'Automated Tests', count: jobsData.automatedTests.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeTab === tab.key
                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                    : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Job List */}
          <div className="flex-1 space-y-2 min-h-48">
            {getTabData().length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-400 mb-3" />
                <p className="text-slate-600 font-medium">All good here.</p>
                <p className="text-slate-400 text-sm mt-1">No items need your attention</p>
              </div>
            ) : (
              getTabData().slice(0, 5).map((job) => (
                <div
                  key={job.id}
                  className={cn(
                    'p-3 rounded-lg flex items-center justify-between transition-colors',
                    getPriorityBgColor(job.priority)
                  )}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{job.title}</p>
                    <p className="text-xs text-slate-500">{job.framework}</p>
                  </div>
                  <button className="ml-2 px-3 py-1.5 text-xs font-medium text-sky-600 hover:text-sky-700 border border-sky-200 rounded-md hover:bg-sky-50 transition-colors whitespace-nowrap">
                    Resolve
                  </button>
                </div>
              ))
            )}
          </div>

          {/* View All Link */}
          {getTabData().length > 5 && (
            <div className="pt-4 border-t border-slate-200 mt-4">
              <Link href="/evidence" className="text-sky-600 hover:text-sky-700 text-sm font-medium transition-colors">
                View All
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* SECOND ROW: Vulnerability & Cloud Security */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VULNERABILITY OVERVIEW CARD */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center py-12">
          <Search className="w-16 h-16 text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No vulnerabilities found!</h3>
          <p className="text-slate-500 text-sm text-center mb-6 max-w-sm">
            Connect your vulnerability scanner to reveal hidden threats.
          </p>
          <Link
            href="/integrations"
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors"
          >
            Go To Integrations
          </Link>
        </div>

        {/* CLOUD SECURITY OVERVIEW CARD */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Cloud Security Overview</h2>
          </div>

          {/* AWS Tab Button */}
          <div className="mb-4 flex gap-2">
            <button className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm font-medium text-amber-700 flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              AWS
            </button>
          </div>

          {/* Bar Chart */}
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={cloudSecurityData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="service" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Bar dataKey="ok" name="OK" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="needsAttention" name="Needs Attention" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* THIRD ROW: Frameworks & Upcoming Audits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FRAMEWORKS SECTION */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Frameworks</h2>
            <Link href="/compliance" className="text-sky-600 hover:text-sky-700 text-sm font-medium transition-colors flex items-center gap-1">
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {mockFrameworks.map((framework) => (
              <div
                key={framework.id}
                className="p-4 bg-slate-50 rounded-xl hover:bg-sky-50 transition-colors border border-slate-200/50 hover:border-sky-200/50"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{framework.logo}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-slate-900">{framework.name}</h3>
                      <span className="text-sm font-bold text-emerald-600">{framework.compliance}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${framework.compliance}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Mini Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-white rounded p-2 text-center border border-slate-200">
                    <p className="font-semibold text-slate-900">{framework.policies}</p>
                    <p className="text-slate-500 text-xs">Policies</p>
                  </div>
                  <div className="bg-white rounded p-2 text-center border border-slate-200">
                    <p className="font-semibold text-slate-900">{framework.evidence}</p>
                    <p className="text-slate-500 text-xs">Evidence</p>
                  </div>
                  <div className="bg-white rounded p-2 text-center border border-slate-200">
                    <p className="font-semibold text-slate-900">{framework.tests}</p>
                    <p className="text-slate-500 text-xs">Tests</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* UPCOMING AUDITS SECTION */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming Audits</h2>
            <Link href="/audits" className="text-sky-600 hover:text-sky-700 text-sm font-medium transition-colors flex items-center gap-1">
              View Audit Calendar
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {mockAudits.map((audit) => (
              <div
                key={audit.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200/50 hover:border-sky-200/50 hover:bg-sky-50 transition-colors flex items-start gap-3"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-slate-600">{audit.month}</span>
                    <span className="text-xs text-slate-500">{audit.year}</span>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{audit.icon}</span>
                    <h3 className="text-sm font-semibold text-slate-900">{audit.framework}</h3>
                  </div>
                  <p className="text-xs text-slate-600 mb-1">{audit.type}</p>
                  <span className="inline-block text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">
                    {audit.scope} Scope
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
