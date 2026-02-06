'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Building2,
  Bell,
  Shield,
  Key,
  Users,
  Plug,
  ChevronRight,
  Cog,
  Save,
  Copy
} from 'lucide-react';

const settingsTabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'api', label: 'API', icon: Key },
];

const integrations = [
  { id: 'aws', name: 'AWS', status: 'connected', description: 'Amazon Web Services', icon: '☁️' },
  { id: 'azure', name: 'Azure', status: 'connected', description: 'Microsoft Azure', icon: '🔷' },
  { id: 'gcp', name: 'Google Cloud', status: 'disconnected', description: 'Google Cloud Platform', icon: '🔵' },
  { id: 'okta', name: 'Okta', status: 'connected', description: 'Identity & Access Management', icon: '🔐' },
  { id: 'github', name: 'GitHub', status: 'connected', description: 'Source Code Management', icon: '🐙' },
  { id: 'jira', name: 'Jira', status: 'disconnected', description: 'Issue Tracking', icon: '📋' },
  { id: 'slack', name: 'Slack', status: 'connected', description: 'Team Communication', icon: '💬' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showCopied, setShowCopied] = useState(false);

  const handleCopyKey = () => {
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 animate-fadeIn">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-slate-900">Settings</h1>
          <p className="mt-2 text-slate-600">Manage your account, organization, and preferences</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs Navigation */}
        <div className="flex gap-8 border-b border-slate-200/60 mb-8 overflow-x-auto">
          {settingsTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-1 py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
                  isActive
                    ? 'text-sky-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Profile Information</h2>

              <div className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-xl font-semibold">
                    SG
                  </div>
                  <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    Change Avatar
                  </button>
                </div>

                {/* Form Fields */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                    <input
                      type="text"
                      defaultValue="Subham"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      defaultValue="Gupta"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="subham@company.com"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Job Title</label>
                  <input
                    type="text"
                    defaultValue="Security Officer"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <button className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 transition-colors flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Organization Tab */}
        {activeTab === 'organization' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Organization Settings</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Organization Name</label>
                  <input
                    type="text"
                    defaultValue="Acme Corporation"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Industry</label>
                    <select className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                      <option>Technology</option>
                      <option>Healthcare</option>
                      <option>Finance</option>
                      <option>Retail</option>
                      <option>Manufacturing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Company Stage</label>
                    <select className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                      <option>Startup</option>
                      <option>Growth</option>
                      <option>Enterprise</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Evidence Retention (days)</label>
                  <input
                    type="number"
                    defaultValue="365"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <button className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 transition-colors flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Team Members</h2>
              <button className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 transition-colors">
                Add Member
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-200/60">
                {[
                  { name: 'Subham Gupta', email: 'subham@company.com', role: 'Owner', initials: 'SG' },
                  { name: 'Security Lead', email: 'security@company.com', role: 'Security Lead', initials: 'SL' },
                  { name: 'Compliance Analyst', email: 'analyst@company.com', role: 'Analyst', initials: 'CA' },
                  { name: 'External Auditor', email: 'auditor@external.com', role: 'Auditor', initials: 'EA' },
                ].map((member, i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                        {member.initials}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{member.name}</p>
                        <p className="text-sm text-slate-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-600">
                        {member.role}
                      </span>
                      <button className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">Connected Integrations</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {integrations.map((integration) => (
                <div key={integration.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg">
                        {integration.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">{integration.name}</h3>
                        <p className="text-xs text-slate-500">{integration.description}</p>
                      </div>
                    </div>
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      integration.status === 'connected' ? 'bg-emerald-500' : 'bg-slate-300'
                    }`} />
                  </div>
                  <button className={`w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    integration.status === 'connected'
                      ? 'border border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                      : 'bg-sky-500 text-white hover:bg-sky-600'
                  }`}>
                    {integration.status === 'connected' ? 'Configure' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Notification Preferences</h2>

              <div className="space-y-4">
                {[
                  { label: 'Audit Reminders', description: 'Receive reminders for upcoming audits' },
                  { label: 'Finding Alerts', description: 'Get notified when new findings are reported' },
                  { label: 'Compliance Updates', description: 'Alerts for framework and compliance changes' },
                  { label: 'Team Activity', description: 'Notifications about team actions and changes' },
                  { label: 'Weekly Digest', description: 'Summary email every week' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-slate-200/60 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-900">{item.label}</p>
                      <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                    </div>
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-sky-500">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </div>
                  </div>
                ))}
              </div>

              <button className="mt-6 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 transition-colors flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Preferences
              </button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="max-w-2xl space-y-6">
            {/* MFA */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Security Settings</h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-slate-200/60 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                    <p className="text-sm text-slate-500 mt-1">Add an extra layer of security to your account</p>
                  </div>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-sky-500">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    defaultValue="30"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <p className="text-xs text-slate-500 mt-2">Automatically logout after this period of inactivity</p>
                </div>

                <button className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 transition-colors flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </div>

            {/* Password */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Change Password</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                  <input type="password" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                  <input type="password" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                  <input type="password" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>

                <button className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 transition-colors flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Update Password
                </button>
              </div>
            </div>
          </div>
        )}

        {/* API Tab */}
        {activeTab === 'api' && (
          <div className="max-w-3xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">API Keys</h2>
              <button className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 transition-colors">
                Generate New Key
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Active API Keys</h3>

              <div className="space-y-4">
                {[
                  { name: 'Production API', key: 'sk_live_51234567890abcdefghij', created: 'Jan 15, 2026', lastUsed: 'Today' },
                  { name: 'Development API', key: 'sk_test_98765432100zyxwvuts', created: 'Dec 20, 2025', lastUsed: '3 days ago' },
                ].map((apiKey, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-slate-200/60 rounded-xl">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{apiKey.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <code className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg font-mono">{apiKey.key}</code>
                        <button
                          onClick={handleCopyKey}
                          className="text-slate-500 hover:text-slate-700 transition-colors"
                          title="Copy to clipboard"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Created: {apiKey.created} • Last used: {apiKey.lastUsed}</p>
                    </div>
                    <button className="text-sm text-slate-500 hover:text-red-600 transition-colors">Revoke</button>
                  </div>
                ))}
              </div>

              {showCopied && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
                  API key copied to clipboard
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
