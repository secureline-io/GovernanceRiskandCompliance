'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Building2,
  Bell,
  Shield,
  Key,
  Users,
  Plug,
  Save,
  Copy,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';

interface Toast {
  type: 'success' | 'error';
  message: string;
}

interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  job_title: string | null;
}

interface Integration {
  id: string;
  name: string;
  status: 'connected' | 'disconnected';
  description: string;
  icon: string;
}

const settingsTabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'api', label: 'API', icon: Key },
];

const integrations: Integration[] = [
  { id: 'aws', name: 'AWS', status: 'connected', description: 'Amazon Web Services', icon: '☁️' },
  { id: 'azure', name: 'Azure', status: 'connected', description: 'Microsoft Azure', icon: '🔷' },
  { id: 'gcp', name: 'Google Cloud', status: 'disconnected', description: 'Google Cloud Platform', icon: '🔵' },
  { id: 'okta', name: 'Okta', status: 'connected', description: 'Identity & Access Management', icon: '🔐' },
  { id: 'github', name: 'GitHub', status: 'connected', description: 'Source Code Management', icon: '🐙' },
  { id: 'jira', name: 'Jira', status: 'disconnected', description: 'Issue Tracking', icon: '📋' },
  { id: 'slack', name: 'Slack', status: 'connected', description: 'Team Communication', icon: '💬' },
];

