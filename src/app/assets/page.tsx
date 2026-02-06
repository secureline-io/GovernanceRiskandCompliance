'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  X,
  Search,
  Server,
  Database,
  Globe,
  Monitor,
  Cloud,
  Key,
  Smartphone,
  Users,
  GitBranch,
  Shield,
  Box,
  Trash2,
  ChevronDown,
  MoreVertical,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/AuthContext';

interface Asset {
  id: string;
  name: string;
  type:
    | 'compute'
    | 'container'
    | 'storage'
    | 'vpc'
    | 'serverless'
    | 'monitoring'
    | 'keymanagement'
    | 'mobile'
    | 'iamuser'
    | 'iamrole'
    | 'iamgroup'
    | 'repository'
    | 'endpoint'
    | 'other';
  criticality: 'critical' | 'high' | 'medium' | 'low';
  owner: string;
  description: string;
  cloudProvider: string;
  region: string;
  status: 'active' | 'inactive' | 'decommissioned';
  lastScanned: string;
}

interface FormData {
  name: string;
  type: Asset['type'];
  criticality: Asset['criticality'];
  owner: string;
  description: string;
  cloudProvider: string;
  region: string;
}

const assetCategories = [
  { id: 'compute', label: 'Compute Instances', icon: Server },
  { id: 'container', label: 'Container Platforms', icon: Box },
  { id: 'storage', label: 'Storage & Databases', icon: Database },
  { id: 'vpc', label: 'VPCs & Networking', icon: Globe },
  { id: 'serverless', label: 'Serverless Functions', icon: Cloud },
  { id: 'monitoring', label: 'Monitoring & Logging', icon: Monitor },
  { id: 'keymanagement', label: 'Key Management', icon: Key },
  { id: 'mobile', label: 'Mobile Devices', icon: Smartphone },
  { id: 'iamuser', label: 'IAM Users', icon: Users },
  { id: 'iamrole', label: 'IAM Roles', icon: Shield },
  { id: 'iamgroup', label: 'IAM Groups', icon: Users },
  { id: 'repository', label: 'Code Repositories', icon: GitBranch },
  { id: 'endpoint', label: 'Endpoints', icon: Globe },
  { id: 'other', label: 'Other', icon: Box },
] as const;

const assetTypeIcons: Record<Asset['type'], typeof Server> = {
  compute: Server,
  container: Box,
  storage: Database,
  vpc: Globe,
  serverless: Cloud,
  monitoring: Monitor,
  keymanagement: Key,
  mobile: Smartphone,
  iamuser: Users,
  iamrole: Shield,
  iamgroup: Users,
  repository: GitBranch,
  endpoint: Globe,
  other: Box,
};

const criticialityColors = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const statusColors = {
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  inactive: 'bg-slate-100 text-slate-800 border-slate-200',
  decommissioned: 'bg-red-100 text-red-800 border-red-200',
};

