'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Check,
  AlertCircle,
  Settings,
  X,
  Cloud,
  Github,
  GitBranch,
  Shield,
  BarChart3,
  MessageSquare,
  Zap,
  Database,
  Users,
  Lock,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Types
type Category = 'all' | 'cloud' | 'devops' | 'communication' | 'identity' | 'monitoring' | 'ticketing' | 'hris' | 'code-security';
type TabType = 'connected' | 'library';
type SyncStatus = 'connected' | 'syncing' | 'error';

interface IntegrationDef {
  id: string;
  name: string;
  description: string;
  category: Exclude<Category, 'all'>;
  icon: React.ReactNode;
  brandColor: string;
  textColor: string;
}

interface IntegrationState {
  connected: boolean;
  status: SyncStatus;
  lastSynced?: string;
}

interface Toast {
  type: 'success' | 'error';
  message: string;
}

// Mock Integrations Data (40+ integrations)
const INTEGRATION_DEFINITIONS: IntegrationDef[] = [
  // Cloud Providers
  {
    id: 'aws',
    name: 'Amazon AWS',
    description: 'Cloud computing services and infrastructure management',
    category: 'cloud',
    icon: <Cloud className="w-5 h-5" />,
    brandColor: 'bg-orange-100',
    textColor: 'text-orange-600',
  },
  {
    id: 'azure',
    name: 'Microsoft Azure',
    description: 'Microsoft cloud services and platform as a service',
    category: 'cloud',
    icon: <Cloud className="w-5 h-5" />,
    brandColor: 'bg-blue-100',
    textColor: 'text-blue-600',
  },
  {
    id: 'gcp',
    name: 'Google Cloud Platform',
    description: 'Google\'s cloud computing and data services',
    category: 'cloud',
    icon: <Cloud className="w-5 h-5" />,
    brandColor: 'bg-red-100',
    textColor: 'text-red-600',
  },
  {
    id: 'digitalocean',
    name: 'DigitalOcean',
    description: 'Cloud infrastructure and app hosting platform',
    category: 'cloud',
    icon: <Cloud className="w-5 h-5" />,
    brandColor: 'bg-blue-100',
    textColor: 'text-blue-600',
  },
  {
    id: 'oracle-cloud',
    name: 'Oracle Cloud',
    description: 'Enterprise cloud infrastructure and services',
    category: 'cloud',
    icon: <Cloud className="w-5 h-5" />,
    brandColor: 'bg-red-100',
    textColor: 'text-red-600',
  },

  // DevOps & CI/CD
  {
    id: 'github',
    name: 'GitHub',
    description: 'Version control, CI/CD, and code collaboration platform',
    category: 'devops',
    icon: <Github className="w-5 h-5" />,
    brandColor: 'bg-slate-100',
    textColor: 'text-slate-700',
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    description: 'DevOps platform with integrated CI/CD pipelines',
    category: 'devops',
    icon: <GitBranch className="w-5 h-5" />,
    brandColor: 'bg-orange-100',
    textColor: 'text-orange-600',
  },
  {
    id: 'bitbucket',
    name: 'Bitbucket',
    description: 'Git repository management and CI/CD by Atlassian',
    category: 'devops',
    icon: <GitBranch className="w-5 h-5" />,
    brandColor: 'bg-blue-100',
    textColor: 'text-blue-600',
  },
  {
    id: 'jenkins',
    name: 'Jenkins',
    description: 'Open-source automation server for CI/CD pipelines',
    category: 'devops',
    icon: <Zap className="w-5 h-5" />,
    brandColor: 'bg-red-100',
    textColor: 'text-red-600',
  },
  {
    id: 'circleci',
    name: 'CircleCI',
    description: 'Cloud-based CI/CD platform for automation',
    category: 'devops',
    icon: <Zap className="w-5 h-5" />,
    brandColor: 'bg-slate-100',
    textColor: 'text-slate-700',
  },
  {
    id: 'terraform',
    name: 'Terraform',
    description: 'Infrastructure as Code for provisioning and management',
    category: 'devops',
    icon: <Database className="w-5 h-5" />,
    brandColor: 'bg-purple-100',
    textColor: 'text-purple-600',
  },

  // Communication
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and collaboration platform',
    category: 'communication',
    icon: <MessageSquare className="w-5 h-5" />,
    brandColor: 'bg-purple-100',
    textColor: 'text-purple-600',
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    description: 'Enterprise collaboration and messaging platform',
    category: 'communication',
    icon: <MessageSquare className="w-5 h-5" />,
    brandColor: 'bg-blue-100',
    textColor: 'text-blue-600',
  },
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    description: 'Productivity suite with email and collaboration tools',
    category: 'communication',
    icon: <MessageSquare className="w-5 h-5" />,
    brandColor: 'bg-blue-100',
    textColor: 'text-blue-600',
  },

  // Identity & Access Management
  {
    id: 'okta',
    name: 'Okta',
    description: 'Identity and access management platform',
    category: 'identity',
    icon: <Shield className="w-5 h-5" />,
    brandColor: 'bg-blue-100',
    textColor: 'text-blue-600',
  },
  {
    id: 'azure-ad',
    name: 'Azure AD',
    description: 'Microsoft\'s cloud-based identity and access service',
    category: 'identity',
    icon: <Shield className="w-5 h-5" />,
    brandColor: 'bg-blue-100',
    textColor: 'text-blue-600',
  },
  {
    id: 'onelogin',
    name: 'OneLogin',
    description: 'Enterprise identity and access management',
    category: 'identity',
    icon: <Shield className="w-5 h-5" />,
    brandColor: 'bg-green-100',
    textColor: 'text-green-600',
  },
  {
    id: 'jumpcloud',
    name: 'JumpCloud',
    description: 'Directory platform for identity and device management',
    category: 'identity',
    icon: <Users className="w-5 h-5" />,
    brandColor: 'bg-yellow-100',
    textColor: 'text-yellow-600',
  },

  // Monitoring & SIEM
  {
    id: 'datadog',
    name: 'Datadog',
    description: 'Cloud monitoring and observability platform',
    category: 'monitoring',
    icon: <BarChart3 className="w-5 h-5" />,
    brandColor: 'bg-purple-100',
    textColor: 'text-purple-600',
  },
  {
    id: 'splunk',
    name: 'Splunk',
    description: 'Log management and SIEM analytics platform',
    category: 'monitoring',
    icon: <BarChart3 className="w-5 h-5" />,
    brandColor: 'bg-yellow-100',
    textColor: 'text-yellow-600',
  },
  {
    id: 'pagerduty',
    name: 'PagerDuty',
    description: 'Incident response and on-call management',
    category: 'monitoring',
    icon: <AlertCircle className="w-5 h-5" />,
    brandColor: 'bg-green-100',
    textColor: 'text-green-600',
  },
  {
    id: 'newrelic',
    name: 'New Relic',
    description: 'Application performance monitoring and observability',
    category: 'monitoring',
    icon: <BarChart3 className="w-5 h-5" />,
    brandColor: 'bg-green-100',
    textColor: 'text-green-600',
  },
  {
    id: 'cloudwatch',
    name: 'AWS CloudWatch',
    description: 'AWS monitoring and logging service',
    category: 'monitoring',
    icon: <Eye className="w-5 h-5" />,
    brandColor: 'bg-orange-100',
    textColor: 'text-orange-600',
  },

  // Ticketing
  {
    id: 'jira',
    name: 'Jira',
    description: 'Issue tracking and project management by Atlassian',
    category: 'ticketing',
    icon: <Zap className="w-5 h-5" />,
    brandColor: 'bg-blue-100',
    textColor: 'text-blue-600',
  },
  {
    id: 'servicenow',
    name: 'ServiceNow',
    description: 'IT service management and workflow automation platform',
    category: 'ticketing',
    icon: <Database className="w-5 h-5" />,
    brandColor: 'bg-slate-100',
    textColor: 'text-slate-700',
  },
  {
    id: 'freshdesk',
    name: 'Freshdesk',
    description: 'Customer support and ticketing platform',
    category: 'ticketing',
    icon: <MessageSquare className="w-5 h-5" />,
    brandColor: 'bg-blue-100',
    textColor: 'text-blue-600',
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    description: 'Customer support and engagement platform',
    category: 'ticketing',
    icon: <MessageSquare className="w-5 h-5" />,
    brandColor: 'bg-green-100',
    textColor: 'text-green-600',
  },

  // HRIS
  {
    id: 'bamboohr',
    name: 'BambooHR',
    description: 'Human resource management system for small businesses',
    category: 'hris',
    icon: <Users className="w-5 h-5" />,
    brandColor: 'bg-green-100',
    textColor: 'text-green-600',
  },
  {
    id: 'workday',
    name: 'Workday',
    description: 'Enterprise HR and financial management cloud applications',
    category: 'hris',
    icon: <Users className="w-5 h-5" />,
    brandColor: 'bg-blue-100',
    textColor: 'text-blue-600',
  },
  {
    id: 'gusto',
    name: 'Gusto',
    description: 'Payroll, HR, and benefits platform for small businesses',
    category: 'hris',
    icon: <Users className="w-5 h-5" />,
    brandColor: 'bg-purple-100',
    textColor: 'text-purple-600',
  },
  {
    id: 'rippling',
    name: 'Rippling',
    description: 'IT, HR, and Finance management for modern enterprises',
    category: 'hris',
    icon: <Users className="w-5 h-5" />,
    brandColor: 'bg-blue-100',
    textColor: 'text-blue-600',
  },

  // Code Security
  {
    id: 'snyk',
    name: 'Snyk',
    description: 'Developer-first security platform for open source scanning',
    category: 'code-security',
    icon: <Lock className="w-5 h-5" />,
    brandColor: 'bg-purple-100',
    textColor: 'text-purple-600',
  },
  {
    id: 'sonarqube',
    name: 'SonarQube',
    description: 'Code quality and security analysis platform',
    category: 'code-security',
    icon: <Shield className="w-5 h-5" />,
    brandColor: 'bg-blue-100',
    textColor: 'text-blue-600',
  },
  {
    id: 'veracode',
    name: 'Veracode',
    description: 'Application security testing and intelligence platform',
    category: 'code-security',
    icon: <Lock className="w-5 h-5" />,
    brandColor: 'bg-slate-100',
    textColor: 'text-slate-700',
  },
  {
    id: 'checkmarx',
    name: 'Checkmarx',
    description: 'Software supply chain security platform',
    category: 'code-security',
    icon: <Lock className="w-5 h-5" />,
    brandColor: 'bg-blue-100',
    textColor: 'text-blue-600',
  },
];

