'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Lock, ExternalLink, Check } from 'lucide-react';

interface Framework {
  id: string;
  code: string;
  name: string;
  version: string | null;
  authority: string | null;
  category: string | null;
  description: string | null;
  is_custom: boolean;
  framework_requirements: { count: number }[];
}

// Framework library items (available frameworks to add)
const frameworkLibrary = [
  { id: 'iso27018', code: 'ISO27018', name: 'ISO 27018:2019', requirements: 148, progress: 56.6, icon: 'ISO', color: 'bg-blue-600' },
  { id: 'iso27017', code: 'ISO27017', name: 'ISO 27017:2015', requirements: 134, progress: 54.2, icon: 'ISO', color: 'bg-blue-600' },
  { id: 'iso27001', code: 'ISO27001', name: 'ISO 27001:2022', requirements: 127, progress: 53.1, icon: 'ISO', color: 'bg-blue-600' },
  { id: 'ccpa', code: 'CCPA', name: 'CCPA', requirements: 89, progress: 52.5, icon: '🔒', color: 'bg-green-600' },
  { id: 'iso27701', code: 'ISO27701', name: 'ISO 27701:2019', requirements: 156, progress: 52.1, icon: 'ISO', color: 'bg-blue-600' },
  { id: 'hipaa', code: 'HIPAA', name: 'HIPAA', requirements: 142, progress: 51.8, icon: '🏥', color: 'bg-purple-600' },
  { id: 'gdpr', code: 'GDPR', name: 'GDPR', requirements: 178, progress: 48.3, icon: '🇪🇺', color: 'bg-indigo-600' },
  { id: 'pci-dss', code: 'PCI-DSS', name: 'PCI DSS 4.0', requirements: 264, progress: 45.7, icon: '💳', color: 'bg-orange-600' },
];

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState<'my' | 'library'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [myFrameworks, setMyFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFrameworks();
  }, []);

  const fetchFrameworks = async () => {
    try {
      const response = await fetch('/api/frameworks');
      const result = await response.json();
      if (result.data) {
        setMyFrameworks(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch frameworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLibrary = frameworkLibrary.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isFrameworkAdded = (code: string) => {
    return myFrameworks.some(f => f.code.toUpperCase() === code.toUpperCase());
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-semibold text-gray-900">Frameworks</h1>
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-sm font-medium">
            {myFrameworks.length}
          </span>
          <ExternalLink className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
        </div>
        <button className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add Custom Framework</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('my')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'my'
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          My Frameworks
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'library'
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Frameworks Library
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>

      {activeTab === 'library' ? (
        /* Frameworks Library Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLibrary.map((framework) => {
            const added = isFrameworkAdded(framework.code);
            return (
              <div
                key={framework.id}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${framework.color} rounded-lg flex items-center justify-center text-white text-xs font-bold`}>
                      {framework.icon === 'ISO' ? 'ISO' : framework.icon}
                    </div>
                    <span className="font-medium text-gray-900">{framework.name}</span>
                  </div>
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Compliant</span>
                    <span className="text-lg font-semibold text-gray-900">{framework.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${framework.progress}%` }}
                    />
                  </div>
                </div>

                <div className="text-center mb-4">
                  <p className="text-xs text-gray-500">Number of Requirements</p>
                  <p className="text-xl font-semibold text-gray-900">{framework.requirements}</p>
                </div>

                <button
                  disabled={added}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                    added
                      ? 'bg-green-50 text-green-600 cursor-default'
                      : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added</span>
                    </>
                  ) : (
                    <span>Add Framework</span>
                  )}
                </button>

                {/* Scrut badge */}
                <div className="absolute bottom-4 right-4">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-[10px]">✓</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* My Frameworks Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 text-center py-12 text-gray-500">
              Loading frameworks...
            </div>
          ) : myFrameworks.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <div className="text-gray-400 mb-4">
                <Lock className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No frameworks added yet</h3>
              <p className="text-gray-500 mb-4">Add frameworks from the library to get started</p>
              <button
                onClick={() => setActiveTab('library')}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Browse Framework Library
              </button>
            </div>
          ) : (
            myFrameworks.map((framework) => (
              <div
                key={framework.id}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                      {framework.code.substring(0, 3)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900 block">{framework.name}</span>
                      <span className="text-xs text-gray-500">{framework.authority}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Compliant</span>
                    <span className="text-lg font-semibold text-gray-900">0%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '0%' }} />
                  </div>
                </div>

                <div className="text-center mb-4">
                  <p className="text-xs text-gray-500">Number of Requirements</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {framework.framework_requirements?.[0]?.count || 0}
                  </p>
                </div>

                <button className="w-full py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                  View Details
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
