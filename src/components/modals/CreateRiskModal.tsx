'use client';

import { useState } from 'react';
import { Plus, X, AlertTriangle } from 'lucide-react';

interface CreateRiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RiskFormData) => Promise<void> | void;
}

export interface RiskFormData {
  title: string;
  description: string;
  category: string;
  likelihood: string;
  impact: string;
  treatment_strategy: string;
  owner: string;
  due_date?: string;
}

export default function CreateRiskModal({ isOpen, onClose, onSubmit }: CreateRiskModalProps) {
  const [formData, setFormData] = useState<RiskFormData>({
    title: '',
    description: '',
    category: 'operational',
    likelihood: 'medium',
    impact: 'medium',
    treatment_strategy: 'mitigate',
    owner: '',
    due_date: ''
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      alert('Please provide a risk title');
      return;
    }

    setSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Wait for the parent handler to complete
      await onSubmit(formData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'operational',
        likelihood: 'medium',
        impact: 'medium',
        treatment_strategy: 'mitigate',
        owner: '',
        due_date: ''
      });
      
      onClose();
    } catch (error) {
      alert('Failed to create risk');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateRiskScore = () => {
    const likelihoodScore = { low: 1, medium: 2, high: 3, critical: 4 }[formData.likelihood] || 2;
    const impactScore = { low: 1, medium: 2, high: 3, critical: 4 }[formData.impact] || 2;
    return likelihoodScore * impactScore;
  };

  const getRiskLevel = (score: number) => {
    if (score <= 2) return { label: 'Low', color: 'text-green-600 bg-green-50' };
    if (score <= 6) return { label: 'Medium', color: 'text-yellow-600 bg-yellow-50' };
    if (score <= 9) return { label: 'High', color: 'text-orange-600 bg-orange-50' };
    return { label: 'Critical', color: 'text-red-600 bg-red-50' };
  };

  const riskScore = calculateRiskScore();
  const riskLevel = getRiskLevel(riskScore);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create Risk</h2>
                <p className="text-gray-600 mt-1">Identify and assess a new risk</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={submitting}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Risk Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Risk Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Unauthorized access to production database"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the risk, its potential causes, and consequences..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Risk Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="operational">Operational</option>
                <option value="security">Security</option>
                <option value="compliance">Compliance</option>
                <option value="financial">Financial</option>
                <option value="reputational">Reputational</option>
                <option value="strategic">Strategic</option>
              </select>
            </div>

            {/* Treatment Strategy */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Treatment Strategy
              </label>
              <select
                value={formData.treatment_strategy}
                onChange={(e) => setFormData(prev => ({ ...prev, treatment_strategy: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="mitigate">Mitigate</option>
                <option value="accept">Accept</option>
                <option value="transfer">Transfer</option>
                <option value="avoid">Avoid</option>
              </select>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="border border-gray-200 rounded-xl p-5 space-y-4 bg-gray-50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              Risk Assessment
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Likelihood */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Likelihood
                </label>
                <select
                  value={formData.likelihood}
                  onChange={(e) => setFormData(prev => ({ ...prev, likelihood: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                >
                  <option value="low">Low (Rare)</option>
                  <option value="medium">Medium (Possible)</option>
                  <option value="high">High (Likely)</option>
                  <option value="critical">Critical (Almost Certain)</option>
                </select>
              </div>

              {/* Impact */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Impact
                </label>
                <select
                  value={formData.impact}
                  onChange={(e) => setFormData(prev => ({ ...prev, impact: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                >
                  <option value="low">Low (Minimal)</option>
                  <option value="medium">Medium (Moderate)</option>
                  <option value="high">High (Significant)</option>
                  <option value="critical">Critical (Severe)</option>
                </select>
              </div>
            </div>

            {/* Risk Score */}
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Calculated Risk Score</p>
                <p className="text-gray-500 text-xs">Likelihood × Impact</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">{riskScore}</span>
                <span className={`px-4 py-2 rounded-lg font-semibold ${riskLevel.color}`}>
                  {riskLevel.label}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Owner */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Risk Owner
              </label>
              <input
                type="text"
                value={formData.owner}
                onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
                placeholder="Responsible person or team"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Target Resolution Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!formData.title || submitting}
            className="px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Risk
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
