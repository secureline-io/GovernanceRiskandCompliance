'use client';

import { useState, useEffect } from 'react';
import { Plus, X, GraduationCap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const DEFAULT_ORG_ID = 'default';

interface TrainingProgram {
  id: string;
  name: string;
  frequency: 'monthly' | 'quarterly' | 'annual';
  completionRate: number;
  dueDate: string;
}

const frequencyBadges = {
  monthly: 'bg-blue-100 text-blue-800 border-blue-200',
  quarterly: 'bg-purple-100 text-purple-800 border-purple-200',
  annual: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

export default function TrainingPage() {
  const [programs, setPrograms] = useState<TrainingProgram[]>([
    {
      id: '1',
      name: 'Security Awareness',
      frequency: 'annual',
      completionRate: 72,
      dueDate: '2025-03-15',
    },
    {
      id: '2',
      name: 'Data Privacy',
      frequency: 'quarterly',
      completionRate: 85,
      dueDate: '2025-02-28',
    },
    {
      id: '3',
      name: 'Incident Response',
      frequency: 'annual',
      completionRate: 45,
      dueDate: '2025-05-30',
    },
    {
      id: '4',
      name: 'Phishing Simulation',
      frequency: 'monthly',
      completionRate: 91,
      dueDate: '2025-02-15',
    },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    frequency: 'annual' as const,
    completionRate: 0,
    dueDate: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('grc_training');
    if (stored) {
      setPrograms(JSON.parse(stored));
    }
  }, []);

  const savePrograms = (newPrograms: TrainingProgram[]) => {
    setPrograms(newPrograms);
    localStorage.setItem('grc_training', JSON.stringify(newPrograms));
  };

  const handleAddProgram = () => {
    const newProgram: TrainingProgram = {
      id: Date.now().toString(),
      ...formData,
    };
    savePrograms([...programs, newProgram]);
    setFormData({
      name: '',
      frequency: 'annual',
      completionRate: 0,
      dueDate: '',
    });
    setShowForm(false);
  };

  const handleDeleteProgram = (id: string) => {
    savePrograms(programs.filter(p => p.id !== id));
  };

  const avgCompletion = programs.length > 0 ? Math.round(programs.reduce((sum, p) => sum + p.completionRate, 0) / programs.length) : 0;
  const overduePrograms = programs.filter(p => new Date(p.dueDate) < new Date()).length;
  const upcomingPrograms = programs.filter(p => {
    const daysUntilDue = Math.ceil((new Date(p.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue > 0 && daysUntilDue <= 30;
  }).length;

  const stats = [
    {
      label: 'Total Programs',
      value: programs.length,
      icon: GraduationCap,
      color: 'bg-sky-100',
    },
    {
      label: 'Avg Completion',
      value: `${avgCompletion}%`,
      icon: GraduationCap,
      color: 'bg-emerald-100',
    },
    {
      label: 'Overdue',
      value: overduePrograms,
      icon: GraduationCap,
      color: 'bg-red-100',
    },
    {
      label: 'Upcoming (30 days)',
      value: upcomingPrograms,
      icon: GraduationCap,
      color: 'bg-amber-100',
    },
  ];

  return (
    <div className="bg-slate-50/50 p-6 lg:p-8 min-h-screen animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Training Management</h1>
            <p className="text-slate-600 text-sm mt-1">Track compliance training programs</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl active:scale-95 transition-all"
          >
            <Plus size={18} />
            Add Program
          </button>
        </div>

        <Card className="p-4 mb-8 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-900">
            Training data stored locally. Connect an LMS for automatic tracking.
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
              <h3 className="font-semibold text-slate-900">Add Training Program</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Program name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
              <input
                type="number"
                placeholder="Completion rate (%)"
                min="0"
                max="100"
                value={formData.completionRate}
                onChange={(e) => setFormData({ ...formData, completionRate: parseInt(e.target.value) || 0 })}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                onClick={handleAddProgram}
                disabled={!formData.name || !formData.dueDate}
                className="col-span-1 sm:col-span-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Add Program
              </button>
            </div>
          </Card>
        )}

        {programs.length === 0 ? (
          <Card className="p-12 text-center">
            <GraduationCap size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600 font-medium">No training programs yet</p>
            <p className="text-slate-500 text-sm mt-1">Add your first program to get started</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {programs.map(program => (
              <Card key={program.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">{program.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">Due: {new Date(program.dueDate).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteProgram(program.id)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <span className={cn('inline-block px-2.5 py-1 rounded-lg text-xs font-medium border capitalize mb-4', frequencyBadges[program.frequency])}>
                  {program.frequency}
                </span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">Completion</p>
                    <p className="text-sm font-semibold text-slate-900">{program.completionRate}%</p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-sky-500 h-2 rounded-full transition-all"
                      style={{ width: `${program.completionRate}%` }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
