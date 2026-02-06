'use client';

import { useState } from 'react';
import { X, Shield } from 'lucide-react';

export interface ControlFormData {
  code: string;
  name: string;
  description: string;
  category: string;
  control_type: string;
  control_nature: string;
  frequency: string;
  owner: string;
  implementation_details: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ControlFormData) => Promise<void>;
}

export default function CreateControlModal({ isOpen, onClose, onSubmit }: Props) {
  const [formData, setFormData] = useState<ControlFormData>({
    code: '',
    name: '',
    description: '',
    category: 'access_control',
    control_type: 'preventive',
    control_nature: 'manual',
    frequency: 'continuous',
    owner: '',
    implementation_details: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      setError('Code and Name are required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit(formData);
      setFormData({
        code: '', name: '', description: '', category: 'access_control',
        control_type: 'preventive', control_nature: 'manual', frequency: 'continuous',
        owner: '', implementation_details: ''
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create control');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Add Control</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-zinc-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Control Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={e => setFormData(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="e.g., AC-001"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              >
                <option value="access_control">Access Control</option>
                <option value="change_management">Change Management</option>
                <option value="security_operations">Security Operations</option>
                <option value="risk_management">Risk Management</option>
                <option value="data_protection">Data Protection</option>
                <option value="incident_response">Incident Response</option>
                <option value="business_continuity">Business Continuity</option>
                <option value="compliance">Compliance</option>
                <option value="governance">Governance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Control Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g., Multi-Factor Authentication"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="Describe the control objective and implementation..."
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Type</label>
              <select
                value={formData.control_type}
                onChange={e => setFormData(f => ({ ...f, control_type: e.target.value }))}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              >
                <option value="preventive">Preventive</option>
                <option value="detective">Detective</option>
                <option value="corrective">Corrective</option>
                <option value="compensating">Compensating</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Nature</label>
              <select
                value={formData.control_nature}
                onChange={e => setFormData(f => ({ ...f, control_nature: e.target.value }))}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              >
                <option value="manual">Manual</option>
                <option value="automated">Automated</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Frequency</label>
              <select
                value={formData.frequency}
                onChange={e => setFormData(f => ({ ...f, frequency: e.target.value }))}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              >
                <option value="continuous">Continuous</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Implementation Details</label>
            <textarea
              value={formData.implementation_details}
              onChange={e => setFormData(f => ({ ...f, implementation_details: e.target.value }))}
              rows={2}
              placeholder="How is this control implemented?"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Control'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
