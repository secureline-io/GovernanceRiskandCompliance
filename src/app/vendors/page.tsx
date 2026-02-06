'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Building2, Plus, Download, Search, RefreshCw, AlertTriangle,
  CheckCircle2, Clock, Eye, X, Loader, Send, Trash2, User, Calendar,
  MoreVertical, ArrowRight
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/AuthContext';
import CreateVendorModal, { VendorFormData } from '@/components/modals/CreateVendorModal';
import { exportToCSV } from '@/lib/export';

const riskConfig: Record<string, { label: string; color: string; bg: string; borderColor: string; icon: typeof AlertTriangle }> = {
  critical: { label: 'Critical', color: 'text-red-700', bg: 'bg-red-50', borderColor: 'border-red-200', icon: AlertTriangle },
  high: { label: 'High', color: 'text-orange-700', bg: 'bg-orange-50', borderColor: 'border-orange-200', icon: AlertTriangle },
  medium: { label: 'Medium', color: 'text-amber-700', bg: 'bg-amber-50', borderColor: 'border-amber-200', icon: Clock },
  low: { label: 'Low', color: 'text-emerald-700', bg: 'bg-emerald-50', borderColor: 'border-emerald-200', icon: CheckCircle2 }
};

const statusConfig: Record<string, { label: string; color: string; bg: string; borderColor: string }> = {
  active: { label: 'Active', color: 'text-emerald-700', bg: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  inactive: { label: 'Inactive', color: 'text-slate-600', bg: 'bg-slate-100', borderColor: 'border-slate-200' },
  pending_review: { label: 'Pending Review', color: 'text-amber-700', bg: 'bg-amber-50', borderColor: 'border-amber-200' },
  onboarding: { label: 'Onboarding', color: 'text-sky-700', bg: 'bg-sky-50', borderColor: 'border-sky-200' }
};

const questionnaireStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  in_progress: { label: 'In Progress', color: 'text-sky-700', bg: 'bg-sky-50' },
  not_started: { label: 'Not Started', color: 'text-slate-700', bg: 'bg-slate-50' },
  overdue: { label: 'Overdue', color: 'text-red-700', bg: 'bg-red-50' }
};

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: 'Critical', color: 'text-red-700', bg: 'bg-red-50' },
  high: { label: 'High', color: 'text-orange-700', bg: 'bg-orange-50' },
  medium: { label: 'Medium', color: 'text-amber-700', bg: 'bg-amber-50' },
  low: { label: 'Low', color: 'text-emerald-700', bg: 'bg-emerald-50' }
};

const chartColors = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface Vendor {
  id: string;
  name: string;
  industry?: string;
  risk_level: string;
  status: string;
  last_assessed_at?: string;
  contact_email?: string;
  contact_name?: string;
  website?: string;
  description?: string;
  tier?: string;
  contract_start_date?: string;
  contract_end_date?: string;
}

interface Questionnaire {
  id: string;
  name: string;
  vendor: string;
  status: 'completed' | 'in_progress' | 'not_started' | 'overdue';
  sent_date: string;
  due_date: string;
  completion_percentage: number;
}

interface MitigationTask {
  id: string;
  name: string;
  vendor: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string;
  assigned_to: string;
}

interface OnboardingVendor {
  id: string;
  name: string;
  stage: 'initiated' | 'documentation' | 'risk_assessment' | 'review' | 'approved' | 'rejected';
}

const SkeletonRow = () => (
  <tr>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-32"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-24"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-20"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-24"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-24"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-32"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-shimmer w-12"></div></td>
  </tr>
);

