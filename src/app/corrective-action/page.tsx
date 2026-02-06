'use client';

import { useState, useEffect } from 'react';
import { Download, CheckSquare, AlertCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const DEFAULT_ORG_ID = 'default';

interface Finding {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved';
  controlRef: string;
  dueDate: string;
  description: string;
}

const severityColors = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const statusColors = {
  open: 'bg-slate-100 text-slate-800 border-slate-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

export default function CorrectiveActionPage() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFindings = async () => {
      try {
        const res = await fetch(`/api/findings?org_id=${DEFAULT_ORG_ID}`);
        if (res.ok) {
          const json = await res.json();
          const items = json.data || json || [];
          const filtered = items.filter((f: Finding) =>
            f.status === 'open' || f.status === 'in_progress'
          );
          setFindings(filtered);
        }
      } catch (err) {
        console.error('Failed to fetch findings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFindings();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/findings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updated = findings.map(f =>
          f.id === id ? { ...f, status: newStatus as any } : f
        );
        setFindings(updated);
      }
    } catch (err) {
      console.error('Failed to update finding:', err);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Title', 'Severity', 'Status', 'Control Ref', 'Due Date'];
    const rows = findings.map(f => [f.title, f.severity, f.status, f.controlRef, f.dueDate]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'findings.csv';
    a.click();
  };

  const criticalHighCount = findings.filter(f => f.severity === 'critical' || f.severity === 'high').length;
  const overdueCount = findings.filter(f => new Date(f.dueDate) < new Date()).length;
  const resolvedThisMonth = 0; // Would need historical data

  const stats = [
    {
      label: 'Total Open',
      value: findings.length,
      icon: CheckSquare,
      color: 'bg-sky-100',
    },
    {
      label: 'Critical/High',
      value: criticalHighCount,
      icon: AlertCircle,
      color: 'bg-red-100',
    },
    {
      label: 'Overdue',
      value: overdueCount,
      icon: Clock,
      color: 'bg-orange-100',
    },
    {
      label: 'Resolved (Month)',
      value: resolvedThisMonth,
      icon: CheckSquare,
      color: 'bg-emerald-100',
    },
  ];

  return (
    <div className="bg-slate-50/50 p-6 lg:p-8 min-h-screen animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Corrective Actions</h1>
            <p className="text-slate-600 text-sm mt-1">Track and manage corrective action plans</p>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={findings.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Download size={18} />
            Export
          </button>
        </div>

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

        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-slate-600">Loading findings...</p>
          </Card>
        ) : findings.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckSquare size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600 font-medium">All findings resolved!</p>
            <p className="text-slate-500 text-sm mt-1">No open or in-progress corrective actions</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Title</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Severity</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Status</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Control Ref</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Due Date</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {findings.map(finding => {
                    const isOverdue = new Date(finding.dueDate) < new Date();
                    const isDueSoon = !isOverdue && Math.ceil((new Date(finding.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) <= 7;
                    const rowBgClass = isOverdue ? 'bg-red-50' : isDueSoon ? 'bg-amber-50' : '';

                    return (
                      <tr key={finding.id} className={cn('border-b border-slate-200 hover:opacity-90 transition-colors', rowBgClass)}>
                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">{finding.title}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={cn('px-2.5 py-1 rounded-lg text-xs font-medium border capitalize', severityColors[finding.severity])}>
                            {finding.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <select
                            value={finding.status}
                            onChange={(e) => handleStatusChange(finding.id, e.target.value)}
                            className={cn('px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 bg-white cursor-pointer capitalize focus:outline-none focus:ring-2 focus:ring-sky-500', statusColors[finding.status])}
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-slate-600">{finding.controlRef}</td>
                        <td className="px-6 py-4 text-sm">
                          <div>
                            <p className="text-slate-900">{new Date(finding.dueDate).toLocaleDateString()}</p>
                            {isOverdue && <p className="text-xs text-red-600 font-medium">Overdue</p>}
                            {isDueSoon && <p className="text-xs text-amber-600 font-medium">Due soon</p>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button className="text-sky-600 hover:text-sky-700 transition-colors">
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
