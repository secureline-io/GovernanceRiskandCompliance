'use client';

import { useState, useEffect } from 'react';
import { Key, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const DEFAULT_ORG_ID = 'default';

interface Control {
  id: string;
  code: string;
  title: string;
  category: string;
  status: 'compliant' | 'non_compliant' | 'pending_review';
  description: string;
}

interface AccessReview {
  id: string;
  name: string;
  completed: boolean;
  lastReviewDate: string | null;
}

export default function AccessPage() {
  const [controls, setControls] = useState<Control[]>([]);
  const [reviews, setReviews] = useState<AccessReview[]>([
    { id: '1', name: 'Privileged Access Review', completed: false, lastReviewDate: null },
    { id: '2', name: 'User Access Certification', completed: false, lastReviewDate: null },
    { id: '3', name: 'Service Account Audit', completed: true, lastReviewDate: '2024-12-15' },
    { id: '4', name: 'Third-Party Access Review', completed: false, lastReviewDate: null },
    { id: '5', name: 'Dormant Account Cleanup', completed: true, lastReviewDate: '2024-11-20' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('grc_access_reviews');
    if (stored) {
      setReviews(JSON.parse(stored));
    }

    const fetchControls = async () => {
      try {
        const res = await fetch(`/api/controls?org_id=${DEFAULT_ORG_ID}`);
        if (res.ok) {
          const data = await res.json();
          const filtered = data.filter((c: Control) =>
            c.category.toLowerCase().includes('access') || c.code.startsWith('AC-')
          );
          setControls(filtered);
        }
      } catch (err) {
        console.error('Failed to fetch controls:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchControls();
  }, []);

  const saveReviews = (newReviews: AccessReview[]) => {
    setReviews(newReviews);
    localStorage.setItem('grc_access_reviews', JSON.stringify(newReviews));
  };

  const toggleReview = (id: string) => {
    const updated = reviews.map(r =>
      r.id === id
        ? { ...r, completed: !r.completed, lastReviewDate: !r.completed ? new Date().toISOString().split('T')[0] : r.lastReviewDate }
        : r
    );
    saveReviews(updated);
  };

  const stats = [
    {
      label: 'Total Access Controls',
      value: controls.length,
      icon: Key,
      color: 'bg-sky-100',
    },
    {
      label: 'Compliant',
      value: controls.filter(c => c.status === 'compliant').length,
      icon: CheckCircle,
      color: 'bg-emerald-100',
    },
    {
      label: 'Non-Compliant',
      value: controls.filter(c => c.status === 'non_compliant').length,
      icon: AlertCircle,
      color: 'bg-red-100',
    },
    {
      label: 'Pending Review',
      value: controls.filter(c => c.status === 'pending_review').length,
      icon: Clock,
      color: 'bg-amber-100',
    },
  ];

  const statusBadgeStyles = {
    compliant: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    non_compliant: 'bg-red-100 text-red-800 border-red-200',
    pending_review: 'bg-amber-100 text-amber-800 border-amber-200',
  };

  return (
    <div className="bg-slate-50/50 p-6 lg:p-8 min-h-screen animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Access Control</h1>
          <p className="text-slate-600 text-sm mt-1">Manage and monitor access control systems</p>
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

        <Card className="p-6 mb-8">
          <h2 className="font-semibold text-slate-900 mb-6">Access Review Checklist</h2>
          <div className="space-y-3">
            {reviews.map(review => (
              <div key={review.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={review.completed}
                  onChange={() => toggleReview(review.id)}
                  className="w-5 h-5 rounded border-slate-300 cursor-pointer"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{review.name}</p>
                  {review.lastReviewDate && (
                    <p className="text-xs text-slate-500">Last review: {review.lastReviewDate}</p>
                  )}
                </div>
                {review.completed && (
                  <CheckCircle size={18} className="text-emerald-600" />
                )}
              </div>
            ))}
          </div>
        </Card>

        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-slate-600">Loading access controls...</p>
          </Card>
        ) : controls.length === 0 ? (
          <Card className="p-12 text-center">
            <Key size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600 font-medium">No access controls found</p>
            <p className="text-slate-500 text-sm mt-1">Access controls will appear here once configured</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Control Code</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Title</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Category</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {controls.map(control => (
                    <tr key={control.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-slate-900">{control.code}</td>
                      <td className="px-6 py-4 text-sm text-slate-900">{control.title}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{control.category}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={cn('px-2.5 py-1 rounded-lg text-xs font-medium border', statusBadgeStyles[control.status])}>
                          {control.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