export default function VendorsPage() {
  const { currentOrg } = useAuth();
  const orgId = currentOrg?.org_id || 'default';

  const [activeTab, setActiveTab] = useState<'dashboard' | 'vendors' | 'questionnaires' | 'mitigation' | 'onboarding'>('dashboard');
  const [filter, setFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [assessments, setAssessments] = useState<any[]>([]);

  // Mock data for questionnaires
  const [questionnaires] = useState<Questionnaire[]>([
    {
      id: '1',
      name: 'SOC 2 Assessment',
      vendor: 'AWS',
      status: 'completed',
      sent_date: '2024-12-01',
      due_date: '2025-01-15',
      completion_percentage: 100
    },
    {
      id: '2',
      name: 'Security Questionnaire',
      vendor: 'Salesforce',
      status: 'in_progress',
      sent_date: '2025-01-05',
      due_date: '2025-02-05',
      completion_percentage: 65
    },
    {
      id: '3',
      name: 'Data Privacy Review',
      vendor: 'Slack',
      status: 'not_started',
      sent_date: '2025-01-15',
      due_date: '2025-02-15',
      completion_percentage: 0
    },
    {
      id: '4',
      name: 'Compliance Audit',
      vendor: 'GitHub',
      status: 'overdue',
      sent_date: '2024-12-15',
      due_date: '2025-01-15',
      completion_percentage: 45
    }
  ]);

  // Mock data for mitigation tasks
  const [mitigationTasks] = useState<MitigationTask[]>([
    {
      id: '1',
      name: 'Implement MFA for all accounts',
      vendor: 'AWS',
      priority: 'critical',
      status: 'in_progress',
      due_date: '2025-02-15',
      assigned_to: 'John Smith'
    },
    {
      id: '2',
      name: 'Update security policies',
      vendor: 'Salesforce',
      priority: 'high',
      status: 'pending',
      due_date: '2025-02-28',
      assigned_to: 'Jane Doe'
    },
    {
      id: '3',
      name: 'Conduct vulnerability scan',
      vendor: 'Slack',
      priority: 'medium',
      status: 'completed',
      due_date: '2025-01-30',
      assigned_to: 'Mike Johnson'
    },
    {
      id: '4',
      name: 'Document data flow',
      vendor: 'GitHub',
      priority: 'low',
      status: 'pending',
      due_date: '2025-03-15',
      assigned_to: 'Sarah Williams'
    }
  ]);

  // Mock data for onboarding
  const [onboardingVendors] = useState<OnboardingVendor[]>([
    { id: '1', name: 'New Cloud Provider', stage: 'initiated' },
    { id: '2', name: 'Security Tools Inc', stage: 'documentation' },
    { id: '3', name: 'Data Analytics Platform', stage: 'risk_assessment' },
    { id: '4', name: 'Consulting Firm', stage: 'review' },
    { id: '5', name: 'HR Services', stage: 'approved' },
    { id: '6', name: 'Legacy System', stage: 'rejected' }
  ]);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/vendors?org_id=${orgId}`);
      const json = await res.json();
      const data = json.data || json || [];
      setVendors(Array.isArray(data) ? data : []);
    } catch {
      setVendors([]);
    }
    finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleCreateVendor = async (data: VendorFormData) => {
    const res = await fetch('/api/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        org_id: orgId,
        name: data.name,
        industry: data.category,
        contact_email: data.contact_email,
        contact_name: data.contact_name,
        website: data.website,
        description: data.description,
        risk_level: data.criticality || 'medium',
        criticality: data.criticality,
        data_shared: data.data_access_level ? [data.data_access_level] : [],
      }),
    });

    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || 'Failed to create vendor');
    }

    await fetchVendors();
  };

  const handleViewAssessment = async (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setAssessmentLoading(true);
    try {
      const res = await fetch(`/api/vendors/${vendor.id}/assessments`);
      const json = await res.json();
      const data = json.data || json || [];
      setAssessments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
      setAssessments([]);
    } finally {
      setAssessmentLoading(false);
    }
  };

  const handleAddAssessment = async (vendorId: string) => {
    try {
      const res = await fetch(`/api/vendors/${vendorId}/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Assessment',
          status: 'in_progress'
        }),
      });
      if (res.ok) {
        const vendor = vendors.find(v => v.id === vendorId);
        if (vendor) {
          await handleViewAssessment(vendor);
        }
      }
    } catch (error) {
      console.error('Failed to add assessment:', error);
    }
  };

  const handleExport = () => {
    const exportData = vendors.map(v => ({
      Name: v.name,
      Industry: v.industry || '',
      'Risk Level': v.risk_level || '',
      Status: v.status,
      'Last Assessed': v.last_assessed_at || 'Never',
      Email: v.contact_email || ''
    }));
    exportToCSV(exportData, `vendors-export-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = searchQuery === '' ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.industry || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.contact_email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = filter === null || v.risk_level === filter;
    return matchesSearch && matchesRisk;
  });

  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(v => v.status === 'active').length;
  const highRiskVendors = vendors.filter(v => v.risk_level === 'high' || v.risk_level === 'critical').length;
  const pendingReview = vendors.filter(v => v.status === 'pending_review').length;

  // Dashboard data
  const questionnaireData = [
    { name: 'Completed', value: questionnaires.filter(q => q.status === 'completed').length },
    { name: 'In Progress', value: questionnaires.filter(q => q.status === 'in_progress').length },
    { name: 'Not Started', value: questionnaires.filter(q => q.status === 'not_started').length },
    { name: 'Overdue', value: questionnaires.filter(q => q.status === 'overdue').length }
  ];

  const riskDistributionData = [
    { name: 'Critical', count: vendors.filter(v => v.risk_level === 'critical').length },
    { name: 'High', count: vendors.filter(v => v.risk_level === 'high').length },
    { name: 'Medium', count: vendors.filter(v => v.risk_level === 'medium').length },
    { name: 'Low', count: vendors.filter(v => v.risk_level === 'low').length }
  ];

  const mitigationData = [
    { name: 'Completed', value: mitigationTasks.filter(t => t.status === 'completed').length },
    { name: 'In Progress', value: mitigationTasks.filter(t => t.status === 'in_progress').length },
    { name: 'Pending', value: mitigationTasks.filter(t => t.status === 'pending').length }
  ];

  const isOverdue = (lastAssessedAt: string | null) => {
    if (!lastAssessedAt) return false;
    const assessed = new Date(lastAssessedAt);
    const now = new Date();
    const daysSince = (now.getTime() - assessed.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 90;
  };

  if (loading && activeTab === 'vendors') {
    return (
      <div className="p-8 flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="space-y-6 p-8 max-w-7xl mx-auto">
        {/* PAGE HEADER */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Vendor Management</h1>
            <p className="text-sm text-slate-500 mt-1">
              Total: <span className="font-semibold text-slate-700">{totalVendors}</span> vendor{totalVendors !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === 'vendors' && (
              <>
                <button
                  onClick={handleExport}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/25 transition-all active:scale-95 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Vendor
                </button>
              </>
            )}
            {activeTab === 'questionnaires' && (
              <button
                className="rounded-xl px-4 py-2.5 text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/25 transition-all active:scale-95 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Questionnaire
              </button>
            )}
            {activeTab === 'mitigation' && (
              <button
                className="rounded-xl px-4 py-2.5 text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/25 transition-all active:scale-95 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            )}
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex gap-1 border-b border-slate-200 bg-white rounded-t-xl px-6">
          {['dashboard', 'vendors', 'questionnaires', 'mitigation', 'onboarding'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 transition-all capitalize',
                activeTab === tab
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              )}
            >
              {tab === 'questionnaires' ? 'Questionnaires' : tab === 'mitigation' ? 'Mitigation Tasks' : tab}
            </button>
          ))}
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* STATS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
              <div className="rounded-xl border border-slate-200/60 bg-white p-4 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 text-slate-500">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Total Vendors</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{totalVendors}</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/60 bg-white p-4 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-500">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Active</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{activeVendors}</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/60 bg-white p-4 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-100 text-red-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">High Risk</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{highRiskVendors}</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/60 bg-white p-4 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 text-amber-500">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Pending Review</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{pendingReview}</p>
                </div>
              </div>
            </div>

            {/* CHARTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Questionnaire Status */}
              <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Questionnaire Status</h3>
                {questionnaireData.some(d => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={questionnaireData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {questionnaireData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-400">
                    No questionnaire data
                  </div>
                )}
              </div>

              {/* Vendor Risk Distribution */}
              <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Vendor Risk Distribution</h3>
                {riskDistributionData.some(d => d.count > 0) ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={riskDistributionData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={90} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0ea5e9" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-400">
                    No risk data
                  </div>
                )}
              </div>

              {/* Mitigation Task Status */}
              <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Mitigation Task Status</h3>
                {mitigationData.some(d => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={mitigationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {mitigationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-400">
                    No task data
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VENDORS TAB */}
        {activeTab === 'vendors' && (
          <div className="space-y-4">
            {/* FILTER BAR */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative w-full sm:w-auto sm:max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, industry, email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter(null)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all',
                    filter === null
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  All
                </button>
                {Object.entries(riskConfig).map(([key, config]) => {
                  const count = vendors.filter(v => v.risk_level === key).length;
                  return (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all',
                        filter === key
                          ? 'bg-sky-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DATA TABLE */}
            <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
              {loading ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200">
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Industry</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk Level</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Assessed</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                    </tbody>
                  </table>
                </div>
              ) : filteredVendors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center mb-4">
                    <Building2 className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-lg font-semibold text-slate-900">
                    {totalVendors === 0 ? 'No vendors registered' : 'No vendors match your filters'}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {totalVendors === 0
                      ? 'Add your first vendor to start managing third-party risk.'
                      : 'Try adjusting your search or filters'}
                  </p>
                  {totalVendors === 0 && (
                    <button
                      onClick={() => setCreateModalOpen(true)}
                      className="mt-6 rounded-xl px-4 py-2.5 text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/25 transition-all active:scale-95 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Vendor
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200">
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Industry</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk Level</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Assessed</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVendors.map(vendor => {
                        const risk = riskConfig[vendor.risk_level] || riskConfig.medium;
                        const status = statusConfig[vendor.status] || statusConfig.pending_review;
                        const RiskIcon = risk.icon;
                        const overdue = isOverdue(vendor.last_assessed_at || null);

                        return (
                          <tr key={vendor.id} className="border-b border-slate-100 hover:bg-sky-50/30 transition-colors cursor-pointer">
                            <td className="px-5 py-4">
                              <div>
                                <p className="text-sm font-medium text-slate-900">{vendor.name}</p>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-600">
                              {vendor.industry || '-'}
                            </td>
                            <td className="px-5 py-4">
                              <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium border flex items-center gap-1 w-fit', risk.bg, risk.color, risk.borderColor)}>
                                <RiskIcon className="h-3 w-3" />
                                {risk.label}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium border', status.bg, status.color, status.borderColor)}>
                                {status.label}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div>
                                <p className={cn('text-sm font-medium', overdue ? 'text-red-600' : 'text-slate-900')}>
                                  {vendor.last_assessed_at ? new Date(vendor.last_assessed_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  }) : 'Never'}
                                </p>
                                {overdue && (
                                  <p className="text-xs text-red-500 mt-0.5">Overdue (90+ days)</p>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              {vendor.contact_email ? (
                                <span className="text-sm text-slate-600 truncate max-w-48" title={vendor.contact_email}>
                                  {vendor.contact_email}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">-</span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <button
                                onClick={() => handleViewAssessment(vendor)}
                                className="text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                View Assessment
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* QUESTIONNAIRES TAB */}
        {activeTab === 'questionnaires' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Questionnaire Name</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendor</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Sent Date</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Completion %</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questionnaires.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                        No questionnaires yet
                      </td>
                    </tr>
                  ) : (
                    questionnaires.map(q => {
                      const config = questionnaireStatusConfig[q.status] || questionnaireStatusConfig.not_started;
                      return (
                        <tr key={q.id} className="border-b border-slate-100 hover:bg-sky-50/30 transition-colors">
                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-slate-900">{q.name}</p>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">{q.vendor}</td>
                          <td className="px-5 py-4">
                            <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', config.bg, config.color)}>
                              {config.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">
                            {new Date(q.sent_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">
                            {new Date(q.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-sky-500 transition-all"
                                  style={{ width: `${q.completion_percentage}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-slate-600 w-10">{q.completion_percentage}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <button className="text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors flex items-center gap-1">
                              <Send className="w-3 h-3" />
                              Resend
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MITIGATION TASKS TAB */}
        {activeTab === 'mitigation' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Task Name</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendor</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned To</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mitigationTasks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                        No mitigation tasks yet
                      </td>
                    </tr>
                  ) : (
                    mitigationTasks.map(task => {
                      const taskPriorityConfig = priorityConfig[task.priority];
                      const statusConfig = questionnaireStatusConfig[task.status] || questionnaireStatusConfig.not_started;
                      return (
                        <tr key={task.id} className="border-b border-slate-100 hover:bg-sky-50/30 transition-colors">
                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-slate-900">{task.name}</p>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">{task.vendor}</td>
                          <td className="px-5 py-4">
                            <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', taskPriorityConfig.bg, taskPriorityConfig.color)}>
                              {taskPriorityConfig.label}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', statusConfig.bg, statusConfig.color)}>
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">
                            {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <User className="w-4 h-4" />
                              {task.assigned_to}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <button className="text-slate-400 hover:text-slate-600 transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ONBOARDING TAB */}
        {activeTab === 'onboarding' && (
          <div className="space-y-4">
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {['initiated', 'documentation', 'risk_assessment', 'review', 'approved'].map((stage) => {
                  const stageLabel = {
                    initiated: 'Initiated',
                    documentation: 'Documentation',
                    risk_assessment: 'Risk Assessment',
                    review: 'Review',
                    approved: 'Approved'
                  }[stage];

                  const stageVendors = onboardingVendors.filter(v => v.stage === stage);

                  return (
                    <div key={stage} className="flex-shrink-0 w-80">
                      <div className="rounded-xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
                        {/* Stage Header */}
                        <div className="bg-gradient-to-r from-slate-50 to-sky-50 px-4 py-3 border-b border-slate-200">
                          <h3 className="font-semibold text-slate-900">{stageLabel}</h3>
                          <p className="text-xs text-slate-500 mt-1">{stageVendors.length} vendor{stageVendors.length !== 1 ? 's' : ''}</p>
                        </div>

                        {/* Vendors in this stage */}
                        <div className="p-3 space-y-3">
                          {stageVendors.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                              <p className="text-sm">No vendors</p>
                            </div>
                          ) : (
                            stageVendors.map(vendor => (
                              <div
                                key={vendor.id}
                                className="p-3 border border-slate-200 rounded-lg hover:border-sky-300 hover:bg-sky-50/30 transition-all cursor-move"
                              >
                                <p className="text-sm font-medium text-slate-900">{vendor.name}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs text-slate-500">View details</span>
                                  <ArrowRight className="w-3 h-3 text-slate-400" />
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Rejected Column */}
                <div className="flex-shrink-0 w-80">
                  <div className="rounded-xl border border-red-200/60 bg-red-50/50 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-red-50 to-red-100 px-4 py-3 border-b border-red-200">
                      <h3 className="font-semibold text-red-900">Rejected</h3>
                      <p className="text-xs text-red-700 mt-1">
                        {onboardingVendors.filter(v => v.stage === 'rejected').length} vendor{onboardingVendors.filter(v => v.stage === 'rejected').length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="p-3 space-y-3">
                      {onboardingVendors.filter(v => v.stage === 'rejected').length === 0 ? (
                        <div className="text-center py-8 text-red-400">
                          <p className="text-sm">No vendors</p>
                        </div>
                      ) : (
                        onboardingVendors.filter(v => v.stage === 'rejected').map(vendor => (
                          <div
                            key={vendor.id}
                            className="p-3 border border-red-200 rounded-lg bg-white hover:bg-red-50/30 transition-all cursor-move"
                          >
                            <p className="text-sm font-medium text-slate-900">{vendor.name}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-red-600">View details</span>
                              <ArrowRight className="w-3 h-3 text-red-400" />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <CreateVendorModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateVendor}
      />

      {/* Vendor Detail Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-sky-50 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedVendor.name}</h2>
                <div className="flex items-center gap-3 mt-2">
                  {selectedVendor.industry && (
                    <span className="text-sm text-slate-600">{selectedVendor.industry}</span>
                  )}
                  {selectedVendor.risk_level && (
                    <span className={cn('text-xs font-medium px-2 py-1 rounded-full',
                      riskConfig[selectedVendor.risk_level]?.bg || 'bg-slate-100',
                      riskConfig[selectedVendor.risk_level]?.color || 'text-slate-600'
                    )}>
                      {riskConfig[selectedVendor.risk_level]?.label || 'Unknown'}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedVendor(null)}
                className="p-2 hover:bg-slate-200/50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* Vendor Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Status</p>
                  <p className="text-sm text-slate-900">{statusConfig[selectedVendor.status]?.label || selectedVendor.status}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Tier</p>
                  <p className="text-sm text-slate-900">{selectedVendor.tier || '-'}</p>
                </div>
                {selectedVendor.contact_email && (
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Contact Email</p>
                    <p className="text-sm text-slate-900">{selectedVendor.contact_email}</p>
                  </div>
                )}
                {selectedVendor.contract_start_date && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Contract Start</p>
                    <p className="text-sm text-slate-900">{new Date(selectedVendor.contract_start_date).toLocaleDateString()}</p>
                  </div>
                )}
                {selectedVendor.contract_end_date && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Contract End</p>
                    <p className="text-sm text-slate-900">{new Date(selectedVendor.contract_end_date).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {/* Assessments Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Assessments</h3>
                  <button
                    onClick={() => handleAddAssessment(selectedVendor.id)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium bg-sky-500 hover:bg-sky-600 text-white transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Assessment
                  </button>
                </div>

                {assessmentLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="w-5 h-5 animate-spin text-sky-500" />
                  </div>
                ) : assessments.length > 0 ? (
                  <div className="space-y-3">
                    {assessments.map((assessment: any) => (
                      <div key={assessment.id} className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900">{assessment.name || 'Assessment'}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {assessment.created_at ? new Date(assessment.created_at).toLocaleDateString() : 'Date unknown'}
                            </p>
                          </div>
                          <span className={cn(
                            'text-xs font-medium px-2 py-1 rounded-full',
                            assessment.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            assessment.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-600'
                          )}>
                            {assessment.status || 'pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-slate-500">No assessments yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-slate-200/60 bg-slate-50/50 flex items-center justify-end">
              <button
                onClick={() => setSelectedVendor(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
