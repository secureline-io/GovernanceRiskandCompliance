'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Cloud,
  Github,
  GitBranch,
  Zap,
  MessageSquare,
  Shield,
  BarChart3,
  Search,
  Plus,
  Settings,
  Link2,
  Check,
  AlertCircle,
  Clock,
  RefreshCw,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
interface Integration {
  id: string;
  name: string;
  category: 'cloud' | 'devops' | 'communication' | 'identity' | 'monitoring';
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'pending';
  lastSync?: string;
  brand?: string;
  brandColor?: string;
}

interface IntegrationState {
  [key: string]: {
    status: 'connected' | 'disconnected' | 'pending';
    lastSync?: string;
  };
}

type CategoryType = 'all' | 'cloud' | 'devops' | 'communication' | 'identity' | 'monitoring';

// Mock data
const INTEGRATIONS: Integration[] = [
  // Cloud Providers
  {
    id: 'aws',
    name: 'Amazon AWS',
    category: 'cloud',
    icon: <Cloud className="w-6 h-6" />,
    status: 'connected',
    lastSync: '2 minutes ago',
    brand: 'AWS',
    brandColor: 'bg-orange-100 text-orange-700',
  },
  {
    id: 'azure',
    name: 'Microsoft Azure',
    category: 'cloud',
    icon: <Cloud className="w-6 h-6" />,
    status: 'connected',
    lastSync: '5 minutes ago',
    brand: 'Azure',
    brandColor: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'gcp',
    name: 'Google Cloud',
    category: 'cloud',
    icon: <Cloud className="w-6 h-6" />,
    status: 'disconnected',
    brand: 'GCP',
    brandColor: 'bg-red-100 text-red-700',
  },

  // DevOps
  {
    id: 'github',
    name: 'GitHub',
    category: 'devops',
    icon: <Github className="w-6 h-6" />,
    status: 'connected',
    lastSync: '1 minute ago',
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    category: 'devops',
    icon: <GitBranch className="w-6 h-6" />,
    status: 'disconnected',
  },
  {
    id: 'jira',
    name: 'Jira',
    category: 'devops',
    icon: <Zap className="w-6 h-6" />,
    status: 'connected',
    lastSync: '3 minutes ago',
  },
  {
    id: 'jenkins',
    name: 'Jenkins',
    category: 'devops',
    icon: <RefreshCw className="w-6 h-6" />,
    status: 'pending',
  },

  // Communication
  {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    icon: <MessageSquare className="w-6 h-6" />,
    status: 'connected',
    lastSync: '30 seconds ago',
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    category: 'communication',
    icon: <MessageSquare className="w-6 h-6" />,
    status: 'disconnected',
  },
  {
    id: 'pagerduty',
    name: 'PagerDuty',
    category: 'communication',
    icon: <AlertCircle className="w-6 h-6" />,
    status: 'connected',
    lastSync: '10 minutes ago',
  },

  // Identity
  {
    id: 'okta',
    name: 'Okta',
    category: 'identity',
    icon: <Shield className="w-6 h-6" />,
    status: 'connected',
    lastSync: '15 minutes ago',
  },
  {
    id: 'azure-ad',
    name: 'Azure AD',
    category: 'identity',
    icon: <Shield className="w-6 h-6" />,
    status: 'pending',
  },
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    category: 'identity',
    icon: <Shield className="w-6 h-6" />,
    status: 'connected',
    lastSync: '8 minutes ago',
  },

  // Monitoring
  {
    id: 'datadog',
    name: 'Datadog',
    category: 'monitoring',
    icon: <BarChart3 className="w-6 h-6" />,
    status: 'connected',
    lastSync: '45 seconds ago',
  },
  {
    id: 'splunk',
    name: 'Splunk',
    category: 'monitoring',
    icon: <BarChart3 className="w-6 h-6" />,
    status: 'disconnected',
  },
  {
    id: 'cloudwatch',
    name: 'CloudWatch',
    category: 'monitoring',
    icon: <BarChart3 className="w-6 h-6" />,
    status: 'connected',
    lastSync: '1 minute ago',
  },
];

// Category labels
const CATEGORY_LABELS: Record<CategoryType, string> = {
  all: 'All Integrations',
  cloud: 'Cloud Providers',
  devops: 'DevOps',
  communication: 'Communication',
  identity: 'Identity',
  monitoring: 'Monitoring',
};

