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
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import OnboardingChecklist from '@/components/OnboardingChecklist';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer } from 'recharts';

// Default org ID - replace with real auth context later
const DEFAULT_ORG_ID = 'default';

interface DashboardStats {
  complianceScore: number;
  activeRisks: number;
  criticalRisks: number;
  pendingTasks: number;
  overdueTasks: number;
  vendorCount: number;
  highRiskVendors: number;
  evidenceCount: number;
  activeAudits: number;
  policiesCount: number;
  findingsCount: number;
}

interface Framework {
  id: string;
  code: string;
  name: string;
  framework_requirements: { count: number }[];
  compliance_percentage?: number;
}

interface RecentActivity {
  id: string;
  action: string;
  resource: string;
  time: string;
  type: 'success' | 'warning' | 'info' | 'error';
  user?: string;
}

interface UpcomingTask {
  id: string;
  title: string;
  due_date: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: string;
}

const getFrameworkIcon = (code: string) => {
  const icons: Record<string, string> = {
    'SOC2': '🏛️',
    'ISO27001': '🌐',
    'NIST-CSF': '🇺🇸',
    'PCI-DSS': '💳',
    'HIPAA': '🏥',
    'GDPR': '🇪🇺',
  };
  return icons[code] || '📋';
};

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    complianceScore: 0,
    activeRisks: 0,
    criticalRisks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    vendorCount: 0,
    highRiskVendors: 0,
    evidenceCount: 0,
    activeAudits: 0,
    policiesCount: 0,
    findingsCount: 0
  });
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState<'live' | 'fallback'>('live');

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      // Fetch frameworks and dashboard data in parallel
      const [frameworksRes, dashboardRes] = await Promise.allSettled([
        fetch('/api/frameworks'),
        fetch(`/api/dashboard?org_id=${DEFAULT_ORG_ID}`)
      ]);

      // Process frameworks
      if (frameworksRes.status === 'fulfilled' && frameworksRes.value.ok) {
        const frameworksData = await frameworksRes.value.json();
        const fwData = frameworksData.data || frameworksData;
        if (Array.isArray(fwData) && fwData.length > 0) {
          setFrameworks(fwData.slice(0, 6));
        }
      }

      // Process dashboard stats
      if (dashboardRes.status === 'fulfilled' && dashboardRes.value.ok) {
        const dashData = await dashboardRes.value.json();
        const d = dashData.data || dashData;

        setStats({
          complianceScore: d.compliance_percentage || 0,
          activeRisks: d.risks?.total || 0,
          criticalRisks: d.risks?.critical || 0,
          pendingTasks: d.tasks?.total || 0,
          overdueTasks: d.tasks?.overdue || 0,
          vendorCount: d.vendors?.total || 0,
          highRiskVendors: d.vendors?.high_risk || 0,
          evidenceCount: d.evidence?.total || 0,
          activeAudits: 0,
          policiesCount: 0,
          findingsCount: d.findings?.total || 0
        });

        // Process recent activity from audit logs
        if (d.recent_activity && Array.isArray(d.recent_activity)) {
          setRecentActivity(d.recent_activity.map((log: any, idx: number) => ({
            id: log.id || String(idx),
            action: log.action?.replace(/_/g, ' ').replace(/\./g, ' ') || 'Activity',
            resource: log.resource_type || '',
            time: log.occurred_at ? formatTimeAgo(log.occurred_at) : 'Recently',
            type: log.action?.includes('created') ? 'success' :
                  log.action?.includes('deleted') ? 'error' :
                  log.action?.includes('updated') ? 'warning' : 'info',
            user: log.user_id ? 'User' : 'System'
          })));
        }

        setDataSource('live');
      } else {
        // Fallback: try to aggregate from individual endpoints
        setDataSource('fallback');
        await fetchFallbackData();
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setDataSource('fallback');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const fetchFallbackData = async () => {
    // If dashboard endpoint fails, try individual endpoints
    try {
      const [risksRes, evidenceRes, vendorsRes, findingsRes, policiesRes] = await Promise.allSettled([
        fetch(`/api/risks?org_id=${DEFAULT_ORG_ID}`),
        fetch(`/api/evidence?org_id=${DEFAULT_ORG_ID}`),
        fetch(`/api/vendors?org_id=${DEFAULT_ORG_ID}`),
        fetch(`/api/findings?org_id=${DEFAULT_ORG_ID}`),
        fetch(`/api/policies?org_id=${DEFAULT_ORG_ID}`),
      ]);

      const risks = risksRes.status === 'fulfilled' ? await risksRes.value.json() : null;
      const evidence = evidenceRes.status === 'fulfilled' ? await evidenceRes.value.json() : null;
      const vendors = vendorsRes.status === 'fulfilled' ? await vendorsRes.value.json() : null;
      const findings = findingsRes.status === 'fulfilled' ? await findingsRes.value.json() : null;
      const policiesData = policiesRes.status === 'fulfilled' ? await policiesRes.value.json() : null;

      const riskList = risks?.data || risks || [];
      const evidenceList = evidence?.data || evidence || [];
      const vendorList = vendors?.data || vendors || [];
      const findingsList = findings?.data || findings || [];
      const policiesList = policiesData?.data || policiesData || [];

      setStats({
        complianceScore: 0,
        activeRisks: Array.isArray(riskList) ? riskList.filter((r: any) => r.status === 'open').length : 0,
        criticalRisks: Array.isArray(riskList) ? riskList.filter((r: any) => r.inherent_risk_score >= 20).length : 0,
        pendingTasks: 0,
        overdueTasks: 0,
        vendorCount: Array.isArray(vendorList) ? vendorList.length : 0,
        highRiskVendors: Array.isArray(vendorList) ? vendorList.filter((v: any) => v.risk_level === 'high' || v.risk_level === 'critical').length : 0,
        evidenceCount: Array.isArray(evidenceList) ? evidenceList.length : 0,
        activeAudits: 0,
        policiesCount: Array.isArray(policiesList) ? policiesList.filter((p: any) => p.status === 'active').length : 0,
        findingsCount: Array.isArray(findingsList) ? findingsList.filter((f: any) => f.status === 'open').length : 0
      });
    } catch (e) {
      // If everything fails, show zeros - data will populate once org is set up
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Skeleton loader component
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-200 rounded-2xl animate-shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-slate-200 rounded w-20 animate-shimmer" />
            <div className="h-4 bg-slate-100 rounded w-28 animate-shimmer" />
          </div>
        </div>
        <div className="h-2 bg-slate-100 rounded-full animate-shimmer" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen animate-fadeIn">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-slate-200 rounded w-32 animate-shimmer mb-2" />
            <div className="h-4 bg-slate-100 rounded w-72 animate-shimmer" />
          </div>
          <div className="h-10 bg-slate-200 rounded w-32 animate-shimmer" />
        </div>

        {/* Stat cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SkeletonCard />
          </div>
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const complianceColor = stats.complianceScore >= 80 ? 'emerald' :
                          stats.complianceScore >= 60 ? 'amber' : 'red';

  // Compliance distribution data for chart
  const complianceDistribution = [
    { name: 'Compliant', value: Math.round(stats.complianceScore * 0.8), color: '#10b981' },
    { name: 'Partial', value: Math.round((100 - stats.complianceScore) * 0.5), color: '#f59e0b' },
    { name: 'Non-Compliant', value: Math.round((100 - stats.complianceScore) * 0.5), color: '#ef4444' }
  ].filter(item => item.value > 0);

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen animate-fadeIn">
      {/* Onboarding Checklist */}
      <OnboardingChecklist />

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1.5">
            Good morning, Ashish. Here&apos;s your compliance overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            {dataSource === 'fallback' && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs font-medium text-amber-700">Fallback</span>
              </div>
            )}
          </div>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={isRefreshing}
            className="p-2.5 hover:bg-white rounded-xl transition-all duration-200 disabled:opacity-50"
            title="Refresh dashboard"
          >
            <RefreshCw className={cn(
              'w-5 h-5 text-slate-600 transition-transform duration-300',
              isRefreshing && 'animate-spin'
            )} />
          </button>
        </div>
      </div>

      {/* STAT CARDS ROW - 4 cards with stagger animation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
        {/* Compliance Score Card */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 hover:shadow-md transition-all duration-300 animate-fadeIn">
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center',
              complianceColor === 'emerald' ? 'bg-emerald-100' :
              complianceColor === 'amber' ? 'bg-amber-100' : 'bg-red-100'
            )}>
              <Shield className={cn(
                'w-6 h-6',
                complianceColor === 'emerald' ? 'text-emerald-600' :
                complianceColor === 'amber' ? 'text-amber-600' : 'text-red-600'
              )} />
            </div>
            {stats.complianceScore > 0 && (
              <div className={cn(
                'flex items-center gap-1 text-xs font-medium',
                complianceColor === 'emerald' ? 'text-emerald-600' :
                complianceColor === 'amber' ? 'text-amber-600' : 'text-red-600'
              )}>
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.complianceScore}%</p>
          <p className="text-sm text-slate-500 mt-0.5">Compliance Score</p>
          <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                complianceColor === 'emerald' ? 'bg-emerald-500' :
                complianceColor === 'amber' ? 'bg-amber-500' : 'bg-red-500'
              )}
              style={{ width: `${stats.complianceScore}%` }}
            />
          </div>
        </div>

        {/* Open Risks Card */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 hover:shadow-md transition-all duration-300 animate-fadeIn">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-100">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            {stats.activeRisks > 0 && stats.activeRisks > stats.criticalRisks && (
              <TrendingDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.activeRisks}</p>
          <p className="text-sm text-slate-500 mt-0.5">Open Risks</p>
          {stats.criticalRisks > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${Math.min((stats.criticalRisks / stats.activeRisks) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs font-medium text-red-600 whitespace-nowrap">{stats.criticalRisks} critical</span>
            </div>
          )}
        </div>

        {/* Evidence Items Card */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 hover:shadow-md transition-all duration-300 animate-fadeIn">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-violet-100">
              <FolderOpen className="w-6 h-6 text-violet-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.evidenceCount}</p>
          <p className="text-sm text-slate-500 mt-0.5">Evidence Items</p>
          <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(stats.evidenceCount * 10, 100)}%` }}
            />
          </div>
        </div>

        {/* Active Vendors Card */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 hover:shadow-md transition-all duration-300 animate-fadeIn">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-100">
              <Building2 className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.vendorCount}</p>
          <p className="text-sm text-slate-500 mt-0.5">Active Vendors</p>
          {stats.highRiskVendors > 0 && (
            <div className="mt-3 text-xs text-amber-600 font-medium">
              {stats.highRiskVendors} needing review
            </div>
          )}
          {stats.highRiskVendors === 0 && stats.vendorCount > 0 && (
            <div className="mt-3 text-xs text-emerald-600 font-medium flex items-center gap-1">
              <CheckCheck className="w-3.5 h-3.5" />
              All approved
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT AREA - 2 column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Framework Compliance Card */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
            <div className="px-6 py-4 border-b border-slate-200/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-slate-600" />
                <h2 className="text-lg font-semibold text-slate-900">Framework Compliance</h2>
              </div>
              <Link href="/compliance" className="text-sm font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors">
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-6">
              {frameworks.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm font-medium">No frameworks configured</p>
                  <Link href="/compliance" className="text-sky-600 text-sm font-medium mt-3 inline-flex items-center gap-1 hover:gap-2 transition-all">
                    Set up your first framework
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {frameworks.map((framework) => {
                    const compliancePercent = framework.compliance_percentage || 0;
                    return (
                      <Link key={framework.id} href="/compliance">
                        <div className="p-4 bg-slate-50 rounded-xl hover:bg-sky-50 transition-colors group cursor-pointer">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{getFrameworkIcon(framework.code)}</span>
                              <div>
                                <p className="font-medium text-slate-900">{framework.name}</p>
                              </div>
                            </div>
                            <span className={cn(
                              'text-sm font-semibold',
                              compliancePercent >= 80 ? 'text-emerald-600' :
                              compliancePercent >= 60 ? 'text-amber-600' : 'text-red-600'
                            )}>
                              {compliancePercent}%
                            </span>
                          </div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all duration-500',
                                compliancePercent >= 80 ? 'bg-emerald-500' :
                                compliancePercent >= 60 ? 'bg-amber-500' : 'bg-red-500'
                              )}
                              style={{ width: `${compliancePercent}%` }}
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
            <div className="px-6 py-4 border-b border-slate-200/60 flex items-center gap-3">
              <Activity className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm font-medium">No recent activity</p>
                  <p className="text-slate-400 text-xs mt-1">Activity will appear as you use the platform</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.slice(0, 7).map((activity, idx) => (
                    <div key={activity.id} className={cn(
                      'flex gap-4',
                      idx !== recentActivity.length - 1 && 'pb-4 border-b border-slate-100'
                    )}>
                      <div className={cn(
                        'w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ring-3',
                        activity.type === 'success' ? 'bg-emerald-500 ring-emerald-100' :
                        activity.type === 'warning' ? 'bg-amber-500 ring-amber-100' :
                        activity.type === 'error' ? 'bg-red-500 ring-red-100' : 'bg-sky-500 ring-sky-100'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 capitalize">{activity.action}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{activity.resource}</p>
                        <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - 1/3 width */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
            <div className="px-6 py-4 border-b border-slate-200/60">
              <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2">
                <Link href="/controls" className="bg-slate-50 hover:bg-sky-50 rounded-xl p-3 transition-colors group text-center">
                  <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-medium text-slate-700">Add Control</p>
                </Link>
                <Link href="/evidence" className="bg-slate-50 hover:bg-sky-50 rounded-xl p-3 transition-colors group text-center">
                  <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Upload className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-medium text-slate-700">Upload Evidence</p>
                </Link>
                <Link href="/policies" className="bg-slate-50 hover:bg-sky-50 rounded-xl p-3 transition-colors group text-center">
                  <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <FileCheck className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-medium text-slate-700">Create Policy</p>
                </Link>
                <Link href="/vendors" className="bg-slate-50 hover:bg-sky-50 rounded-xl p-3 transition-colors group text-center">
                  <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-medium text-slate-700">Add Vendor</p>
                </Link>
                <Link href="/risks" className="bg-slate-50 hover:bg-sky-50 rounded-xl p-3 transition-colors group text-center">
                  <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-medium text-slate-700">View Risks</p>
                </Link>
                <Link href="/compliance" className="bg-slate-50 hover:bg-sky-50 rounded-xl p-3 transition-colors group text-center">
                  <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-medium text-slate-700">Run Audit</p>
                </Link>
              </div>
            </div>
          </div>

          {/* Pending Tasks Card */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
            <div className="px-6 py-4 border-b border-slate-200/60 flex items-center gap-3">
              <Clock className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Upcoming Tasks</h2>
            </div>
            <div className="p-6">
              {stats.pendingTasks === 0 ? (
                <div className="text-center py-8">
                  <CheckCheck className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
                  <p className="text-slate-600 text-sm font-medium">All caught up!</p>
                  <p className="text-slate-400 text-xs mt-1">No pending tasks</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...Array(Math.min(3, stats.pendingTasks))].map((_, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg flex items-start gap-3">
                      <div className={cn(
                        'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                        idx === 0 ? 'bg-red-500' : 'bg-amber-500'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">Task {idx + 1}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Due soon</p>
                      </div>
                      <span className={cn(
                        'text-xs font-semibold whitespace-nowrap px-2 py-1 rounded',
                        idx === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      )}>
                        {idx === 0 ? 'Overdue' : 'High'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Compliance Distribution Card */}
          {complianceDistribution.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="px-6 py-4 border-b border-slate-200/60">
                <h2 className="text-lg font-semibold text-slate-900">Control Status</h2>
              </div>
              <div className="p-6 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={complianceDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {complianceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="px-6 pb-4 space-y-2 border-t border-slate-100">
                {complianceDistribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
