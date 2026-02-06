'use client';

import { useState, useEffect } from 'react';
import {
  Zap,
  Bug,
  Shield,
  ArrowRight,
  Search,
  Mail,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type UpdateType = 'Feature' | 'Improvement' | 'Bug Fix' | 'Security';

interface Update {
  id: string;
  version: string;
  date: string;
  type: UpdateType;
  title: string;
  description: string;
  tags: string[];
}

const UPDATES: Update[] = [
  {
    id: '1',
    version: 'v2.8.0',
    date: '2025-01-15',
    type: 'Feature',
    title: 'Added CSPM Module',
    description: 'New Cloud Security Posture Management module for continuous cloud security monitoring across AWS, Azure, and GCP environments with automated remediation.',
    tags: ['Cloud Security', 'Automation', 'AWS', 'Azure', 'GCP'],
  },
  {
    id: '2',
    version: 'v2.7.5',
    date: '2025-01-10',
    type: 'Feature',
    title: 'Risk Heat Map Visualization',
    description: 'Interactive heat map dashboard displaying risk distribution across business units and threat categories. Hover for detailed metrics and drill-down capabilities.',
    tags: ['Risk Management', 'Dashboard', 'Analytics'],
  },
  {
    id: '3',
    version: 'v2.7.0',
    date: '2025-01-05',
    type: 'Feature',
    title: 'Automated Evidence Collection',
    description: 'Intelligent automation to gather compliance evidence from connected systems. Supports Jira, GitHub, AWS CloudTrail, and 50+ enterprise platforms.',
    tags: ['Compliance', 'Automation', 'Integration'],
  },
  {
    id: '4',
    version: 'v2.6.8',
    date: '2024-12-28',
    type: 'Improvement',
    title: 'Enhanced Search Functionality',
    description: 'Upgraded full-text search engine with natural language processing. 3x faster query response times and improved relevance ranking.',
    tags: ['Search', 'Performance', 'UX'],
  },
  {
    id: '5',
    version: 'v2.6.5',
    date: '2024-12-20',
    type: 'Security',
    title: 'Zero Trust Access Control',
    description: 'Implemented advanced zero trust architecture with continuous device verification, micro-segmentation, and adaptive authentication policies.',
    tags: ['Security', 'Access Control', 'Zero Trust'],
  },
  {
    id: '6',
    version: 'v2.6.0',
    date: '2024-12-15',
    type: 'Feature',
    title: 'Real-time Audit Logging',
    description: 'All actions now logged in real-time with immutable audit trails. Supports streaming to SIEM systems and compliance with FedRAMP requirements.',
    tags: ['Audit', 'Logging', 'Compliance'],
  },
  {
    id: '7',
    version: 'v2.5.2',
    date: '2024-12-10',
    type: 'Bug Fix',
    title: 'Fixed Assessment Export Performance',
    description: 'Resolved issue where large assessment exports (10K+ items) were timing out. Now exports complete 80% faster with streaming output.',
    tags: ['Exports', 'Performance', 'Bug Fix'],
  },
  {
    id: '8',
    version: 'v2.5.0',
    date: '2024-12-01',
    type: 'Improvement',
    title: 'AI-Powered Risk Scoring',
    description: 'Machine learning model now analyzes risk factors across the organization. Predictive insights identify emerging threats before they escalate.',
    tags: ['AI/ML', 'Risk Management', 'Analytics'],
  },
  {
    id: '9',
    version: 'v2.4.5',
    date: '2024-11-25',
    type: 'Feature',
    title: 'Multi-Framework Compliance Mapping',
    description: 'Map controls across ISO 27001, SOC 2, GDPR, HIPAA, PCI-DSS, and custom frameworks simultaneously. Eliminate control duplication.',
    tags: ['Compliance', 'Frameworks', 'Mapping'],
  },
  {
    id: '10',
    version: 'v2.4.0',
    date: '2024-11-15',
    type: 'Improvement',
    title: 'Improved Dashboard Customization',
    description: 'Users can now create personalized dashboards with drag-and-drop widgets. Save multiple views per role for team-specific monitoring.',
    tags: ['Dashboard', 'UX', 'Customization'],
  },
];

const getUpdateTypeConfig = (type: UpdateType) => {
  switch (type) {
    case 'Feature':
      return {
        icon: Zap,
        bgColor: 'bg-sky-50',
        textColor: 'text-sky-700',
        borderColor: 'border-sky-200',
        badgeColor: 'bg-sky-100 text-sky-700',
      };
    case 'Improvement':
      return {
        icon: ArrowRight,
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-700',
        borderColor: 'border-indigo-200',
        badgeColor: 'bg-indigo-100 text-indigo-700',
      };
    case 'Bug Fix':
      return {
        icon: Check,
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        badgeColor: 'bg-emerald-100 text-emerald-700',
      };
    case 'Security':
      return {
        icon: Shield,
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        badgeColor: 'bg-red-100 text-red-700',
      };
  }
};

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<Update[]>(UPDATES);
  const [filteredUpdates, setFilteredUpdates] = useState<Update[]>(UPDATES);
  const [selectedType, setSelectedType] = useState<UpdateType | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      const stored = localStorage.getItem('updates_data');
      if (stored) setUpdates(JSON.parse(stored));
      const subEmail = localStorage.getItem('newsletter_email');
      if (subEmail) {
        setEmail(subEmail);
        setSubscribed(true);
      }
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Filter updates
  useEffect(() => {
    let filtered = updates;

    if (selectedType !== 'All') {
      filtered = filtered.filter((u) => u.type === selectedType);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredUpdates(filtered);
  }, [updates, selectedType, searchTerm]);

  const handleSubscribe = () => {
    if (!email.trim() || !email.includes('@')) return;
    localStorage.setItem('newsletter_email', email);
    setSubscribed(true);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-12 bg-slate-200 rounded-2xl w-64 animate-pulse" />
        <div className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const latestUpdate = updates[0];
  const updateTypes: UpdateType[] = ['Feature', 'Improvement', 'Bug Fix', 'Security'];

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Platform Updates</h1>
        <p className="text-slate-500 text-sm mt-1">Latest features, improvements, and security updates</p>
      </div>

      {/* What's New Banner */}
      <Card className="border-sky-200 shadow-sm bg-gradient-to-r from-sky-50 to-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700">
                  Latest Release
                </span>
                <span className="text-xs font-medium text-sky-700">{latestUpdate.date}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{latestUpdate.title}</h3>
              <p className="text-slate-600 mb-4">{latestUpdate.description}</p>
              <div className="flex items-center gap-2 text-sky-600 font-semibold text-sm hover:opacity-80 cursor-pointer">
                View Details <ArrowRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-bold text-sky-700">{latestUpdate.version}</p>
              <p className="text-xs text-sky-600 mt-1">Latest Version</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search updates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200/60 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setSelectedType('All')}
            className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all whitespace-nowrap border ${
              selectedType === 'All'
                ? 'bg-sky-500 text-white border-sky-500'
                : 'border-slate-200/60 text-slate-700 hover:border-slate-300'
            }`}
          >
            All
          </button>
          {updateTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all whitespace-nowrap border ${
                selectedType === type
                  ? 'bg-sky-500 text-white border-sky-500'
                  : 'border-slate-200/60 text-slate-700 hover:border-slate-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {filteredUpdates.length > 0 ? (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-8 bottom-0 w-px bg-gradient-to-b from-sky-300 via-sky-200 to-slate-200" />

            {/* Timeline items */}
            {filteredUpdates.map((update, index) => {
              const config = getUpdateTypeConfig(update.type);
              const IconComponent = config.icon;

              return (
                <div key={update.id} className="relative pl-20">
                  {/* Timeline dot */}
                  <div className={`absolute left-0 top-2 w-12 h-12 ${config.bgColor} rounded-full border-4 border-white flex items-center justify-center shadow-sm`}>
                    <IconComponent className={`w-5 h-5 ${config.textColor}`} />
                  </div>

                  {/* Content card */}
                  <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${config.badgeColor}`}
                            >
                              {update.type}
                            </span>
                            <span className="text-xs font-medium text-slate-500">{update.date}</span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900">{update.title}</h3>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold text-slate-700">{update.version}</p>
                        </div>
                      </div>

                      <p className="text-slate-600 text-sm mb-4 leading-relaxed">{update.description}</p>

                      <div className="flex flex-wrap gap-2">
                        {update.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="border-slate-200/60 shadow-sm">
            <div className="text-center py-12">
              <Zap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No updates found</p>
              <p className="text-slate-500 text-sm">Try adjusting your filters or search</p>
            </div>
          </Card>
        )}
      </div>

      {/* Newsletter Section */}
      <Card className="border-slate-200/60 shadow-sm bg-gradient-to-r from-slate-50 to-slate-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-sky-500" />
            Stay Updated
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600 text-sm">
            Subscribe to our newsletter to receive notifications about new features, security updates, and platform improvements.
          </p>

          {!subscribed ? (
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-200/60 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                onClick={handleSubscribe}
                disabled={!email.includes('@')}
                className="px-6 py-2 bg-sky-500 text-white rounded-2xl hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
              >
                Subscribe
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-4 py-3 rounded-2xl border border-emerald-200">
              <Check className="w-5 h-5" />
              <p className="text-sm font-medium">Subscribed as {email}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