function Toast({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border ${
      toast.type === 'success'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
        : 'bg-red-50 border-red-200 text-red-700'
    }`}>
      {toast.type === 'success' ? (
        <Check className="h-5 w-5 flex-shrink-0" />
      ) : (
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
      )}
      <p className="text-sm font-medium">{toast.message}</p>
      <button onClick={onClose} className="ml-auto text-xs hover:opacity-70">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { profile, currentOrg, orgs, refreshProfile, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showCopied, setShowCopied] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [editMemberRole, setEditMemberRole] = useState('');
  const [editMemberLoading, setEditMemberLoading] = useState(false);
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [configureLoading, setConfigureLoading] = useState(false);

  // Profile form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Organization form state
  const [orgName, setOrgName] = useState('');
  const [orgIndustry, setOrgIndustry] = useState('');
  const [orgLoading, setOrgLoading] = useState(false);

  // Team form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('analyst');
  const [teamLoading, setTeamLoading] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Initialize form fields from profile
  useEffect(() => {
    if (profile) {
      const [first, last] = profile.full_name.split(' ').length > 1
        ? profile.full_name.split(' ', 2)
        : [profile.full_name, ''];
      setFirstName(first || '');
      setLastName(last || '');
      setJobTitle(profile.job_title || '');
    }
  }, [profile]);

  // Initialize organization fields
  useEffect(() => {
    if (currentOrg) {
      setOrgName(currentOrg.org_name);
      setOrgIndustry(currentOrg.org_industry || '');
    }
  }, [currentOrg]);

  // Fetch team members
  useEffect(() => {
    if (activeTab === 'team' && currentOrg?.org_id) {
      fetchTeamMembers();
    }
  }, [activeTab, currentOrg?.org_id]);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(`/api/auth/users?org_id=${currentOrg?.org_id}`);
      if (!response.ok) throw new Error('Failed to fetch team members');
      const data = await response.json();
      setTeamMembers(data);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setToast({ type: 'error', message: 'Failed to load team members' });
    }
  };

  const handleCopyKey = () => {
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    setProfileLoading(true);
    try {
      const response = await fetch(`/api/auth/users/${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: `${firstName} ${lastName}`.trim(),
          job_title: jobTitle || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to save profile');

      setToast({ type: 'success', message: 'Profile updated successfully' });
      await refreshProfile();
    } catch (err) {
      console.error('Error saving profile:', err);
      setToast({ type: 'error', message: 'Failed to save profile' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveOrganization = async () => {
    if (!currentOrg) return;

    setOrgLoading(true);
    try {
      const response = await fetch(`/api/organizations/${currentOrg.org_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: orgName,
          industry: orgIndustry || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to save organization');

      setToast({ type: 'success', message: 'Organization updated successfully' });
    } catch (err) {
      console.error('Error saving organization:', err);
      setToast({ type: 'error', message: 'Failed to save organization' });
    } finally {
      setOrgLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail || !currentOrg) return;

    setTeamLoading(true);
    try {
      const response = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          org_id: currentOrg.org_id,
          role: inviteRole,
        }),
      });

      if (!response.ok) throw new Error('Failed to invite member');

      setToast({ type: 'success', message: 'Invitation sent successfully' });
      setInviteEmail('');
      setInviteRole('analyst');
      setShowAddMemberModal(false);
      await fetchTeamMembers();
    } catch (err) {
      console.error('Error inviting member:', err);
      setToast({ type: 'error', message: 'Failed to send invitation' });
    } finally {
      setTeamLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      setToast({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    setPasswordLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.updateUser({ password: newPassword });

      setToast({ type: 'success', message: 'Password updated successfully' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Error changing password:', err);
      setToast({ type: 'error', message: 'Failed to change password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member);
    setEditMemberRole(member.job_title || '');
    setShowEditMemberModal(true);
  };

  const handleSaveEditMember = async () => {
    if (!selectedMember || !currentOrg) return;

    setEditMemberLoading(true);
    try {
      const response = await fetch(`/api/auth/users/${selectedMember.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_title: editMemberRole || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to update member');

      setToast({ type: 'success', message: 'Team member updated successfully' });
      setShowEditMemberModal(false);
      setSelectedMember(null);
      setEditMemberRole('');
      await fetchTeamMembers();
    } catch (err) {
      console.error('Error updating member:', err);
      setToast({ type: 'error', message: 'Failed to update team member' });
    } finally {
      setEditMemberLoading(false);
    }
  };

  const handleConfigureIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowConfigureModal(true);
  };

  const handleSaveIntegrationConfig = async () => {
    if (!selectedIntegration || !currentOrg) return;

    setConfigureLoading(true);
    try {
      const response = await fetch(`/api/organizations/${currentOrg.org_id}/integrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integration_id: selectedIntegration.id,
          status: selectedIntegration.status,
        }),
      });

      if (!response.ok) throw new Error('Failed to configure integration');

      setToast({ type: 'success', message: `${selectedIntegration.name} configured successfully` });
      setShowConfigureModal(false);
      setSelectedIntegration(null);
    } catch (err) {
      console.error('Error configuring integration:', err);
      setToast({ type: 'error', message: 'Failed to configure integration' });
    } finally {
      setConfigureLoading(false);
    }
  };

  // Get initials from profile
  const getInitials = () => {
    if (!profile) return '';
    const names = profile.full_name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return profile.full_name.substring(0, 2).toUpperCase();
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
        {/* Toast Notification */}
        {toast && (
          <div className="mb-6">
            <Toast
              toast={toast}
              onClose={() => setToast(null)}
            />
          </div>
        )}

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
                    {getInitials()}
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
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 text-slate-500 focus:outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-2">Email cannot be changed from this page</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Job Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={profileLoading}
                  className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4" />
                  {profileLoading ? 'Saving...' : 'Save Changes'}
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

              {currentOrg ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Organization Name</label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Industry</label>
                      <select
                        value={orgIndustry}
                        onChange={(e) => setOrgIndustry(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="">Select industry</option>
                        <option value="Technology">Technology</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Finance">Finance</option>
                        <option value="Retail">Retail</option>
                        <option value="Manufacturing">Manufacturing</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Organization ID</label>
                      <input
                        type="text"
                        value={currentOrg.org_id}
                        disabled
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 text-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Your Role</label>
                    <input
                      type="text"
                      value={currentOrg.role}
                      disabled
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 text-slate-500 focus:outline-none capitalize"
                    />
                  </div>

                  <button
                    onClick={handleSaveOrganization}
                    disabled={orgLoading}
                    className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4" />
                    {orgLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <p className="text-slate-600">No organization selected</p>
              )}
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Team Members</h2>
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 transition-colors"
              >
                Add Member
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              {teamMembers.length > 0 ? (
                <div className="divide-y divide-slate-200/60">
                  {teamMembers.map((member) => {
                    const names = member.full_name.split(' ');
                    const initials = names.length >= 2
                      ? (names[0][0] + names[names.length - 1][0]).toUpperCase()
                      : member.full_name.substring(0, 2).toUpperCase();

                    return (
                      <div key={member.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                            {initials}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{member.full_name}</p>
                            <p className="text-sm text-slate-500">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {member.job_title && (
                            <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-600">
                              {member.job_title}
                            </span>
                          )}
                          <button
                            onClick={() => handleEditMember(member)}
                            className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-slate-600">No team members yet</p>
                </div>
              )}
            </div>

            {/* Add Member Modal */}
            {showAddMemberModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-lg max-w-md w-full mx-4">
                  <div className="flex items-center justify-between p-6 border-b border-slate-200/60">
                    <h3 className="text-lg font-semibold text-slate-900">Invite Team Member</h3>
                    <button
                      onClick={() => setShowAddMemberModal(false)}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="member@company.com"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="analyst">Analyst</option>
                        <option value="security_lead">Security Lead</option>
                        <option value="admin">Admin</option>
                        <option value="owner">Owner</option>
                      </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setShowAddMemberModal(false)}
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleInviteMember}
                        disabled={teamLoading || !inviteEmail}
                        className="flex-1 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {teamLoading ? 'Sending...' : 'Send Invite'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Member Modal */}
            {showEditMemberModal && selectedMember && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-lg max-w-md w-full mx-4">
                  <div className="flex items-center justify-between p-6 border-b border-slate-200/60">
                    <h3 className="text-lg font-semibold text-slate-900">Edit Team Member</h3>
                    <button
                      onClick={() => {
                        setShowEditMemberModal(false);
                        setSelectedMember(null);
                      }}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={selectedMember.full_name}
                        disabled
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 text-slate-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={selectedMember.email}
                        disabled
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 text-slate-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Job Title</label>
                      <input
                        type="text"
                        value={editMemberRole}
                        onChange={(e) => setEditMemberRole(e.target.value)}
                        placeholder="e.g., Security Analyst"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => {
                          setShowEditMemberModal(false);
                          setSelectedMember(null);
                        }}
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEditMember}
                        disabled={editMemberLoading}
                        className="flex-1 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {editMemberLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Configure Integration Modal */}
            {showConfigureModal && selectedIntegration && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-lg max-w-md w-full mx-4">
                  <div className="flex items-center justify-between p-6 border-b border-slate-200/60">
                    <h3 className="text-lg font-semibold text-slate-900">Configure {selectedIntegration.name}</h3>
                    <button
                      onClick={() => {
                        setShowConfigureModal(false);
                        setSelectedIntegration(null);
                      }}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-sky-50 rounded-xl">
                      <div className="text-2xl">{selectedIntegration.icon}</div>
                      <div>
                        <p className="font-medium text-slate-900">{selectedIntegration.name}</p>
                        <p className="text-sm text-slate-600">{selectedIntegration.description}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Configuration Settings</label>
                      <p className="text-sm text-slate-600 mb-3">
                        This integration is currently configured and syncing data. You can manage its settings here.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                          <span className="text-sm text-slate-700">Sync Status</span>
                          <span className="text-sm font-medium text-emerald-600">Active</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                          <span className="text-sm text-slate-700">Last Sync</span>
                          <span className="text-sm text-slate-600">2 minutes ago</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => {
                          setShowConfigureModal(false);
                          setSelectedIntegration(null);
                        }}
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Close
                      </button>
                      <button
                        onClick={handleSaveIntegrationConfig}
                        disabled={configureLoading}
                        className="flex-1 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {configureLoading ? 'Saving...' : 'Save Settings'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                  <button
                    onClick={() => {
                      if (integration.status === 'connected') {
                        handleConfigureIntegration(integration);
                      }
                    }}
                    className={`w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                      integration.status === 'connected'
                        ? 'border border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                        : 'bg-sky-500 text-white hover:bg-sky-600'
                    }`}
                  >
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
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-300">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
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
                  <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={passwordLoading || !newPassword || !confirmPassword}
                  className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4" />
                  {passwordLoading ? 'Updating...' : 'Update Password'}
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
