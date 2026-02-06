'use client';

import { useState, useEffect } from 'react';
import {
  Search, Plus, Lock, ExternalLink, Check, ChevronRight,
  Shield, FileText, AlertCircle, CheckCircle, Clock, RefreshCw,
  BarChart3, Filter, Download, Settings, Eye, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CreateFrameworkModal, { FrameworkFormData } from '@/components/modals/CreateFrameworkModal';
import { exportToCSV, exportToJSON, exportToPDF } from '@/lib/export';

interface Framework {
  id: string;
  code: string;
  name: string;
  version: string | null;
  authority: string | null;
  category: string | null;
  description: string | null;
  official_url?: string;
  is_custom: boolean;
  framework_requirements: { count: number }[];
}

interface FrameworkRequirement {
  id: string;
  framework_id: string;
  domain_id?: string;
  code: string;
  name: string;
  description?: string;
  guidance?: string;
  evidence_requirements?: string;
  evidence_examples?: string[];
  domain?: {
    id: string;
    code: string;
    name: string;
  };
}

// Get icon/emoji for framework
const getFrameworkIcon = (code: string) => {
  const icons: Record<string, string> = {
    'SOC2': '🏛️',
    'ISO27001': '🌐',
    'NIST-CSF': '🇺🇸',
    'PCI-DSS': '💳',
    'HIPAA': '🏥',
    'GDPR': '🇪🇺',
    'CIS-CSC': '🔒',
    'CMMC': '🛡️',
    'CSA-CCM': '☁️',
    'ISO22301': '📋',
    'ISO27701': '🔐',
    'NIST-800-171': '📜',
    'COBIT': '⚙️',
    'FedRAMP': '🏛️',
    'SOX': '📊'
  };
  return icons[code] || '📋';
};

const getCategoryColor = (category: string | null) => {
  switch (category) {
    case 'security': return 'bg-blue-100 text-blue-800';
    case 'privacy': return 'bg-purple-100 text-purple-800';
    case 'industry': return 'bg-green-100 text-green-800';
    case 'regional': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState<'my' | 'library'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchFrameworks();
  }, []);

  const fetchFrameworks = async () => {
    try {
      const response = await fetch('/api/frameworks');
      const result = await response.json();
      if (result.data) {
        setFrameworks(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch frameworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFramework = async (data: FrameworkFormData) => {
    try {
      const response = await fetch('/api/frameworks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create framework');
      }

      alert('Framework created successfully!');
      fetchFrameworks(); // Refresh the list
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create framework');
    }
  };

  const handleExportFrameworks = () => {
    const exportData = frameworks.map(fw => ({
      Code: fw.code,
      Name: fw.name,
      Version: fw.version || '-',
      Category: fw.category || '-',
      Authority: fw.authority || '-',
      Requirements: getRequirementsCount(fw),
      'Custom Framework': fw.is_custom ? 'Yes' : 'No'
    }));
    exportToCSV(exportData, `frameworks-export-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const categories = [...new Set(frameworks.map(f => f.category).filter(Boolean))];

  const filteredFrameworks = frameworks.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         f.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         f.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || f.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getRequirementsCount = (fw: Framework) => {
    return fw.framework_requirements?.[0]?.count || 0;
  };

  const totalRequirements = frameworks.reduce((sum, f) => sum + getRequirementsCount(f), 0);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
          <p className="text-gray-600 text-sm">Loading frameworks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-sky-600" />
            <h1 className="text-3xl font-bold text-gray-900">Compliance Frameworks</h1>
          </div>
          <p className="text-gray-600 mt-2">{frameworks.length} frameworks • {totalRequirements} total requirements</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportFrameworks}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-gray-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-sm shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-all font-medium text-sm shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Framework</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Frameworks</p>
              <p className="text-3xl font-bold text-gray-900">{frameworks.length}</p>
            </div>
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-sky-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Controls Mapped</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-violet-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Avg Compliance</p>
              <p className="text-3xl font-bold text-gray-900">--</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search frameworks by name, code, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat || ''}>{(cat || 'Other').charAt(0).toUpperCase() + (cat || 'other').slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Filter Pills */}
        {categoryFilter !== 'all' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600">Filters:</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setCategoryFilter('all')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-lg text-sm font-medium hover:bg-sky-100 transition-colors"
              >
                {categoryFilter}
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('library')}
            className={`py-3 px-0.5 border-b-2 font-medium text-sm transition-all ${
              activeTab === 'library'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Frameworks Library
            <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-slate-100 text-gray-700 rounded-full">
              {frameworks.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`py-3 px-0.5 border-b-2 font-medium text-sm transition-all ${
              activeTab === 'my'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            My Frameworks
            <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-slate-100 text-gray-700 rounded-full">
              0
            </span>
          </button>
        </nav>
      </div>

      {/* Framework Cards Grid */}
      {activeTab === 'library' && (
        <>
          {filteredFrameworks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
              {filteredFrameworks.map((framework, index) => (
                <div
                  key={framework.id}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="animate-fadeIn"
                >
                  <div
                    onClick={() => setSelectedFramework(framework)}
                    className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 hover:shadow-md hover:border-sky-200 transition-all cursor-pointer group h-full flex flex-col"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-4xl">{getFrameworkIcon(framework.code)}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-sky-600 transition-colors line-clamp-2">
                            {framework.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">{framework.code}</p>
                        </div>
                      </div>
                    </div>

                    {/* Version Badge */}
                    {framework.version && (
                      <div className="mb-3">
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-slate-100 text-gray-700 rounded-lg">
                          v{framework.version}
                        </span>
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                      {framework.description || 'No description available'}
                    </p>

                    {/* Compliance Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Compliance</span>
                        <span className="text-2xl font-bold text-sky-600">0%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500 rounded-full" style={{ width: '0%' }} />
                      </div>
                    </div>

                    {/* Category & Authority Badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      {framework.category && (
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${getCategoryColor(framework.category)}`}>
                          {framework.category}
                        </span>
                      )}
                      {framework.authority && (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 text-gray-700">
                          {framework.authority}
                        </span>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-100 my-4" />

                    {/* Footer - Requirements Count */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-2xl font-bold text-gray-900">{getRequirementsCount(framework)}</span>
                        <span className="text-gray-600 ml-2">requirements</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {framework.official_url && (
                          <a
                            href={framework.official_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFramework(framework);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No frameworks configured</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Add your first compliance framework to get started with framework requirements and evidence mapping.
              </p>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-all font-medium shadow-lg shadow-sky-500/20"
              >
                <Plus className="w-4 h-4" />
                Add Your First Framework
              </button>
            </div>
          )}
        </>
      )}

      {/* My Frameworks Tab */}
      {activeTab === 'my' && (
        <div className="text-center py-20">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No frameworks adopted yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start your compliance journey by adopting frameworks from the library.
            Each framework comes with detailed requirements and evidence guidance.
          </p>
          <button
            onClick={() => setActiveTab('library')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-all font-medium shadow-lg shadow-sky-500/20"
          >
            Browse Frameworks Library
          </button>
        </div>
      )}

      {/* Framework Details Modal */}
      {selectedFramework && (
        <FrameworkDetailsModal
          framework={selectedFramework}
          onClose={() => setSelectedFramework(null)}
        />
      )}

      {/* Create Framework Modal */}
      <CreateFrameworkModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateFramework}
      />
    </div>
  );
}

// Framework Details Modal Component
function FrameworkDetailsModal({
  framework,
  onClose
}: {
  framework: Framework;
  onClose: () => void;
}) {
  const [requirements, setRequirements] = useState<FrameworkRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'all' | 'by-domain'>('by-domain');
  const [searchReq, setSearchReq] = useState('');

  useEffect(() => {
    fetchRequirements();
  }, [framework.id]);

  const fetchRequirements = async () => {
    try {
      const response = await fetch(`/api/frameworks/${framework.id}/requirements`);
      const result = await response.json();
      if (result.data) {
        setRequirements(result.data);
      }
    } catch (error) {
      console.error('Error fetching requirements:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter requirements by search
  const filteredRequirements = requirements.filter(req =>
    req.code.toLowerCase().includes(searchReq.toLowerCase()) ||
    req.name.toLowerCase().includes(searchReq.toLowerCase()) ||
    req.description?.toLowerCase().includes(searchReq.toLowerCase())
  );

  // Group requirements by domain
  const groupedRequirements = filteredRequirements.reduce((acc, req) => {
    const domainName = req.domain?.name || 'General';
    const domainCode = req.domain?.code || 'GEN';
    const key = `${domainCode}|${domainName}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(req);
    return acc;
  }, {} as Record<string, FrameworkRequirement[]>);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 via-sky-50 to-slate-50">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{getFrameworkIcon(framework.code)}</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{framework.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-mono text-sm font-semibold bg-white px-2.5 py-1 rounded-lg text-sky-700 border border-sky-200">{framework.code}</span>
                  {framework.version && <span className="text-sm text-gray-600">v{framework.version}</span>}
                  {framework.authority && <span className="text-sm text-gray-600">• {framework.authority}</span>}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200/50 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {framework.description && (
            <p className="text-gray-700 max-w-3xl mb-6">{framework.description}</p>
          )}

          <div className="flex items-center gap-6 flex-wrap">
            <div className="bg-white/80 backdrop-blur px-4 py-3 rounded-xl border border-slate-200/60 shadow-sm">
              <span className="text-2xl font-bold text-sky-600">{requirements.length}</span>
              <span className="text-xs font-medium text-gray-600 ml-2 block mt-0.5">Requirements</span>
            </div>
            <div className="bg-white/80 backdrop-blur px-4 py-3 rounded-xl border border-slate-200/60 shadow-sm">
              <span className="text-2xl font-bold text-violet-600">{Object.keys(groupedRequirements).length}</span>
              <span className="text-xs font-medium text-gray-600 ml-2 block mt-0.5">Domains</span>
            </div>
            <div className="ml-auto flex gap-3">
              <button
                onClick={() => {
                  const exportData = requirements.map(req => ({
                    Code: req.code,
                    Name: req.name,
                    Domain: req.domain?.name || 'General',
                    Description: req.description || '-',
                    Guidance: req.guidance || '-',
                    'Evidence Requirements': req.evidence_requirements || '-',
                    'Evidence Examples': req.evidence_examples?.join('; ') || '-'
                  }));
                  exportToCSV(exportData, `${framework.code}-requirements-${new Date().toISOString().split('T')[0]}.csv`);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-sm"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-all font-medium text-sm shadow-lg shadow-sky-500/20">
                <Plus className="w-4 h-4" />
                Adopt Framework
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-slate-200/60 bg-slate-50/50 flex items-center gap-4">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search requirements..."
              value={searchReq}
              onChange={(e) => setSearchReq(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-slate-200">
            <button
              onClick={() => setViewMode('by-domain')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'by-domain' ? 'bg-sky-100 text-sky-700' : 'text-gray-600 hover:bg-slate-100'
              }`}
            >
              By Domain
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'all' ? 'bg-sky-100 text-sky-700' : 'text-gray-600 hover:bg-slate-100'
              }`}
            >
              All Requirements
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
                <p className="text-sm text-gray-600">Loading requirements...</p>
              </div>
            </div>
          ) : viewMode === 'by-domain' ? (
            <div className="divide-y divide-slate-200/60">
              {Object.entries(groupedRequirements).map(([key, reqs]) => {
                const [domainCode, domainName] = key.split('|');
                return (
                  <DomainSection
                    key={key}
                    domainCode={domainCode}
                    domainName={domainName}
                    requirements={reqs}
                  />
                );
              })}
            </div>
          ) : (
            <div className="divide-y divide-slate-200/60">
              {filteredRequirements.map((req) => (
                <RequirementRow key={req.id} requirement={req} showDomain />
              ))}
            </div>
          )}

          {filteredRequirements.length === 0 && !loading && (
            <div className="text-center py-16">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No requirements found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Domain Section Component
function DomainSection({
  domainCode,
  domainName,
  requirements
}: {
  domainCode: string;
  domainName: string;
  requirements: FrameworkRequirement[];
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between transition-colors border-t border-slate-200/60"
      >
        <div className="flex items-center gap-3">
          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          <span className="font-mono text-sm bg-sky-100 text-sky-700 px-2.5 py-0.5 rounded-lg font-semibold">{domainCode}</span>
          <span className="font-semibold text-gray-900">{domainName}</span>
        </div>
        <span className="text-sm text-gray-500 font-medium">{requirements.length} requirements</span>
      </button>
      {expanded && (
        <div className="divide-y divide-slate-200/60 border-l-4 border-sky-200 bg-sky-50/30">
          {requirements.map((req) => (
            <RequirementRow key={req.id} requirement={req} />
          ))}
        </div>
      )}
    </div>
  );
}

// Requirement Row Component
function RequirementRow({
  requirement,
  showDomain = false
}: {
  requirement: FrameworkRequirement;
  showDomain?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`${expanded ? 'bg-sky-50/50' : 'hover:bg-slate-50/40'} transition-colors`}>
      <div
        className="px-6 py-4 cursor-pointer flex items-start gap-4"
        onClick={() => setExpanded(!expanded)}
      >
        <ChevronRight className={`w-5 h-5 text-gray-400 mt-0.5 transition-transform flex-shrink-0 ${expanded ? 'rotate-90' : ''}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm text-sky-600 font-semibold bg-sky-50 px-2.5 py-0.5 rounded-lg">{requirement.code}</span>
            {showDomain && requirement.domain && (
              <span className="text-xs bg-slate-100 px-2.5 py-0.5 rounded-lg text-gray-600 font-medium">
                {requirement.domain.name}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-900 mt-2 font-medium">{requirement.name}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 text-gray-700">
            Not assessed
          </span>
        </div>
      </div>

      {expanded && (
        <div className="px-6 pb-5 pl-14 space-y-4 bg-white/50">
          {requirement.description && (
            <div className="bg-white rounded-xl p-4 border border-slate-200/60">
              <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Description</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{requirement.description}</p>
            </div>
          )}

          {requirement.guidance && (
            <div className="bg-white rounded-xl p-4 border border-slate-200/60">
              <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Implementation Guidance</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{requirement.guidance}</p>
            </div>
          )}

          {requirement.evidence_requirements && (
            <div className="bg-white rounded-xl p-4 border border-slate-200/60">
              <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Evidence Requirements</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{requirement.evidence_requirements}</p>
            </div>
          )}

          {requirement.evidence_examples && requirement.evidence_examples.length > 0 && (
            <div className="bg-white rounded-xl p-4 border border-slate-200/60">
              <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Example Evidence Types</h4>
              <div className="flex flex-wrap gap-2">
                {requirement.evidence_examples.map((example, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 text-sm rounded-lg border border-sky-200 font-medium"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {example}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-3 flex-wrap">
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all font-medium shadow-sm">
              <Settings className="w-4 h-4" />
              Map Control
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-all font-medium">
              <FileText className="w-4 h-4" />
              Upload Evidence
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-all font-medium">
              <CheckCircle className="w-4 h-4" />
              Mark Compliant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
