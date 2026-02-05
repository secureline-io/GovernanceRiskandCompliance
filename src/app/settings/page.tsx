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
  Cog
} from 'lucide-react';

const settingsSections = [
  { id: 'profile', label: 'Profile', icon: User, description: 'Manage your personal information' },
  { id: 'organization', label: 'Organization', icon: Building2, description: 'Organization settings and branding' },
  { id: 'team', label: 'Team Members', icon: Users, description: 'Manage team access and roles' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Configure email and in-app notifications' },
  { id: 'security', label: 'Security', icon: Shield, description: 'Password and two-factor authentication' },
  { id: 'api', label: 'API Keys', icon: Key, description: 'Manage API keys for integrations' },
  { id: 'integrations', label: 'Integrations', icon: Plug, description: 'Connect external tools and services' },
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
  const [activeSection, setActiveSection] = useState('profile');

  return (
    <div className="flex h-full">
      {/* Settings Navigation */}
      <div className="w-64 border-r border-gray-200 bg-white p-4">
        <h2 className="flex items-center gap-2 px-3 py-2 text-lg font-semibold text-gray-900">
          <Cog className="h-5 w-5" />
          Settings
        </h2>
        <nav className="mt-4 space-y-1">
          {settingsSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <section.icon className="h-4 w-4" />
              {section.label}
            </button>
          ))}
        </nav>

        {/* Administration Link */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Link
            href="/admin"
            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4" />
              <span>Administration</span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        {activeSection === 'profile' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
              <p className="mt-1 text-gray-500 text-sm">Manage your personal information</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xl font-semibold">
                    SG
                  </div>
                  <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Change Avatar
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      defaultValue="Subham"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      defaultValue="Gupta"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue="subham@company.com"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <button className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'organization' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Organization Settings</h1>
              <p className="mt-1 text-gray-500 text-sm">Manage your organization details</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Organization Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                  <input
                    type="text"
                    defaultValue="Acme Corporation"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option>Technology</option>
                    <option>Healthcare</option>
                    <option>Finance</option>
                    <option>Retail</option>
                    <option>Manufacturing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Stage</label>
                  <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option>Startup</option>
                    <option>Growth</option>
                    <option>Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Evidence Retention (days)</label>
                  <input
                    type="number"
                    defaultValue="365"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <button className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'integrations' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Integrations</h1>
              <p className="mt-1 text-gray-500 text-sm">Connect your tools for automated evidence collection</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {integrations.map((integration) => (
                <div key={integration.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xl">
                        {integration.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{integration.name}</h3>
                        <p className="text-xs text-gray-500">{integration.description}</p>
                      </div>
                    </div>
                    <span className={`h-2 w-2 rounded-full ${
                      integration.status === 'connected' ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  </div>
                  <button className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    integration.status === 'connected'
                      ? 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}>
                    {integration.status === 'connected' ? 'Configure' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'team' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Team Members</h1>
                <p className="mt-1 text-gray-500 text-sm">Manage team access and roles</p>
              </div>
              <button className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors">
                Invite Member
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {[
                  { name: 'Subham Gupta', email: 'subham@company.com', role: 'Owner', initials: 'SG' },
                  { name: 'Security Lead', email: 'security@company.com', role: 'Security Lead', initials: 'SL' },
                  { name: 'Compliance Analyst', email: 'analyst@company.com', role: 'Analyst', initials: 'CA' },
                  { name: 'External Auditor', email: 'auditor@external.com', role: 'Auditor', initials: 'EA' },
                ].map((member, i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                        {member.initials}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
                        {member.role}
                      </span>
                      <button className="text-sm text-gray-500 hover:text-gray-900">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Placeholder for other sections */}
        {!['profile', 'organization', 'integrations', 'team'].includes(activeSection) && (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 mb-2">
                {activeSection === 'notifications' && <Bell className="w-12 h-12 mx-auto" />}
                {activeSection === 'security' && <Shield className="w-12 h-12 mx-auto" />}
                {activeSection === 'api' && <Key className="w-12 h-12 mx-auto" />}
              </div>
              <p className="text-gray-500">Settings for {activeSection} coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
