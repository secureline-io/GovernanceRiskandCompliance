'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Download, Trash2, Edit2, Search, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'auditor' | 'analyst' | 'viewer';
  department: string;
  status: 'active' | 'inactive';
  policyStatus: 'accepted' | 'pending' | 'not_sent';
  trainingStatus: 'completed' | 'in_progress' | 'not_started';
  joinDate: string;
}

const roleColors = {
  admin: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  auditor: 'bg-sky-100 text-sky-800 border-sky-200',
  analyst: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  viewer: 'bg-slate-100 text-slate-800 border-slate-200',
};

const statusColors = {
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  inactive: 'bg-slate-100 text-slate-800 border-slate-200',
};

const policyStatusColors = {
  accepted: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  not_sent: 'bg-slate-100 text-slate-800',
};

const trainingStatusColors = {
  completed: 'bg-emerald-100 text-emerald-800',
  in_progress: 'bg-sky-100 text-sky-800',
  not_started: 'bg-slate-100 text-slate-800',
};

const CHART_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#8b5cf6', '#ec4899'];

export default function EmployeesPage() {
  const { currentOrg } = useAuth();
  const orgId = currentOrg?.org_id || 'default';
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'all'>('overview');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Employee['role']>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'analyst' as const,
    department: '',
    status: 'active' as const,
  });

  const itemsPerPage = 20;

  useEffect(() => {
    const stored = localStorage.getItem('grc_employees');
    if (stored) {
      setEmployees(JSON.parse(stored));
    }
  }, []);

  const saveEmployees = (newEmployees: Employee[]) => {
    setEmployees(newEmployees);
    localStorage.setItem('grc_employees', JSON.stringify(newEmployees));
  };

  const getRandomStatus = <T extends string>(
    options: readonly T[]
  ): T => {
    return options[Math.floor(Math.random() * options.length)];
  };

  const handleAddEmployee = () => {
    if (!formData.name || !formData.email) return;

    if (editingId) {
      const updated = employees.map(e =>
        e.id === editingId
          ? {
              ...e,
              ...formData,
            }
          : e
      );
      saveEmployees(updated);
      setEditingId(null);
    } else {
      const newEmployee: Employee = {
        id: Date.now().toString(),
        ...formData,
        policyStatus: getRandomStatus(['accepted', 'pending', 'not_sent']),
        trainingStatus: getRandomStatus(['completed', 'in_progress', 'not_started']),
        joinDate: new Date().toISOString().split('T')[0],
      };
      saveEmployees([...employees, newEmployee]);
    }

    setFormData({
      name: '',
      email: '',
      role: 'analyst',
      department: '',
      status: 'active',
    });
    setShowAddForm(false);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingId(employee.id);
    setFormData({
      name: employee.name,
      email: employee.email,
      role: employee.role as 'analyst',
      department: employee.department,
      status: employee.status as 'active',
    });
    setShowAddForm(true);
  };

  const handleDeleteEmployee = (id: string) => {
    saveEmployees(employees.filter(e => e.id !== id));
  };

  const filteredEmployees = employees.filter(e => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || e.role === roleFilter;
    const matchesDepartment = departmentFilter === 'all' || e.department === departmentFilter;
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  // Overview metrics
  const activeCount = employees.filter(e => e.status === 'active').length;
  const offboardingCount = employees.filter(e => e.status === 'inactive').length;
  const trainingCompletedCount = employees.filter(
    e => e.trainingStatus === 'completed'
  ).length;
  const nonPersonnelCount = 0; // Placeholder

  // Policy acceptance chart data
  const policyChartData = [
    {
      name: 'Accepted',
      value: employees.filter(e => e.policyStatus === 'accepted').length,
    },
    { name: 'Pending', value: employees.filter(e => e.policyStatus === 'pending').length },
    {
      name: 'Not Sent',
      value: employees.filter(e => e.policyStatus === 'not_sent').length,
    },
  ].filter(item => item.value > 0);

  // Campaign completion chart data
  const campaignChartData = [
    { name: 'Completed', value: employees.filter(e => e.trainingStatus === 'completed').length },
    {
      name: 'In Progress',
      value: employees.filter(e => e.trainingStatus === 'in_progress').length,
    },
    {
      name: 'Not Started',
      value: employees.filter(e => e.trainingStatus === 'not_started').length,
    },
  ].filter(item => item.value > 0);

  // Department distribution
  const deptDistribution = Array.from(
    new Set(employees.filter(e => e.department).map(e => e.department))
  )
    .map(dept => ({
      name: dept,
      count: employees.filter(e => e.department === dept).length,
    }))
    .sort((a, b) => b.count - a.count);

  // Role distribution
  const roleDistribution = [
    { role: 'Admin', count: employees.filter(e => e.role === 'admin').length },
    { role: 'Auditor', count: employees.filter(e => e.role === 'auditor').length },
    { role: 'Analyst', count: employees.filter(e => e.role === 'analyst').length },
    { role: 'Viewer', count: employees.filter(e => e.role === 'viewer').length },
  ].filter(r => r.count > 0);

  const departments = Array.from(new Set(employees.map(e => e.department))).filter(Boolean);

  // Custom label for donut chart
  const renderCustomLabel = (value: number, total: number) => {
    const percentage = total === 0 ? 0 : Math.round((value / total) * 100);
    return `${percentage}%`;
  };

  const policyTotal = policyChartData.reduce((sum, item) => sum + item.value, 0);
  const campaignTotal = campaignChartData.reduce((sum, item) => sum + item.value, 0);

  const exportCSV = () => {
    const headers = [
      'Name',
      'Email',
      'Role',
      'Department',
      'Status',
      'Policy Status',
      'Training Status',
      'Join Date',
    ];
    const rows = employees.map(e => [
      e.name,
      e.email,
      e.role,
      e.department,
      e.status,
      e.policyStatus,
      e.trainingStatus,
      e.joinDate,
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees.csv';
    a.click();
  };

  return (
    <div className="bg-slate-50/50 p-6 lg:p-8 min-h-screen animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Employees</h1>
            <p className="text-slate-600 text-sm mt-1">
              Manage employee roles, access, and compliance training
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportCSV}
              disabled={employees.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Download size={18} />
              Export CSV
            </button>
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  name: '',
                  email: '',
                  role: 'analyst',
                  department: '',
                  status: 'active',
                });
                setShowAddForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg active:scale-95 transition-all"
            >
              <Plus size={18} />
              Add Employee
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              'px-4 py-3 font-medium text-sm border-b-2 transition-colors',
              activeTab === 'overview'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              'px-4 py-3 font-medium text-sm border-b-2 transition-colors',
              activeTab === 'all'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            )}
          >
            All Employees
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Technical Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-emerald-200 bg-emerald-50/50">
                <CardContent className="pt-6">
                  <p className="text-sm text-emerald-700 font-medium">Active Employees</p>
                  <p className="text-3xl font-bold text-emerald-900 mt-2">{activeCount}</p>
                </CardContent>
              </Card>
              <Card className="border-amber-200 bg-amber-50/50">
                <CardContent className="pt-6">
                  <p className="text-sm text-amber-700 font-medium">Offboarding Needed</p>
                  <p className="text-3xl font-bold text-amber-900 mt-2">{offboardingCount}</p>
                </CardContent>
              </Card>
              <Card className="border-sky-200 bg-sky-50/50">
                <CardContent className="pt-6">
                  <p className="text-sm text-sky-700 font-medium">Completed Training</p>
                  <p className="text-3xl font-bold text-sky-900 mt-2">{trainingCompletedCount}</p>
                </CardContent>
              </Card>
              <Card className="border-slate-200">
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-700 font-medium">Non-Personnel</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{nonPersonnelCount}</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Policy Acceptance Rate */}
              <Card>
                <CardHeader>
                  <CardTitle>Policy Acceptance Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  {policyChartData.length > 0 ? (
                    <div className="flex justify-center">
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={policyChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ value }) => renderCustomLabel(value, policyTotal)}
                          >
                            {policyChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-slate-500">
                      No policy data
                    </div>
                  )}
                  <div className="mt-4 space-y-2 text-sm">
                    {policyChartData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                          />
                          <span className="text-slate-600">{item.name}</span>
                        </div>
                        <span className="font-semibold text-slate-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Campaign Completion Rate */}
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  {campaignChartData.length > 0 ? (
                    <div className="flex justify-center">
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={campaignChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ value }) => renderCustomLabel(value, campaignTotal)}
                          >
                            {campaignChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-slate-500">
                      No campaign data
                    </div>
                  )}
                  <div className="mt-4 space-y-2 text-sm">
                    {campaignChartData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                          />
                          <span className="text-slate-600">{item.name}</span>
                        </div>
                        <span className="font-semibold text-slate-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Department Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Department Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {deptDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={deptDistribution}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0ea5e9" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-500">
                    No department data
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Role Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Role Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {roleDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={roleDistribution} layout="vertical">
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="role" width={80} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0ea5e9" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-500">
                    No role data
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* All Employees Tab */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Role and Department Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {['all', 'admin', 'auditor', 'analyst', 'viewer'].map(role => (
                    <button
                      key={role}
                      onClick={() => {
                        setRoleFilter(role as any);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        'px-4 py-2 rounded-lg whitespace-nowrap font-medium text-sm transition-all',
                        roleFilter === role
                          ? 'bg-sky-500 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      )}
                    >
                      {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>

                <select
                  value={departmentFilter}
                  onChange={(e) => {
                    setDepartmentFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Add Employee Form */}
            {showAddForm && (
              <Card className="border-sky-200 bg-sky-50/50">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-semibold text-slate-900">
                      {editingId ? 'Edit Employee' : 'Add New Employee'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingId(null);
                      }}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <input
                      type="text"
                      placeholder="Department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="admin">Admin</option>
                      <option value="auditor">Auditor</option>
                      <option value="analyst">Analyst</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <div />
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleAddEmployee}
                      disabled={!formData.name || !formData.email}
                      className="flex-1 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                    >
                      {editingId ? 'Update Employee' : 'Add Employee'}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingId(null);
                      }}
                      className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Employees Table */}
            {employees.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <Users size={48} className="mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 font-medium">No employees yet</p>
                <p className="text-slate-500 text-sm mt-1">Add your first employee to get started</p>
              </Card>
            ) : (
              <>
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Name</th>
                          <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Email</th>
                          <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Role</th>
                          <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Department</th>
                          <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Status</th>
                          <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Policy</th>
                          <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Training</th>
                          <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedEmployees.map(employee => (
                          <tr key={employee.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{employee.name}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{employee.email}</td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={cn(
                                  'px-2.5 py-1 rounded-lg text-xs font-medium border capitalize',
                                  roleColors[employee.role]
                                )}
                              >
                                {employee.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{employee.department || '—'}</td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={cn(
                                  'px-2.5 py-1 rounded-lg text-xs font-medium border capitalize',
                                  statusColors[employee.status]
                                )}
                              >
                                {employee.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={cn(
                                  'px-2.5 py-1 rounded-lg text-xs font-medium capitalize',
                                  policyStatusColors[employee.policyStatus]
                                )}
                              >
                                {employee.policyStatus.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={cn(
                                  'px-2.5 py-1 rounded-lg text-xs font-medium capitalize',
                                  trainingStatusColors[employee.trainingStatus]
                                )}
                              >
                                {employee.trainingStatus.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditEmployee(employee)}
                                  className="text-sky-600 hover:text-sky-700 transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteEmployee(employee.id)}
                                  className="text-red-600 hover:text-red-700 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                      {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of{' '}
                      {filteredEmployees.length} employees
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={cn(
                              'w-10 h-10 rounded-lg font-medium transition-all',
                              currentPage === page
                                ? 'bg-sky-500 text-white'
                                : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                            )}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