export default function IntegrationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [integrationStates, setIntegrationStates] = useState<IntegrationState>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set());

  // Initialize integration states from localStorage
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);

    const saved = localStorage.getItem('integrationStates');
    if (saved) {
      try {
        setIntegrationStates(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load integration states:', e);
      }
    } else {
      // Initialize from mock data
      const initialStates: IntegrationState = {};
      INTEGRATIONS.forEach((integration) => {
        initialStates[integration.id] = {
          status: integration.status,
          lastSync: integration.lastSync,
        };
      });
      setIntegrationStates(initialStates);
    }

    return () => clearTimeout(timer);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (Object.keys(integrationStates).length > 0) {
      localStorage.setItem('integrationStates', JSON.stringify(integrationStates));
    }
  }, [integrationStates]);

  const toggleIntegrationStatus = useCallback((id: string) => {
    setIntegrationStates((prev) => {
      const current = prev[id] || { status: 'disconnected' };
      const newStatus = current.status === 'connected' ? 'disconnected' : 'connected';
      return {
        ...prev,
        [id]: {
          status: newStatus,
          lastSync: newStatus === 'connected' ? 'Just now' : current.lastSync,
        },
      };
    });
  }, []);

  const toggleShowPassword = (id: string) => {
    const newSet = new Set(showPasswords);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setShowPasswords(newSet);
  };

  // Filter integrations
  const filteredIntegrations = INTEGRATIONS.filter((integration) => {
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    const matchesSearch =
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate stats
  const stats = {
    total: INTEGRATIONS.length,
    connected: Object.values(integrationStates).filter((s) => s.status === 'connected').length,
    pending: Object.values(integrationStates).filter((s) => s.status === 'pending').length,
    errors: 0,
  };

  // Group integrations by category
  const groupedIntegrations = filteredIntegrations.reduce(
    (acc, integration) => {
      const category = integration.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(integration);
      return acc;
    },
    {} as Record<string, Integration[]>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-200/60 bg-white sticky top-0 z-10">
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Integrations</h1>
              <p className="text-slate-500 text-sm mt-1">Manage and monitor your connected tools</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Integration
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60">
              <p className="text-slate-600 text-xs font-medium">Total Integrations</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200/60">
              <p className="text-emerald-600 text-xs font-medium">Connected</p>
              <p className="text-2xl font-bold text-emerald-900 mt-1">{stats.connected}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/60">
              <p className="text-amber-600 text-xs font-medium">Pending</p>
              <p className="text-2xl font-bold text-amber-900 mt-1">{stats.pending}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60">
              <p className="text-slate-600 text-xs font-medium">Sync Errors</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.errors}</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200/60 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {(['all', 'cloud', 'devops', 'communication', 'identity', 'monitoring'] as CategoryType[]).map(
              (category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-white border border-slate-200/60 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {CATEGORY_LABELS[category]}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {isLoading ? (
          // Skeleton Loading State
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-slate-200 to-slate-300" />
                        <div className="flex-1">
                          <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-24" />
                        </div>
                      </div>
                      <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-32" />
                      <div className="h-2 bg-gradient-to-r from-slate-200 to-slate-300 rounded" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : filteredIntegrations.length === 0 ? (
          // Empty State
          <Card className="border-slate-200/60">
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                  <Link2 className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">No integrations found</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    {searchQuery
                      ? 'Try adjusting your search terms'
                      : 'Get started by adding your first integration'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Integrations Grid
          <div className="space-y-8">
            {Object.entries(groupedIntegrations).map(([category, integrations]) => (
              <div key={category} className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  {CATEGORY_LABELS[category as CategoryType]}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {integrations.map((integration) => {
                    const state = integrationStates[integration.id] || {
                      status: integration.status,
                      lastSync: integration.lastSync,
                    };
                    const isConnected = state.status === 'connected';
                    const isPending = state.status === 'pending';

                    return (
                      <Card
                        key={integration.id}
                        className="border-slate-200/60 hover:border-sky-200/60 transition-all hover:shadow-md"
                      >
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                                  {integration.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-slate-900 text-sm truncate">
                                    {integration.name}
                                  </h3>
                                  {integration.brand && (
                                    <span
                                      className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${integration.brandColor}`}
                                    >
                                      {integration.brand}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center gap-2">
                              {isConnected && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 rounded-lg">
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-xs font-medium text-emerald-700">Connected</span>
                                </div>
                              )}
                              {!isConnected && !isPending && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg">
                                  <X className="w-3.5 h-3.5 text-slate-500" />
                                  <span className="text-xs font-medium text-slate-600">Disconnected</span>
                                </div>
                              )}
                              {isPending && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 rounded-lg">
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  <span className="text-xs font-medium text-amber-700">Pending</span>
                                </div>
                              )}
                            </div>

                            {/* Last Sync */}
                            {state.lastSync && (
                              <div className="text-xs text-slate-500 flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" />
                                Last sync: {state.lastSync}
                              </div>
                            )}

                            {/* API Key Input (if disconnected) */}
                            {!isConnected && (
                              <div className="space-y-2 pt-2 border-t border-slate-200/60">
                                <label className="block text-xs font-medium text-slate-700">
                                  API Key
                                </label>
                                <div className="relative">
                                  <input
                                    type={showPasswords.has(integration.id) ? 'text' : 'password'}
                                    placeholder="Enter API key"
                                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
                                  />
                                  <button
                                    onClick={() => toggleShowPassword(integration.id)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                  >
                                    {showPasswords.has(integration.id) ? (
                                      <EyeOff className="w-3.5 h-3.5" />
                                    ) : (
                                      <Eye className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <button
                              onClick={() => toggleIntegrationStatus(integration.id)}
                              className={`w-full py-2 rounded-xl font-medium text-sm transition-all ${
                                isConnected
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                  : 'bg-sky-500 hover:bg-sky-600 text-white'
                              }`}
                            >
                              {isConnected ? (
                                <span className="flex items-center justify-center gap-2">
                                  <Settings className="w-4 h-4" />
                                  Configure
                                </span>
                              ) : isPending ? (
                                <span className="flex items-center justify-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  Pending Setup
                                </span>
                              ) : (
                                <span className="flex items-center justify-center gap-2">
                                  <Link2 className="w-4 h-4" />
                                  Connect
                                </span>
                              )}
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Integration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-slate-200/60 animate-fadeIn">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Add New Integration</CardTitle>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Integration Type
                </label>
                <select className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent bg-white text-slate-900 text-sm">
                  <option>Choose an integration...</option>
                  {INTEGRATIONS.map((integration) => (
                    <option key={integration.id}>{integration.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">API Key</label>
                <input
                  type="password"
                  placeholder="Enter your API key"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent bg-white text-slate-900 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium text-sm transition-colors"
                >
                  Add Integration
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
