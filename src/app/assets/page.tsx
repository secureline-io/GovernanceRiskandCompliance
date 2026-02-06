'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Download, Box, Server, Database, Globe, Monitor, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const DEFAULT_ORG_ID = 'default';

interface Asset {
  id: string;
  name: string;
  type: 'server' | 'database' | 'application' | 'network' | 'endpoint' | 'cloud';
  criticality: 'critical' | 'high' | 'medium' | 'low';
  owner: string;
  description: string;
}

const assetTypeIcons = {
  server: Server,
  database: Database,
  application: Globe,
  network: Monitor,
  endpoint: Monitor,
  cloud: Globe,
};

const criticalityColors = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'server' as const,
    criticality: 'medium' as const,
    owner: '',
    description: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('grc_assets');
    if (stored) {
      setAssets(JSON.parse(stored));
    }
  }, []);

  const saveAssets = (newAssets: Asset[]) => {
    setAssets(newAssets);
    localStorage.setItem('grc_assets', JSON.stringify(newAssets));
  };

  const handleAddAsset = () => {
    const newAsset: Asset = {
      id: Date.now().toString(),
      ...formData,
    };
    saveAssets([...assets, newAsset]);
    setFormData({
      name: '',
      type: 'server',
      criticality: 'medium',
      owner: '',
      description: '',
    });
    setShowForm(false);
  };

  const handleDeleteAsset = (id: string) => {
    saveAssets(assets.filter(a => a.id !== id));
  };

  const stats = [
    {
      label: 'Total Assets',
      value: assets.length,
      icon: Box,
      color: 'bg-sky-100',
    },
    {
      label: 'Critical',
      value: assets.filter(a => a.criticality === 'critical').length,
      icon: Server,
      color: 'bg-red-100',
    },
    {
      label: 'High-Risk',
      value: assets.filter(a => a.criticality === 'high').length,
      icon: Database,
      color: 'bg-orange-100',
    },
    {
      label: 'Unassigned',
      value: assets.filter(a => !a.owner).length,
      icon: Globe,
      color: 'bg-slate-100',
    },
  ];

  const exportCSV = () => {
    const headers = ['Name', 'Type', 'Criticality', 'Owner', 'Description'];
    const rows = assets.map(a => [a.name, a.type, a.criticality, a.owner, a.description]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assets.csv';
    a.click();
  };

  return (
    <div className="bg-slate-50/50 p-6 lg:p-8 min-h-screen animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Asset Management</h1>
            <p className="text-slate-600 text-sm mt-1">Track and manage your organization's assets</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportCSV}
              disabled={assets.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Download size={18} />
              Export
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl active:scale-95 transition-all"
            >
              <Plus size={18} />
              Add Asset
            </button>
          </div>
        </div>

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

        {showForm && (
          <Card className="p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-slate-900">Add New Asset</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Asset name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="server">Server</option>
                <option value="database">Database</option>
                <option value="application">Application</option>
                <option value="network">Network</option>
                <option value="endpoint">Endpoint</option>
                <option value="cloud">Cloud</option>
              </select>
              <select
                value={formData.criticality}
                onChange={(e) => setFormData({ ...formData, criticality: e.target.value as any })}
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
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-1 sm:col-span-2 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                onClick={handleAddAsset}
                disabled={!formData.name || !formData.owner}
                className="col-span-1 sm:col-span-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Add Asset
              </button>
            </div>
          </Card>
        )}

        {assets.length === 0 ? (
          <Card className="p-12 text-center">
            <Box size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600 font-medium">No assets yet</p>
            <p className="text-slate-500 text-sm mt-1">Add your first asset to get started</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Name</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Type</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Criticality</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Owner</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Description</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => {
                    const TypeIcon = assetTypeIcons[asset.type];
                    return (
                      <tr key={asset.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">{asset.name}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <TypeIcon size={16} className="text-slate-600" />
                            <span className="text-slate-600 capitalize">{asset.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={cn('px-2.5 py-1 rounded-lg text-xs font-medium border', criticalityColors[asset.criticality])}>
                            {asset.criticality}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{asset.owner || '—'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{asset.description || '—'}</td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleDeleteAsset(asset.id)}
                            className="text-red-600 hover:text-red-700 transition-colors"
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
        )}
      </div>
    </div>
  );
}
