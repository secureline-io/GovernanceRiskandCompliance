'use client';

import { useState } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface SSOProvider {
  id: string;
  name: string;
  icon: string;
  type: 'social' | 'enterprise';
  enabled: boolean;
  configured: boolean;
  beta?: boolean;
}

export default function AdministrationPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'audit'>('login');

  const [ssoProviders, setSsoProviders] = useState<SSOProvider[]>([
    { id: 'google', name: 'Google', icon: '🔵', type: 'social', enabled: true, configured: true },
    { id: 'microsoft', name: 'Microsoft', icon: '🟦', type: 'social', enabled: true, configured: true },
    { id: 'okta', name: 'Okta (SSO)', icon: '🔷', type: 'enterprise', enabled: false, configured: false },
    { id: 'onelogin', name: 'OneLogin', icon: '1️⃣', type: 'enterprise', enabled: false, configured: false },
    { id: 'jumpcloud', name: 'JumpCloud (SSO)', icon: '☁️', type: 'enterprise', enabled: false, configured: false },
    { id: 'pingone', name: 'Pingone', icon: '🏓', type: 'enterprise', enabled: false, configured: false, beta: true },
  ]);

  const toggleProvider = (id: string) => {
    setSsoProviders(providers =>
      providers.map(p =>
        p.id === id ? { ...p, enabled: !p.enabled } : p
      )
    );
  };

  const socialProviders = ssoProviders.filter(p => p.type === 'social');
  const enterpriseProviders = ssoProviders.filter(p => p.type === 'enterprise');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Link href="/settings" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Administration</h1>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8">
        <button
          onClick={() => setActiveTab('login')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'login'
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Login Methods
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'audit'
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Audit Logs
        </button>
      </div>

      {activeTab === 'login' ? (
        <div className="max-w-3xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Configure SSO</h2>

          {/* Social SSO */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Social SSO</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {socialProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="bg-white border border-gray-200 rounded-xl p-5"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    {provider.id === 'google' ? (
                      <div className="w-8 h-8 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-6 h-6">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                    ) : provider.id === 'microsoft' ? (
                      <div className="w-8 h-8 flex items-center justify-center">
                        <svg viewBox="0 0 21 21" className="w-5 h-5">
                          <rect fill="#F25022" x="1" y="1" width="9" height="9"/>
                          <rect fill="#00A4EF" x="1" y="11" width="9" height="9"/>
                          <rect fill="#7FBA00" x="11" y="1" width="9" height="9"/>
                          <rect fill="#FFB900" x="11" y="11" width="9" height="9"/>
                        </svg>
                      </div>
                    ) : (
                      <span className="text-2xl">{provider.icon}</span>
                    )}
                    <span className="font-medium text-gray-900">{provider.name}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleProvider(provider.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        provider.enabled ? 'bg-teal-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          provider.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="text-sm text-gray-500">
                      {provider.enabled ? 'Disable' : 'Enable'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enterprise SSO */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-4">Enterprise SSO</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {enterpriseProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="bg-white border border-gray-200 rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {provider.id === 'okta' ? (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">O</span>
                        </div>
                      ) : provider.id === 'onelogin' ? (
                        <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">1</span>
                        </div>
                      ) : provider.id === 'jumpcloud' ? (
                        <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">JC</span>
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">P</span>
                        </div>
                      )}
                      <span className="font-medium text-gray-900">{provider.name}</span>
                    </div>
                    {provider.beta && (
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                        Beta
                      </span>
                    )}
                  </div>

                  <button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg text-sm font-medium transition-colors mb-4">
                    Integrate
                  </button>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleProvider(provider.id)}
                      disabled={!provider.configured}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        provider.enabled ? 'bg-teal-600' : 'bg-gray-200'
                      } ${!provider.configured ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          provider.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="text-sm text-gray-500">
                      {provider.enabled ? 'Disable' : 'Enable'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Audit Logs Tab */
        <div>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { time: '2024-01-15 14:32:00', user: 'subham@company.com', action: 'Login', resource: 'Auth', ip: '192.168.1.1' },
                  { time: '2024-01-15 14:30:00', user: 'admin@company.com', action: 'Updated', resource: 'SSO Settings', ip: '192.168.1.2' },
                  { time: '2024-01-15 14:25:00', user: 'subham@company.com', action: 'Created', resource: 'Framework Instance', ip: '192.168.1.1' },
                  { time: '2024-01-15 14:20:00', user: 'john@company.com', action: 'Uploaded', resource: 'Evidence', ip: '192.168.1.3' },
                  { time: '2024-01-15 14:15:00', user: 'admin@company.com', action: 'Modified', resource: 'User Role', ip: '192.168.1.2' },
                ].map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.user}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.action === 'Login' ? 'bg-green-100 text-green-800' :
                        log.action === 'Created' ? 'bg-blue-100 text-blue-800' :
                        log.action === 'Updated' || log.action === 'Modified' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.resource}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
