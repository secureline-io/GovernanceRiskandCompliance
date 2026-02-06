'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Cloud, Server, Database, Globe, Shield, Search, Download, RefreshCw,
  Filter, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, Box,
  Loader2, X, Eye, Plus, Wifi, WifiOff, Clock, BarChart3, Zap
} from 'lucide-react';
import {
  PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/AuthContext';
import { exportToCSV } from '@/lib/export';

// Types
interface Asset {
  id: string;
  resource_id: string;
  resource_arn: string;
  resource_type: string;
  resource_name: string;
  service: string;
  provider: string;
  account_id: string;
  region: string;
  environment: string | null;
  team: string | null;
  criticality: string;
  data_classification: string | null;
  internet_exposed: boolean;
  lifecycle_state: string;
  tags: Record<string, string>;
  configuration: Record<string, unknown>;
  first_seen_at: string;
  last_seen_at: string;
}

interface Stats {
  summary: {
    total_assets: number;
    active_assets: number;
    stale_assets: number;
    exposed_assets: number;
    untagged_assets: number;
    connected_accounts: number;
    total_accounts: number;
  };
  by_service: Array<{ name: string; count: number }>;
  by_resource_type: Array<{ name: string; count: number }>;
  by_region: Array<{ name: string; count: number }>;
  by_environment: Array<{ name: string; count: number }>;
  by_criticality: Array<{ name: string; count: number }>;
  by_classification: Array<{ name: string; count: number }>;
  last_sync: { completed_at: string; assets_discovered: number; duration_ms: number } | null;
}

const CHART_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6'];

const criticalityColors: Record<string, { text: string; bg: string; border: string }> = {
  critical: { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
  high: { text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  medium: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  low: { text: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
};

const serviceIcons: Record<string, string> = {
  ec2: '🖥️', s3: '🪣', rds: '🗄️', vpc: '🌐', iam: '🔑', lambda: '⚡',
  eks: '📦', ecs: '📦', dynamodb: '🗄️', kms: '🔐', ebs: '💾',
  elb: '⚖️', cloudfront: '🌍', route53: '🗺️', cloudtrail: '📋',
};

const ITEMS_PER_PAGE = 25;

export default function CloudInventoryPage() {
  const { currentOrg } = useAuth();
  const orgId = currentOrg?.org_id || 'default';

  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'connect'>('dashboard');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAssets, setTotalAssets] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [envFilter, setEnvFilter] = useState('');
  const [critFilter, setCritFilter] = useState('');
  const [exposedFilter, setExposedFilter] = useState('');
  const [lifecycleFilter, setLifecycleFilter] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Connect form
  const [connectForm, setConnectForm] = useState({
    provider: 'aws',
    role_arn: '',
    account_name: '',
    regions: ['us-east-1'],
  });
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{ success: boolean; message: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/cloud-inventory/stats?org_id=${orgId}`);
      if (res.ok) {
        const json = await res.json();
        setStats(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [orgId]);

  // Fetch assets
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ org_id: orgId, page: String(currentPage), limit: String(ITEMS_PER_PAGE) });
      if (searchQuery) params.set('search', searchQuery);
      if (serviceFilter) params.set('service', serviceFilter);
      if (regionFilter) params.set('region', regionFilter);
      if (envFilter) params.set('environment', envFilter);
      if (critFilter) params.set('criticality', critFilter);
      if (exposedFilter) params.set('internet_exposed', exposedFilter);
      if (lifecycleFilter) params.set('lifecycle_state', lifecycleFilter);

      const res = await fetch(`/api/cloud-inventory?${params}`);
      if (res.ok) {
        const json = await res.json();
        setAssets(json.data || []);
        setTotalAssets(json.pagination?.total || json.data?.length || 0);
      }
    } catch (err) {
      console.error('Failed to fetch assets:', err);
    } finally {
      setLoading(false);
    }
  }, [orgId, currentPage, searchQuery, serviceFilter, regionFilter, envFilter, critFilter, exposedFilter, lifecycleFilter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  // Sync handler
  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/cloud-inventory/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: orgId }),
      });
      if (res.ok) {
        const json = await res.json();
        const results = json.data || [];
        const totalDiscovered = results.reduce((s: number, r: { assets_discovered?: number }) => s + (r.assets_discovered || 0), 0);
        showToast(`Sync complete! ${totalDiscovered} new assets discovered.`, 'success');
        await fetchStats();
        await fetchAssets();
      } else {
        const err = await res.json();
        showToast(err.error || 'Sync failed', 'error');
      }
    } catch (err) {
      showToast('Sync failed: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Connect handler
  const handleConnect = async () => {
    setTestingConnection(true);
    setConnectionResult(null);
    try {
      const res = await fetch('/api/cloud-inventory/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: orgId,
          ...connectForm,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setConnectionResult({ success: true, message: `Connected! Account ${json.data.account_id}` });
        showToast('AWS account connected successfully!', 'success');
        setConnectForm({ provider: 'aws', role_arn: '', account_name: '', regions: ['us-east-1'] });
        await fetchStats();
      } else {
        setConnectionResult({ success: false, message: json.error });
      }
    } catch (err) {
      setConnectionResult({ success: false, message: err instanceof Error ? err.message : 'Failed' });
    } finally {
      setTestingConnection(false);
    }
  };

  // Test connection
  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionResult(null);
    try {
      const res = await fetch('/api/cloud-inventory/connect', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role_arn: connectForm.role_arn }),
      });
      const json = await res.json();
      if (json.data?.success) {
        setConnectionResult({ success: true, message: `Connection OK! Account: ${json.data.account_id}` });
      } else {
        setConnectionResult({ success: false, message: json.data?.error || json.error || 'Test failed' });
      }
    } catch (err) {
      setConnectionResult({ success: false, message: err instanceof Error ? err.message : 'Test failed' });
    } finally {
      setTestingConnection(false);
    }
  };

  // Export
  const handleExport = () => {
    if (assets.length === 0) return;
    exportToCSV(
      assets.map(a => ({
        Name: a.resource_name,
        Service: a.service,
        Type: a.resource_type,
        Region: a.region,
        Account: a.account_id,
        Environment: a.environment || '',
        Criticality: a.criticality,
        Classification: a.data_classification || '',
        Exposed: a.internet_exposed ? 'Yes' : 'No',
        Status: a.lifecycle_state,
        'Last Seen': a.last_seen_at,
        ARN: a.resource_arn || '',
      })),
      'cloud-asset-inventory'
    );
    showToast('Exported to CSV', 'success');
  };

  const totalPages = Math.ceil(totalAssets / ITEMS_PER_PAGE);
  const summary = stats?.summary;

  const hasActiveFilters = searchQuery || serviceFilter || regionFilter || envFilter || critFilter || exposedFilter || lifecycleFilter;

  return (
    <div className="bg-slate-50/50 p-6 lg:p-8 min-h-screen animate-fadeIn">
      {/* Toast */}
      {toast && (
        <div className={cn(
          'fixed top-4 right-4 px-4 py-3 rounded-xl text-sm font-medium text-white shadow-lg z-50 animate-fadeIn',
          toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-sky-500'
        )}>
          {toast.message}
        </div>
      )}

      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Cloud className="w-8 h-8 text-sky-500" />
              Cloud Asset Inventory
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {summary ? `${summary.total_assets} assets across ${summary.connected_accounts} account${summary.connected_accounts !== 1 ? 's' : ''}` : 'Discover and classify your cloud infrastructure'}
              {stats?.last_sync && (
                <span className="ml-2 text-slate-400">
                  · Last sync: {new Date(stats.last_sync.completed_at).toLocaleString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSync}
              disabled={syncing}
              className={cn(
                'rounded-xl px-4 py-2.5 text-sm font-medium transition-all active:scale-95 flex items-center gap-2 shadow-sm',
                syncing
                  ? 'bg-slate-100 text-slate-400 cursor-wait'
                  : 'bg-sky-500 text-white hover:bg-sky-600 shadow-sky-500/25'
              )}
            >
              <RefreshCw className={cn('w-4 h-4', syncing && 'animate-spin')} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
            <button
              onClick={handleExport}
              className="rounded-xl px-4 py-2.5 text-sm font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="border-b border-slate-200 bg-white rounded-t-xl">
          <div className="flex gap-8 px-6">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { key: 'inventory', label: 'All Assets', icon: Server },
              { key: 'connect', label: 'Connect Account', icon: Plus },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={cn(
                  'py-4 font-medium text-sm transition-colors relative flex items-center gap-2',
                  activeTab === tab.key ? 'text-sky-600' : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Total Assets', value: summary?.total_assets || 0, icon: Box, color: 'text-sky-500', bg: 'bg-sky-50' },
                { label: 'Active', value: summary?.active_assets || 0, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { label: 'Exposed', value: summary?.exposed_assets || 0, icon: Wifi, color: 'text-red-500', bg: 'bg-red-50' },
                { label: 'Stale', value: summary?.stale_assets || 0, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
                { label: 'Untagged', value: summary?.untagged_assets || 0, icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' },
                { label: 'Accounts', value: summary?.connected_accounts || 0, icon: Cloud, color: 'text-indigo-500', bg: 'bg-indigo-50' },
              ].map(card => (
                <div key={card.label} className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', card.bg)}>
                      <card.icon className={cn('w-5 h-5', card.color)} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{card.label}</p>
                      <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* By Service */}
              <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Assets by Service</h3>
                {stats?.by_service && stats.by_service.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.by_service.slice(0, 10)} margin={{ left: 20 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {stats.by_service.slice(0, 10).map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-72 flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <Cloud className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No assets discovered yet</p>
                      <p className="text-xs mt-1">Connect an AWS account and run a sync</p>
                    </div>
                  </div>
                )}
              </div>

              {/* By Criticality */}
              <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Criticality Distribution</h3>
                {stats?.by_criticality && stats.by_criticality.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={stats.by_criticality}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="count"
                        >
                          {stats.by_criticality.map((entry, i) => {
                            const colors: Record<string, string> = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#94a3b8' };
                            return <Cell key={i} fill={colors[entry.name] || CHART_COLORS[i]} />;
                          })}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {stats.by_criticality.map((item) => {
                        const colors: Record<string, string> = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#94a3b8' };
                        return (
                          <div key={item.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[item.name] || '#94a3b8' }} />
                            <span className="text-sm text-slate-600 capitalize">{item.name}: {item.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="h-72 flex items-center justify-center text-slate-400">
                    <p className="text-sm">No data available</p>
                  </div>
                )}
              </div>

              {/* By Region */}
              <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Assets by Region</h3>
                {stats?.by_region && stats.by_region.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.by_region.slice(0, 8)} layout="vertical" margin={{ left: 80 }}>
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={75} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      <Bar dataKey="count" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-72 flex items-center justify-center text-slate-400">
                    <p className="text-sm">No data available</p>
                  </div>
                )}
              </div>

              {/* By Environment */}
              <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Assets by Environment</h3>
                {stats?.by_environment && stats.by_environment.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={stats.by_environment}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="count"
                        >
                          {stats.by_environment.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {stats.by_environment.map((item, idx) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                          <span className="text-sm text-slate-600 capitalize">{item.name}: {item.count}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-72 flex items-center justify-center text-slate-400">
                    <p className="text-sm">No data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, ARN, or resource ID..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-sky-300 focus:ring-2 focus:ring-sky-100 transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={cn(
                  'rounded-xl px-4 py-2.5 text-sm font-medium border transition-all flex items-center gap-2',
                  hasActiveFilters
                    ? 'border-sky-300 bg-sky-50 text-sky-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="w-5 h-5 bg-sky-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {[serviceFilter, regionFilter, envFilter, critFilter, exposedFilter, lifecycleFilter].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>

            {/* Filter panel */}
            {filtersOpen && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 animate-fadeIn">
                <select value={serviceFilter} onChange={e => { setServiceFilter(e.target.value); setCurrentPage(1); }}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <option value="">All Services</option>
                  {['ec2', 's3', 'rds', 'vpc', 'iam', 'lambda', 'eks', 'dynamodb', 'kms', 'ebs', 'elb'].map(s => (
                    <option key={s} value={s}>{s.toUpperCase()}</option>
                  ))}
                </select>
                <select value={regionFilter} onChange={e => { setRegionFilter(e.target.value); setCurrentPage(1); }}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <option value="">All Regions</option>
                  {['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1', 'global'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <select value={envFilter} onChange={e => { setEnvFilter(e.target.value); setCurrentPage(1); }}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <option value="">All Environments</option>
                  {['production', 'staging', 'development', 'testing', 'sandbox'].map(e => (
                    <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
                  ))}
                </select>
                <select value={critFilter} onChange={e => { setCritFilter(e.target.value); setCurrentPage(1); }}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <option value="">All Criticality</option>
                  {['critical', 'high', 'medium', 'low'].map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
                <select value={exposedFilter} onChange={e => { setExposedFilter(e.target.value); setCurrentPage(1); }}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <option value="">All Exposure</option>
                  <option value="true">Internet Exposed</option>
                  <option value="false">Not Exposed</option>
                </select>
                <select value={lifecycleFilter} onChange={e => { setLifecycleFilter(e.target.value); setCurrentPage(1); }}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <option value="">All States</option>
                  <option value="active">Active</option>
                  <option value="stale">Stale</option>
                  <option value="deleted">Deleted</option>
                </select>
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      setServiceFilter(''); setRegionFilter(''); setEnvFilter('');
                      setCritFilter(''); setExposedFilter(''); setLifecycleFilter('');
                      setSearchQuery(''); setCurrentPage(1);
                    }}
                    className="text-sm text-sky-600 hover:text-sky-700 font-medium col-span-full text-left"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Assets table */}
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Service</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Region</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Environment</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Criticality</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Exposed</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Seen</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 8 }).map((_, j) => (
                            <td key={j} className="px-4 py-3">
                              <div className="h-4 bg-slate-200 rounded animate-pulse w-20" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : assets.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-16">
                          <Server className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-500 font-medium">No assets found</p>
                          <p className="text-sm text-slate-400 mt-1">
                            {hasActiveFilters ? 'Try adjusting your filters' : 'Connect an AWS account and run a sync to discover assets'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      assets.map(asset => {
                        const crit = criticalityColors[asset.criticality] || criticalityColors.medium;
                        return (
                          <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">{serviceIcons[asset.service] || '📦'}</span>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">{asset.resource_name}</p>
                                  <p className="text-xs text-slate-400 truncate max-w-[200px]">{asset.resource_type?.replace(/_/g, ' ')}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-slate-700 uppercase font-medium">{asset.service}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-slate-600">{asset.region}</span>
                            </td>
                            <td className="px-4 py-3">
                              {asset.environment ? (
                                <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200 capitalize">
                                  {asset.environment}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className={cn('px-2 py-0.5 rounded-md text-xs font-medium border capitalize', crit.text, crit.bg, crit.border)}>
                                {asset.criticality}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {asset.internet_exposed ? (
                                <span className="flex items-center gap-1 text-xs font-medium text-red-600">
                                  <Wifi className="w-3.5 h-3.5" /> Yes
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                  <WifiOff className="w-3.5 h-3.5" /> No
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs text-slate-500">
                                {asset.last_seen_at ? new Date(asset.last_seen_at).toLocaleDateString() : '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <Link
                                href={`/cloud-inventory/${asset.id}`}
                                className="text-sky-600 hover:text-sky-700 text-sm font-medium flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" /> View
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
                  <p className="text-sm text-slate-500">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalAssets)} of {totalAssets}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-slate-600 px-2">Page {currentPage} of {totalPages}</span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONNECT TAB */}
        {activeTab === 'connect' && (
          <div className="max-w-2xl animate-fadeIn space-y-6">
            <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Connect AWS Account</h3>
              <p className="text-sm text-slate-500 mb-6">
                Use IAM Role-based access with External ID for secure, least-privilege connection.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Provider</label>
                  <select
                    value={connectForm.provider}
                    onChange={e => setConnectForm(f => ({ ...f, provider: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                  >
                    <option value="aws">Amazon Web Services (AWS)</option>
                    <option value="azure" disabled>Microsoft Azure (Coming Soon)</option>
                    <option value="gcp" disabled>Google Cloud (Coming Soon)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">IAM Role ARN *</label>
                  <input
                    type="text"
                    placeholder="arn:aws:iam::123456789012:role/SecurelineGRCReadOnly"
                    value={connectForm.role_arn}
                    onChange={e => setConnectForm(f => ({ ...f, role_arn: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-mono"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    The cross-account IAM role with read-only access to your AWS resources.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Account Name (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Production AWS Account"
                    value={connectForm.account_name}
                    onChange={e => setConnectForm(f => ({ ...f, account_name: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Regions to Scan</label>
                  <div className="flex flex-wrap gap-2">
                    {['us-east-1', 'us-west-2', 'eu-west-1', 'eu-central-1', 'ap-southeast-1', 'ap-northeast-1'].map(r => (
                      <button
                        key={r}
                        onClick={() => {
                          setConnectForm(f => ({
                            ...f,
                            regions: f.regions.includes(r) ? f.regions.filter(x => x !== r) : [...f.regions, r]
                          }));
                        }}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                          connectForm.regions.includes(r)
                            ? 'border-sky-300 bg-sky-50 text-sky-700'
                            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {connectionResult && (
                  <div className={cn(
                    'p-4 rounded-lg border text-sm',
                    connectionResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-red-50 border-red-200 text-red-700'
                  )}>
                    <div className="flex items-center gap-2">
                      {connectionResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      {connectionResult.message}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleTestConnection}
                    disabled={testingConnection || !connectForm.role_arn}
                    className="rounded-xl px-4 py-2.5 text-sm font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {testingConnection ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    Test Connection
                  </button>
                  <button
                    onClick={handleConnect}
                    disabled={testingConnection || !connectForm.role_arn}
                    className="rounded-xl px-6 py-2.5 text-sm font-medium bg-sky-500 text-white hover:bg-sky-600 transition-all shadow-sm shadow-sky-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Connect Account
                  </button>
                </div>
              </div>
            </div>

            {/* Setup Guide */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">AWS Setup Guide</h3>
              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                  <div>
                    <p className="font-medium text-slate-700">Create an IAM Role</p>
                    <p className="text-slate-500 mt-0.5">In your AWS account, create a new IAM Role with &quot;Another AWS account&quot; as the trusted entity.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                  <div>
                    <p className="font-medium text-slate-700">Attach ReadOnly Policy</p>
                    <p className="text-slate-500 mt-0.5">Attach the <code className="bg-slate-100 px-1 rounded">ReadOnlyAccess</code> or <code className="bg-slate-100 px-1 rounded">SecurityAudit</code> managed policy.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                  <div>
                    <p className="font-medium text-slate-700">Configure External ID</p>
                    <p className="text-slate-500 mt-0.5">Add the External ID from Secureline to prevent confused deputy attacks.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                  <div>
                    <p className="font-medium text-slate-700">Enter Role ARN</p>
                    <p className="text-slate-500 mt-0.5">Copy the Role ARN and paste it above. Click &quot;Test Connection&quot; to verify.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
