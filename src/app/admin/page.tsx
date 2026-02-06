'use client';

import { useState } from 'react';
import { ChevronRight, Copy, Check } from 'lucide-react';
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

interface AuditLogEntry {
  time: string;
  user: string;
  action: string;
  resource: string;
  ip: string;
  details?: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'sso' | 'audit' | 'permissions'>('sso');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
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

  const handleCopy = (text: string, key: string) => {
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const socialProviders = ssoProviders.filter(p => p.type === 'social');
  const enterpriseProviders = ssoProviders.filter(p => p.type === 'enterprise');

  const auditLogs: AuditLogEntry[] = [
    { time: '2026-02-06 14:32:00', user: 'subham@company.com', action: 'Login', resource: 'Auth', ip: '192.168.1.1', details: 'Successful login' },
    { time: '2026-02-06 14:30:00', user: 'admin@company.com', action: 'Updated', resource: 'SSO Settings', ip: '192.168.1.2', details: 'Enabled Google OAuth' },
    { time: '2026-02-06 14:25:00', user: 'subham@company.com', action: 'Created', resource: 'Framework Instance', ip: '192.168.1.1', details: 'SOC 2 Type II' },
    { time: '2026-02-06 14:20:00', user: 'john@company.com', action: 'Uploaded', resource: 'Evidence', ip: '192.168.1.3', details: '5 files uploaded' },
    { time: '2026-02-06 14:15:00', user: 'admin@company.com', action: 'Modified', resource: 'User Role', ip: '192.168.1.2', details: 'Changed analyst to auditor' },
    { time: '2026-02-06 14:10:00', user: 'security@company.com', action: 'Exported', resource: 'Compliance Report', ip: '192.168.1.4', details: 'PDF export' },
    { time: '2026-02-06 14:05:00', user: 'admin@company.com', action: 'Deleted', resource: 'Old Evidence', ip: '192.168.1.2', details: 'Archive cleanup' },
  ];

  const roles = ['Admin', 'Auditor', 'Analyst', 'Viewer'];
  const modules = ['Audits', 'Evidence', 'Findings', 'Reports', 'Settings', 'Users', 'Integrations', 'API'];

  const permissions: Record<string, Record<string, boolean>> = {
    Admin: { Audits: true, Evidence: true, Findings: true, Reports: true, Settings: true, Users: true, Integrations: true, API: true },
    Auditor: { Audits: true, Evidence: true, Findings: true, Reports: true, Settings: false, Users: false, Integrations: false, API: false },
    Analyst: { Audits: true, Evidence: true, Findings: true, Reports: false, Settings: false, Users: false, Integrations: false, API: false },
    Viewer: { Audits: true, Evidence: true, Findings: false, Reports: true, Settings: false, Users: false, Integrations: false, API: false },
  };

  return (
    <div className="min-h-screen bg-slate-50 animate-fadeIn">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/settings" className="text-slate-600 hover:text-slate-900">
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Link>
            <h1 className="text-4xl font-bold text-slate-900">Administration</h1>
          </div>
          <p className="text-slate-600">System-wide settings, security, and access control</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs Navigation */}
        <div className="flex gap-8 border-b border-slate-200/60 mb-8 overflow-x-auto">
          {[
            { id: 'sso', label: 'SSO Configuration' },
            { id: 'audit', label: 'Audit Logs' },
            { id: 'permissions', label: 'Permissions' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-1 py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
                activeTab === tab.id
                  ? 'text-sky-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />
              )}
            </button>
          ))}
        </div>

        {/* SSO Configuration Tab */}
        {activeTab === 'sso' && (
          <div className="space-y-8">
            {/* Social SSO */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Social SSO Providers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {socialProviders.map((provider) => (
                  <div key={provider.id} className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
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
                        <span className="font-medium text-slate-900">{provider.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => toggleProvider(provider.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          provider.enabled ? 'bg-sky-500' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            provider.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="text-sm text-slate-600">
                        {provider.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enterprise SSO */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Enterprise SSO Providers</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {enterpriseProviders.map((provider) => (
                  <div key={provider.id} className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {provider.id === 'okta' ? (
                          <div className="w-8 h-8 bg-sky-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">O</span>
                          </div>
                        ) : provider.id === 'onelogin' ? (
                          <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
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
                        <span className="font-medium text-slate-900 text-sm">{provider.name}</span>
                      </div>
                      {provider.beta && (
                        <span className="bg-sky-100 text-sky-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          Beta
                        </span>
                      )}
                    </div>

                    <button className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors mb-4">
                      Configure
                    </button>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => toggleProvider(provider.id)}
                        disabled={!provider.configured}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          provider.enabled ? 'bg-sky-500' : 'bg-slate-200'
                        } ${!provider.configured ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            provider.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="text-sm text-slate-600">
                        {provider.configured ? (provider.enabled ? 'Enabled' : 'Disabled') : 'Not configured'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">System Audit Logs</h2>
              <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Export Logs
              </button>
            </div>

            <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200/60">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Resource
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60">
                    {auditLogs.map((log, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">{log.time}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{log.user}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            log.action === 'Login' ? 'bg-emerald-50 text-emerald-700' :
                            log.action === 'Created' ? 'bg-sky-50 text-sky-700' :
                            log.action === 'Updated' || log.action === 'Modified' ? 'bg-amber-50 text-amber-700' :
                            log.action === 'Deleted' ? 'bg-red-50 text-red-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">{log.resource}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">{log.ip}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">Role-Based Access Control</h2>

            <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200/60">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Role
                      </th>
                      {modules.map((module) => (
                        <th key={module} className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                          {module}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60">
                    {roles.map((role) => (
                      <tr key={role} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">{role}</td>
                        {modules.map((module) => (
                          <td key={`${role}-${module}`} className="px-6 py-4 text-center">
                            {permissions[role][module] ? (
                              <div className="flex justify-center">
                                <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                  <Check className="h-3 w-3 text-emerald-600" />
                                </div>
                              </div>
                            ) : (
                              <div className="h-5 w-5 rounded-full bg-slate-100"></div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-200/60 p-6 bg-slate-50">
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-slate-900">Note:</span> Click on any permission to modify role access levels. Changes take effect immediately.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
