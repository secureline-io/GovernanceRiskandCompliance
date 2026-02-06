'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { cn } from '@/lib/utils';
import {
  Users,
  Building2,
  Lock,
  BarChart3,
  Plus,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  Copy,
  Check,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type TabType = 'users' | 'organizations' | 'roles' | 'audit-log';
type UserRole = 'owner' | 'admin' | 'security_lead' | 'analyst' | 'auditor' | 'viewer';

interface User {
  id: string;
  email: string;
  full_name: string;
  job_title: string | null;
  role: UserRole;
  created_at: string;
  last_login: string | null;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  created_at: string;
  member_count: number;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: string | null;
}

interface RoleDefinition {
  name: UserRole;
  display_name: string;
  description: string;
  permissions: Record<string, boolean>;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// ============================================================================
// TOAST NOTIFICATION HANDLER
// ============================================================================

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    []
  );

  return { toasts, addToast };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminPage() {
  const { currentOrg, isSuperAdmin } = useAuth();
  const { toasts, addToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [isLoading, setIsLoading] = useState(false);

  // Users State
  const [users, setUsers] = useState<User[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    password: '',
    full_name: '',
    job_title: '',
    role: 'viewer' as UserRole,
  });

  // Organizations State
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [newOrgForm, setNewOrgForm] = useState({
    name: '',
    slug: '',
    industry: '',
  });

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditSearchQuery, setAuditSearchQuery] = useState('');

  // Copy to clipboard state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // =========================================================================
  // FETCH DATA FUNCTIONS
  // =========================================================================

  const fetchUsers = useCallback(async () => {
    if (!currentOrg?.org_id) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/auth/users?org_id=${currentOrg.org_id}`
      );
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      addToast('Failed to fetch users', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentOrg?.org_id, addToast]);

  const fetchOrganizations = useCallback(async () => {
    if (!isSuperAdmin) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/organizations');
      if (!response.ok) throw new Error('Failed to fetch organizations');
      const data = await response.json();
      setOrganizations(data.data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      addToast('Failed to fetch organizations', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isSuperAdmin, addToast]);

  const fetchAuditLogs = useCallback(async () => {
    if (!currentOrg?.org_id) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/audit-logs?org_id=${currentOrg.org_id}`
      );
      if (!response.ok) throw new Error('Failed to fetch audit logs');
      const data = await response.json();
      setAuditLogs(data.data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      addToast('Failed to fetch audit logs', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentOrg?.org_id, addToast]);

  // =========================================================================
  // FORM SUBMISSION FUNCTIONS
  // =========================================================================

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentOrg?.org_id) {
      addToast('No organization selected', 'error');
      return;
    }

    if (
      !newUserForm.email ||
      !newUserForm.password ||
      !newUserForm.full_name
    ) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: currentOrg.org_id,
          email: newUserForm.email,
          password: newUserForm.password,
          full_name: newUserForm.full_name,
          job_title: newUserForm.job_title,
          role: newUserForm.role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }

      const data = await response.json();
      setUsers((prev) => [data.user, ...prev]);
      setShowUserModal(false);
      setNewUserForm({
        email: '',
        password: '',
        full_name: '',
        job_title: '',
        role: 'viewer',
      });
      addToast('User created successfully', 'success');
      await fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      addToast(
        error instanceof Error ? error.message : 'Failed to create user',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newOrgForm.name || !newOrgForm.slug) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newOrgForm.name,
          slug: newOrgForm.slug,
          industry: newOrgForm.industry,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create organization');
      }

      const data = await response.json();
      setOrganizations((prev) => [data.data, ...prev]);
      setShowOrgModal(false);
      setNewOrgForm({ name: '', slug: '', industry: '' });
      addToast('Organization created successfully', 'success');
      await fetchOrganizations();
    } catch (error) {
      console.error('Error creating organization:', error);
      addToast(
        error instanceof Error
          ? error.message
          : 'Failed to create organization',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this user? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/auth/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete user');

      setUsers((prev) => prev.filter((u) => u.id !== userId));
      addToast('User deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting user:', error);
      addToast('Failed to delete user', 'error');
    }
  };

  // =========================================================================
  // EFFECTS
  // =========================================================================

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'organizations' && isSuperAdmin) {
      fetchOrganizations();
    } else if (activeTab === 'audit-log') {
      fetchAuditLogs();
    }
  }, [activeTab, fetchUsers, fetchOrganizations, fetchAuditLogs, isSuperAdmin]);

  // =========================================================================
  // FILTERING
  // =========================================================================

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.full_name.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const filteredAuditLogs = auditLogs.filter(
    (log) =>
      log.user_email
        .toLowerCase()
        .includes(auditSearchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(auditSearchQuery.toLowerCase())
  );

  // =========================================================================
  // ROLE DEFINITIONS
  // =========================================================================

  const roleDefinitions: RoleDefinition[] = [
    {
      name: 'owner',
      display_name: 'Owner',
      description: 'Full system access and control',
      permissions: {
        'Manage Users': true,
        'Manage Orgs': true,
        'View Audits': true,
        'Export Logs': true,
        'Configure SSO': true,
        'Manage Roles': true,
        'View Compliance': true,
        'Generate Reports': true,
      },
    },
    {
      name: 'admin',
      display_name: 'Admin',
      description: 'Administrative access with restrictions',
      permissions: {
        'Manage Users': true,
        'Manage Orgs': false,
        'View Audits': true,
        'Export Logs': true,
        'Configure SSO': true,
        'Manage Roles': false,
        'View Compliance': true,
        'Generate Reports': true,
      },
    },
    {
      name: 'security_lead',
      display_name: 'Security Lead',
      description: 'Security and compliance management',
      permissions: {
        'Manage Users': false,
        'Manage Orgs': false,
        'View Audits': true,
        'Export Logs': true,
        'Configure SSO': false,
        'Manage Roles': false,
        'View Compliance': true,
        'Generate Reports': true,
      },
    },
    {
      name: 'analyst',
      display_name: 'Analyst',
      description: 'Data analysis and reporting',
      permissions: {
        'Manage Users': false,
        'Manage Orgs': false,
        'View Audits': true,
        'Export Logs': false,
        'Configure SSO': false,
        'Manage Roles': false,
        'View Compliance': true,
        'Generate Reports': true,
      },
    },
    {
      name: 'auditor',
      display_name: 'Auditor',
      description: 'Audit and compliance review',
      permissions: {
        'Manage Users': false,
        'Manage Orgs': false,
        'View Audits': true,
        'Export Logs': true,
        'Configure SSO': false,
        'Manage Roles': false,
        'View Compliance': true,
        'Generate Reports': true,
      },
    },
    {
      name: 'viewer',
      display_name: 'Viewer',
      description: 'Read-only access',
      permissions: {
        'Manage Users': false,
        'Manage Orgs': false,
        'View Audits': false,
        'Export Logs': false,
        'Configure SSO': false,
        'Manage Roles': false,
        'View Compliance': true,
        'Generate Reports': false,
      },
    },
  ];

  const permissionKeys = Object.keys(roleDefinitions[0]?.permissions || {});

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="min-h-screen bg-slate-50 animate-fadeIn">
      {/* ===== HEADER ===== */}
      <div className="bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">Administration</h1>
          </div>
          <p className="text-slate-600 ml-13">
            Manage users, organizations, roles, and system audit logs
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ===== TABS NAVIGATION ===== */}
        <div className="flex gap-8 border-b border-slate-200/60 mb-8 overflow-x-auto">
          {[
            { id: 'users', label: 'Users', icon: Users },
            { id: 'organizations', label: 'Organizations', icon: Building2 },
            { id: 'roles', label: 'Roles & Permissions', icon: Lock },
            { id: 'audit-log', label: 'Audit Log', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-1 py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-sky-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* ===== USERS TAB ===== */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users by email or name..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <button
                onClick={() => setShowUserModal(true)}
                className={cn(
                  'rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white',
                  'hover:bg-sky-600 transition-colors flex items-center gap-2'
                )}
              >
                <Plus className="h-4 w-4" />
                Add User
              </button>
            </div>

            {isLoading && filteredUsers.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No users found</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200/60">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Job Title
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60">
                      {filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-medium text-slate-900">
                              {user.full_name}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {user.job_title || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={cn(
                                'rounded-full px-2.5 py-1 text-xs font-medium',
                                user.role === 'owner'
                                  ? 'bg-red-100 text-red-700'
                                  : user.role === 'admin'
                                    ? 'bg-purple-100 text-purple-700'
                                    : user.role === 'security_lead'
                                      ? 'bg-orange-100 text-orange-700'
                                      : user.role === 'analyst'
                                        ? 'bg-blue-100 text-blue-700'
                                        : user.role === 'auditor'
                                          ? 'bg-green-100 text-green-700'
                                          : 'bg-slate-100 text-slate-700'
                              )}
                            >
                              {user.role === 'security_lead'
                                ? 'Security Lead'
                                : user.role.charAt(0).toUpperCase() +
                                  user.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {user.last_login
                              ? new Date(user.last_login).toLocaleDateString()
                              : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-slate-400 hover:text-red-600 transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== ORGANIZATIONS TAB ===== */}
        {activeTab === 'organizations' && isSuperAdmin && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                All Organizations
              </h2>
              <button
                onClick={() => setShowOrgModal(true)}
                className={cn(
                  'rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white',
                  'hover:bg-sky-600 transition-colors flex items-center gap-2'
                )}
              >
                <Plus className="h-4 w-4" />
                Create Organization
              </button>
            </div>

            {isLoading && organizations.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
              </div>
            ) : organizations.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No organizations found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {organizations.map((org) => (
                  <div
                    key={org.id}
                    className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 hover:border-sky-200/60 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {org.name}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {org.slug}
                        </p>
                      </div>
                      <button className="text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      {org.industry && (
                        <p className="text-slate-600">
                          <span className="font-medium text-slate-900">
                            Industry:
                          </span>{' '}
                          {org.industry}
                        </p>
                      )}
                      <p className="text-slate-600">
                        <span className="font-medium text-slate-900">
                          Members:
                        </span>{' '}
                        {org.member_count}
                      </p>
                      <p className="text-slate-600">
                        <span className="font-medium text-slate-900">
                          Created:
                        </span>{' '}
                        {new Date(org.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== ROLES & PERMISSIONS TAB ===== */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Role Definitions & Permissions
            </h2>

            <div className="space-y-4">
              {roleDefinitions.map((role) => (
                <div
                  key={role.name}
                  className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6"
                >
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-slate-900">
                      {role.display_name}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {role.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {permissionKeys.map((permission) => (
                      <div
                        key={`${role.name}-${permission}`}
                        className="flex items-center gap-2"
                      >
                        {role.permissions[permission] ? (
                          <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-slate-200 flex-shrink-0" />
                        )}
                        <span className="text-sm text-slate-600">
                          {permission}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== AUDIT LOG TAB ===== */}
        {activeTab === 'audit-log' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search audit logs..."
                  value={auditSearchQuery}
                  onChange={(e) => setAuditSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Export
              </button>
            </div>

            {isLoading && auditLogs.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
              </div>
            ) : filteredAuditLogs.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No audit logs found</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
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
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60">
                      {filteredAuditLogs.map((log) => (
                        <tr
                          key={log.id}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {log.user_email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={cn(
                                'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                                log.action === 'Login'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : log.action === 'Created'
                                    ? 'bg-sky-50 text-sky-700'
                                    : log.action === 'Updated' ||
                                        log.action === 'Modified'
                                      ? 'bg-amber-50 text-amber-700'
                                      : log.action === 'Deleted'
                                        ? 'bg-red-50 text-red-700'
                                        : 'bg-slate-100 text-slate-700'
                              )}
                            >
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                            {log.resource_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {log.details || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== ADD USER MODAL ===== */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200/60">
              <h2 className="text-lg font-semibold text-slate-900">Add User</h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, email: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newUserForm.password}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, password: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newUserForm.full_name}
                  onChange={(e) =>
                    setNewUserForm({
                      ...newUserForm,
                      full_name: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Job Title
                </label>
                <input
                  type="text"
                  value={newUserForm.job_title}
                  onChange={(e) =>
                    setNewUserForm({
                      ...newUserForm,
                      job_title: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Security Analyst"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={newUserForm.role}
                  onChange={(e) =>
                    setNewUserForm({
                      ...newUserForm,
                      role: e.target.value as UserRole,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="security_lead">Security Lead</option>
                  <option value="analyst">Analyst</option>
                  <option value="auditor">Auditor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== CREATE ORGANIZATION MODAL ===== */}
      {showOrgModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200/60">
              <h2 className="text-lg font-semibold text-slate-900">
                Create Organization
              </h2>
              <button
                onClick={() => setShowOrgModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrganization} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newOrgForm.name}
                  onChange={(e) =>
                    setNewOrgForm({ ...newOrgForm, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="ACME Corp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newOrgForm.slug}
                  onChange={(e) =>
                    setNewOrgForm({ ...newOrgForm, slug: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="acme-corp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Industry
                </label>
                <input
                  type="text"
                  value={newOrgForm.industry}
                  onChange={(e) =>
                    setNewOrgForm({ ...newOrgForm, industry: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Technology"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowOrgModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Organization
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== TOAST NOTIFICATIONS ===== */}
      <div className="fixed bottom-4 right-4 space-y-2 z-40">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg',
              toast.type === 'success' && 'bg-emerald-500',
              toast.type === 'error' && 'bg-red-500',
              toast.type === 'info' && 'bg-sky-500'
            )}
          >
            {toast.type === 'success' && (
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
            )}
            {toast.type === 'error' && (
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
            )}
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