export default function AssetsPage() {
  const { currentOrg } = useAuth();
  const [assets, setAssets] = useState<Asset[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('grc_assets');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: 'compute',
    criticality: 'medium',
    owner: '',
    description: '',
    cloudProvider: '',
    region: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const saveAssets = (newAssets: Asset[]) => {
    setAssets(newAssets);
    localStorage.setItem('grc_assets', JSON.stringify(newAssets));
  };

  const handleAddAsset = () => {
    if (!formData.name || !formData.owner) return;

    const newAsset: Asset = {
      id: Date.now().toString(),
      ...formData,
      status: 'active',
      lastScanned: new Date().toISOString().split('T')[0],
    };

    saveAssets([...assets, newAsset]);
    setFormData({
      name: '',
      type: 'compute',
      criticality: 'medium',
      owner: '',
      description: '',
      cloudProvider: '',
      region: '',
    });
    setShowForm(false);
    setCurrentPage(1);
  };

  const handleDeleteAsset = (id: string) => {
    saveAssets(assets.filter((a) => a.id !== id));
  };

  // Filter assets based on category and search
  const filteredAssets = assets.filter((asset) => {
    const matchesCategory = !selectedCategory || asset.type === selectedCategory;
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.cloudProvider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Category counts
  const categoryCounts = assetCategories.map((cat) => ({
    ...cat,
    count: assets.filter((a) => a.type === cat.id).length,
  }));

  // Stats
  const stats = [
    {
      label: 'Total Assets',
      value: assets.length,
      icon: Box,
      color: 'bg-sky-100',
    },
    {
      label: 'Critical',
      value: assets.filter((a) => a.criticality === 'critical').length,
      icon: Server,
      color: 'bg-red-100',
    },
    {
      label: 'High-Risk',
      value: assets.filter((a) => a.criticality === 'high').length,
      icon: Shield,
      color: 'bg-orange-100',
    },
    {
      label: 'Unassigned',
      value: assets.filter((a) => !a.owner).length,
      icon: Users,
      color: 'bg-slate-100',
    },
  ];

  return (
    <div className="flex h-full bg-slate-50/50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white overflow-y-auto">
        <div className="p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Asset Categories</h2>

          {/* All Assets */}
          <button
            onClick={() => {
              setSelectedCategory(null);
              setCurrentPage(1);
            }}
            className={cn(
              'w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1',
              !selectedCategory
                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                : 'text-slate-700 hover:bg-slate-50'
            )}
          >
            <div className="flex items-center justify-between">
              <span>All Assets</span>
              <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-1 rounded">
                {assets.length}
              </span>
            </div>
          </button>

          {/* Category List */}
          <div className="space-y-1 mt-3">
            {categoryCounts.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between',
                    isSelected
                      ? 'bg-sky-50 text-sky-700 border border-sky-200'
                      : 'text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={16} />
                    <span className="truncate">{category.label}</span>
                  </div>
                  <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-1 rounded">
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 min-h-screen">
          <div className="max-w-6xl">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">Asset Management</h1>
              <p className="text-slate-600 text-sm mt-1">
                Track and manage your organization's assets across all cloud providers
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <Card key={idx} className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-slate-600">{stat.label}</p>
                        <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                      </div>
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.color)}>
                        <Icon size={20} className="text-slate-700" />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Add Asset Form */}
            {showForm && (
              <Card className="p-6 mb-8 bg-white">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-slate-900 text-lg">Add New Asset</h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Asset Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as Asset['type'] })
                    }
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {assetCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={formData.criticality}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        criticality: e.target.value as Asset['criticality'],
                      })
                    }
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Owner"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <input
                    type="text"
                    placeholder="Cloud Provider"
                    value={formData.cloudProvider}
                    onChange={(e) =>
                      setFormData({ ...formData, cloudProvider: e.target.value })
                    }
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <input
                    type="text"
                    placeholder="Region"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="col-span-1 sm:col-span-2 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                    rows={2}
                  />
                  <div className="col-span-1 sm:col-span-2 flex gap-3">
                    <button
                      onClick={handleAddAsset}
                      disabled={!formData.name || !formData.owner}
                      className="flex-1 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                    >
                      Add Asset
                    </button>
                    <button
                      onClick={() => setShowForm(false)}
                      className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </Card>
            )}

            {/* Search and Add Button */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search assets by name, owner, or cloud provider..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                />
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg active:scale-95 transition-all font-medium whitespace-nowrap"
              >
                <Plus size={18} />
                Add Asset
              </button>
            </div>

            {/* Assets Table */}
            {assets.length === 0 ? (
              <Card className="p-12 text-center bg-white">
                <Box size={48} className="mx-auto text-slate-400 mb-4" />
                <p className="text-slate-900 font-medium text-lg">No assets yet</p>
                <p className="text-slate-600 text-sm mt-1">Add your first asset to get started</p>
              </Card>
            ) : filteredAssets.length === 0 ? (
              <Card className="p-12 text-center bg-white">
                <Search size={48} className="mx-auto text-slate-400 mb-4" />
                <p className="text-slate-900 font-medium text-lg">No assets found</p>
                <p className="text-slate-600 text-sm mt-1">Try adjusting your filters or search query</p>
              </Card>
            ) : (
              <>
                <Card className="overflow-hidden bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Name</th>
                          <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Type</th>
                          <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Criticality</th>
                          <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Owner</th>
                          <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Cloud Provider</th>
                          <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Region</th>
                          <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Status</th>
                          <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Last Scanned</th>
                          <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedAssets.map((asset) => {
                          const TypeIcon = assetTypeIcons[asset.type];
                          const categoryLabel = assetCategories.find(
                            (cat) => cat.id === asset.type
                          )?.label;

                          return (
                            <tr
                              key={asset.id}
                              className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                            >
                              <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                {asset.name}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <TypeIcon size={16} className="text-slate-600" />
                                  <span className="text-slate-600">{categoryLabel}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <span
                                  className={cn(
                                    'px-2.5 py-1 rounded-lg text-xs font-medium border',
                                    criticialityColors[asset.criticality]
                                  )}
                                >
                                  {asset.criticality.charAt(0).toUpperCase() +
                                    asset.criticality.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                {asset.owner || '—'}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                {asset.cloudProvider || '—'}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                {asset.region || '—'}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <span
                                  className={cn(
                                    'px-2.5 py-1 rounded-lg text-xs font-medium border',
                                    statusColors[asset.status]
                                  )}
                                >
                                  {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                {asset.lastScanned || '—'}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <button
                                  onClick={() => handleDeleteAsset(asset.id)}
                                  className="text-red-600 hover:text-red-700 transition-colors p-1 hover:bg-red-50 rounded"
                                  title="Delete asset"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                      {Math.min(currentPage * itemsPerPage, filteredAssets.length)} of{' '}
                      {filteredAssets.length} assets
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={cn(
                              'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                              currentPage === page
                                ? 'bg-sky-500 text-white'
                                : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                            )}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
