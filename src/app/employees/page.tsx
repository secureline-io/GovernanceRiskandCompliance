'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Download, Users, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/AuthContext';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'auditor' | 'analyst' | 'viewer';
  department: string;
}

const roleColors = {
  admin: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  auditor: 'bg-sky-100 text-sky-800 border-sky-200',
  analyst: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  viewer: 'bg-slate-100 text-slate-800 border-slate-200',
};

export default function EmployeesPage() {
  const { currentOrg } = useAuth();
  const orgId = currentOrg?.org_id || 'default';
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'analyst' as const,
    department: '',
  });

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

  const handleAddEmployee = () => {
    const newEmployee: Employee = {
      id: Date.now().toString(),
      ...formData,
    };
    saveEmployees([...employees, newEmployee]);
    setFormData({
      name: '',
      email: '',
      role: 'analyst',
      department: '',
    });
    setShowForm(false);
  };

  const handleDeleteEmployee = (id: string) => {
    saveEmployees(employees.filter(e => e.id !== id));
  };

  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    {
      label: 'Total Employees',
      value: employees.length,
      icon: Users,
      color: 'bg-sky-100',
    },
    {
      label: 'Admins',
      value: employees.filter(e => e.role === 'admin').length,
      icon: Users,
      color: 'bg-indigo-100',
    },
    {
      label: 'Auditors',
      value: employees.filter(e => e.role === 'auditor').length,
      icon: Users,
      color: 'bg-sky-100',
    },
    {
      label: 'Analysts',
      value: employees.filter(e => e.role === 'analyst').length,
      icon: Users,
      color: 'bg-emerald-100',
    },
  ];

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Department'];
    const rows = employees.map(e => [e.name, e.email, e.role, e.department]);
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Employee Directory</h1>
            <p className="text-slate-600 text-sm mt-1">Manage employee roles and access</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportCSV}
              disabled={employees.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Download size={18} />
              Export
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl active:scale-95 transition-all"
            >
              <Plus size={18} />
              Add Employee
            </button>
          </div>
        </div>

        <Card className="p-4 mb-8 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-900">
            Employee directory stored locally. Enable SSO for automatic sync.
          </p>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.color)}>
                    <Icon size={20} className="text-slate-700" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {showForm && (
          <Card className="p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-slate-900">Add New Employee</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="admin">Admin</option>
                <option value="auditor">Auditor</option>
                <option value="analyst">Analyst</option>
                <option value="viewer">Viewer</option>
              </select>
              <input
                type="text"
                placeholder="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                onClick={handleAddEmployee}
                disabled={!formData.name || !formData.email}
                className="col-span-1 sm:col-span-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Add Employee
              </button>
            </div>
          </Card>
        )}

        {employees.length === 0 ? (
          <Card className="p-12 text-center">
            <Users size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600 font-medium">No employees yet</p>
            <p className="text-slate-500 text-sm mt-1">Add your first employee to get started</p>
          </Card>
        ) : (
          <>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Name</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Email</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Role</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Department</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map(employee => (
                      <tr key={employee.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">{employee.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{employee.email}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={cn('px-2.5 py-1 rounded-lg text-xs font-medium border capitalize', roleColors[employee.role])}>
                            {employee.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{employee.department || '—'}</td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleDeleteEmployee(employee.id)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
