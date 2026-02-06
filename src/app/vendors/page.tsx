'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Building2, Plus, Download, Search, RefreshCw, AlertTriangle,
  CheckCircle2, Clock, Eye, X, Loader
} from 'lucide-react';
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

  const [filter, setFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [assessments, setAssessments] = useState<any[]>([]);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/vendors?org_id=${orgId}`);
      const json = await res.json();
      const data = json.data || json || [];
      setVendors(Array.isArray(data) ? data : []);
    } catch { setVendors([]); }
    finally { setLoading(false); }
  }, [orgId]);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

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

  const handleViewAssessment = async (vendor: any) => {
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
        await handleViewAssessment(selectedVendor);
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

  const isOverdue = (lastAssessedAt: string | null) => {
    if (!lastAssessedAt) return false;
    const assessed = new Date(lastAssessedAt);
    const now = new Date();
    const daysSince = (now.getTime() - assessed.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 90;
  };

  if (loading) {
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
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
          {/* Total Vendors */}
          <div className="rounded-xl border border-slate-200/60 bg-white p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 text-slate-500">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Total Vendors</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalVendors}</p>
            </div>
          </div>

          {/* Active */}
          <div className="rounded-xl border border-slate-200/60 bg-white p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Active</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{activeVendors}</p>
            </div>
          </div>

          {/* High Risk */}
          <div className="rounded-xl border border-slate-200/60 bg-white p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-100 text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">High Risk</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{highRiskVendors}</p>
            </div>
          </div>

          {/* Pending Review */}
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
                    const overdue = isOverdue(vendor.last_assessed_at);

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