// Category definitions
const CATEGORY_CONFIG: Record<Exclude<Category, 'all'>, { label: string; icon: React.ReactNode }> = {
  cloud: { label: 'Cloud Providers', icon: <Cloud className="w-4 h-4" /> },
  devops: { label: 'DevOps & CI/CD', icon: <Zap className="w-4 h-4" /> },
  communication: { label: 'Communication', icon: <MessageSquare className="w-4 h-4" /> },
  identity: { label: 'Identity & Access', icon: <Shield className="w-4 h-4" /> },
  monitoring: { label: 'Monitoring & SIEM', icon: <BarChart3 className="w-4 h-4" /> },
  ticketing: { label: 'Ticketing', icon: <Zap className="w-4 h-4" /> },
  hris: { label: 'HRIS', icon: <Users className="w-4 h-4" /> },
  'code-security': { label: 'Code Security', icon: <Lock className="w-4 h-4" /> },
};

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('connected');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [integrationStates, setIntegrationStates] = useState<Record<string, IntegrationState>>({});
  const [toast, setToast] = useState<Toast | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('integrationStates');
    if (saved) {
      try {
        setIntegrationStates(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load integration states:', e);
        initializeDefaultStates();
      }
    } else {
      initializeDefaultStates();
    }
  }, []);

  // Initialize default states with some connected integrations
  const initializeDefaultStates = () => {
    const defaultStates: Record<string, IntegrationState> = {};
    INTEGRATION_DEFINITIONS.forEach((integration) => {
      const isInitiallyConnected = ['aws', 'github', 'slack', 'okta', 'datadog'].includes(integration.id);
      defaultStates[integration.id] = {
        connected: isInitiallyConnected,
        status: 'connected',
        lastSynced: isInitiallyConnected ? 'Just now' : undefined,
      };
    });
    setIntegrationStates(defaultStates);
  };

  // Save to localStorage
  useEffect(() => {
    if (Object.keys(integrationStates).length > 0) {
      localStorage.setItem('integrationStates', JSON.stringify(integrationStates));
    }
  }, [integrationStates]);

  // Handle connect/disconnect
  const handleToggleIntegration = useCallback((integrationId: string) => {
    setIntegrationStates((prev: Record<string, IntegrationState>) => {
      const current = prev[integrationId] || { connected: false, status: 'connected' as const };
      const newConnected = !current.connected;

      const newState: Record<string, IntegrationState> = {
        ...prev,
        [integrationId]: {
          connected: newConnected,
          status: (newConnected ? 'connected' : 'error') as SyncStatus,
          lastSynced: newConnected ? 'Just now' : undefined,
        },
      };

      const integration = INTEGRATION_DEFINITIONS.find((i) => i.id === integrationId);
      const action = newConnected ? 'connected to' : 'disconnected from';
      showToast('success', `Successfully ${action} ${integration?.name || 'integration'}`);

      return newState;
    });
  }, []);

  // Show toast notification
  const showToast = (type: Toast['type'], message: string) => {
    setToast({ type, message });
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  };

  // Calculate category counts
  const getCategoryCounts = () => {
    const counts: Record<Category, number> = {
      all: INTEGRATION_DEFINITIONS.length,
      cloud: 0,
      devops: 0,
      communication: 0,
      identity: 0,
      monitoring: 0,
      ticketing: 0,
      hris: 0,
      'code-security': 0,
    };

    INTEGRATION_DEFINITIONS.forEach((integration) => {
      counts[integration.category]++;
    });

    return counts;
  };

  const categoryCounts = getCategoryCounts();

  // Filter integrations
  const getFilteredIntegrations = () => {
    let filtered = INTEGRATION_DEFINITIONS;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((i) => i.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(
        (i) =>
          i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by tab
    if (activeTab === 'connected') {
      filtered = filtered.filter((i) => integrationStates[i.id]?.connected);
    }

    return filtered;
  };

  const filteredIntegrations = getFilteredIntegrations();

  // Get connected count for tab
  const connectedCount = INTEGRATION_DEFINITIONS.filter(
    (i) => integrationStates[i.id]?.connected
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-slate-900">Integrations</h1>
          <p className="text-slate-600 mt-1">Connect and manage your tools and services</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar */}
          <div className="w-56 flex-shrink-0">
            <Card className="border-slate-200 sticky top-24">
              <CardContent className="pt-0 p-0">
                <div className="space-y-1 p-4">
                  {/* All */}
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-between',
                      selectedCategory === 'all'
                        ? 'bg-sky-50 text-sky-600 border border-sky-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <span>All</span>
                    <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                      {categoryCounts.all}
                    </span>
                  </button>

                  {/* Category filters */}
                  {Object.entries(CATEGORY_CONFIG).map(([categoryId, { label }]) => {
                    const typedCategory = categoryId as Exclude<Category, 'all'>;
                    return (
                      <button
                        key={categoryId}
                        onClick={() => setSelectedCategory(typedCategory)}
                        className={cn(
                          'w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-between',
                          selectedCategory === typedCategory
                            ? 'bg-sky-50 text-sky-600 border border-sky-200'
                            : 'text-slate-700 hover:bg-slate-50'
                        )}
                      >
                        <span>{label}</span>
                        <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                          {categoryCounts[typedCategory]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-slate-200">
              <button
                onClick={() => setActiveTab('connected')}
                className={cn(
                  'pb-4 px-1 font-semibold text-sm transition-colors border-b-2 -mb-[1px]',
                  activeTab === 'connected'
                    ? 'text-sky-600 border-sky-500'
                    : 'text-slate-600 border-transparent hover:text-slate-900'
                )}
              >
                Connected
                {connectedCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-sky-100 text-sky-600">
                    {connectedCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('library')}
                className={cn(
                  'pb-4 px-1 font-semibold text-sm transition-colors border-b-2 -mb-[1px]',
                  activeTab === 'library'
                    ? 'text-sky-600 border-sky-500'
                    : 'text-slate-600 border-transparent hover:text-slate-900'
                )}
              >
                Library
              </button>
            </div>

            {/* Search bar (Library tab only) */}
            {activeTab === 'library' && (
              <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search integrations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
                />
              </div>
            )}

            {/* Integration Cards */}
            {filteredIntegrations.length === 0 ? (
              <Card className="border-slate-200">
                <CardContent className="py-12">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Eye className="w-6 h-6 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No integrations found</h3>
                    <p className="text-slate-600 text-sm">
                      {activeTab === 'connected'
                        ? 'You haven\'t connected any integrations yet'
                        : 'Try adjusting your search or filters'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredIntegrations.map((integration) => {
                  const state = integrationStates[integration.id] || {
                    connected: false,
                    status: 'connected',
                  };
                  const isConnected = state.connected;

                  return (
                    <Card key={integration.id} className="border-slate-200 hover:border-sky-200 hover:shadow-md transition-all">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {/* Icon and Header */}
                          <div className="flex items-start gap-4">
                            <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0', integration.brandColor, integration.textColor)}>
                              {integration.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 text-sm truncate">
                                {integration.name}
                              </h3>
                              <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                                {integration.description}
                              </p>
                            </div>
                          </div>

                          {/* Category badge */}
                          {activeTab === 'library' && (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                {CATEGORY_CONFIG[integration.category].label}
                              </span>
                            </div>
                          )}

                          {/* Status and Last Synced */}
                          {isConnected && (
                            <div className="space-y-2 pt-2 border-t border-slate-200">
                              <div className="flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-xs font-medium text-emerald-700">Connected</span>
                              </div>
                              {state.lastSynced && (
                                <div className="text-xs text-slate-500">
                                  Last synced: {state.lastSynced}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            {activeTab === 'connected' ? (
                              <>
                                <button className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-2">
                                  <Settings className="w-3.5 h-3.5" />
                                  Configure
                                </button>
                                <button
                                  onClick={() => handleToggleIntegration(integration.id)}
                                  className="flex-1 px-3 py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-lg font-medium text-xs transition-colors"
                                >
                                  Disconnect
                                </button>
                              </>
                            ) : isConnected ? (
                              <button
                                disabled
                                className="w-full px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg font-medium text-xs flex items-center justify-center gap-2 cursor-not-allowed opacity-75"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Connected
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleIntegration(integration.id)}
                                className="w-full px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium text-xs transition-colors"
                              >
                                Integrate
                              </button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={cn(
            'fixed bottom-6 right-6 z-50 flex items-center gap-3 p-4 rounded-lg border shadow-lg animate-fadeIn',
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          )}
        >
          {toast.type === 'success' ? (
            <Check className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => setToast(null)}
            className="ml-auto text-xs hover:opacity-70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
