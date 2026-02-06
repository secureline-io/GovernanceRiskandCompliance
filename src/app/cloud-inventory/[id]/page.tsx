'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Server, Globe, Shield, Tag, Clock, Edit2, Save, X,
  AlertTriangle, CheckCircle2, Wifi, WifiOff, FileText, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssetDetail {
  id: string;
  resource_id: string;
  resource_arn: string;
  resource_type: string;
  resource_name: string;
  service: string;
  provider: string;
  account_id: string;
  region: string;
  environment: string | null;
  team: string | null;
  criticality: string;
  data_classification: string | null;
  internet_exposed: boolean;
  lifecycle_state: string;
  tags: Record<string, string>;
  configuration: Record<string, unknown>;
  relationships: Array<{ type: string; target_arn: string; target_type: string }>;
  first_seen_at: string;
  last_seen_at: string;
  findings: Array<{ id: string; title: string; severity: string; status: string; first_detected_at: string }>;
  overrides: Array<{ field_name: string; override_value: string; reason: string; created_at: string }>;
}

const critColors: Record<string, { text: string; bg: string; border: string }> = {
  critical: { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
  high: { text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  medium: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  low: { text: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
};

const serviceIcons: Record<string, string> = {
  ec2: '🖥️', s3: '🪣', rds: '🗄️', vpc: '🌐', iam: '🔑', lambda: '⚡',
  eks: '📦', dynamodb: '🗄️', kms: '🔐', ebs: '💾', elb: '⚖️',
};

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [asset, setAsset] = useState<AssetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    criticality: '',
    environment: '',
    data_classification: '',
    team: '',
    internet_exposed: false,
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchAsset = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cloud-inventory/${id}`);
      if (res.ok) {
        const json = await res.json();
        setAsset(json.data);
        setEditForm({
          criticality: json.data.criticality || 'medium',
          environment: json.data.environment || '',
          data_classification: json.data.data_classification || '',
          team: json.data.team || '',
          internet_exposed: json.data.internet_exposed || false,
        });
      } else {
        setToast({ message: 'Asset not found', type: 'error' });
      }
    } catch (err) {
      console.error('Failed to fetch asset:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAsset(); }, [fetchAsset]);

  const handleSave = async () => {
    if (!asset) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/cloud-inventory/${asset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setToast({ message: 'Classification updated', type: 'success' });
        setEditing(false);
        await fetchAsset();
      } else {
        const err = await res.json();
        setToast({ message: err.error || 'Failed to save', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Failed to save', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="p-8 text-center">
        <Server className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">Asset not found</p>
        <Link href="/cloud-inventory" className="text-sky-600 hover:text-sky-700 text-sm mt-2 inline-block">
          Back to inventory
        </Link>
      </div>
    );
  }

  const crit = critColors[asset.criticality] || critColors.medium;

  return (
    <div className="bg-slate-50/50 p-6 lg:p-8 min-h-screen animate-fadeIn">
      {toast && (
        <div className={cn(
          'fixed top-4 right-4 px-4 py-3 rounded-xl text-sm font-medium text-white shadow-lg z-50 animate-fadeIn',
          toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
        )}>
          {toast.message}
        </div>
      )}

      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* Back + Header */}
        <div>
          <Link href="/cloud-inventory" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to inventory
          </Link>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-2xl shadow-sm">
                {serviceIcons[asset.service] || '📦'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{asset.resource_name}</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  {asset.resource_type?.replace(/_/g, ' ')} · {asset.service?.toUpperCase()} · {asset.region}
                </p>
                <p className="text-xs text-slate-400 font-mono mt-1 max-w-lg truncate">{asset.resource_arn}</p>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2 transition-all',
                editing
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
              )}
            >
              {editing ? <><X className="w-4 h-4" /> Cancel</> : <><Edit2 className="w-4 h-4" /> Edit Classification</>}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Classification Card */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Classification</h3>
              {editing ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Criticality</label>
                    <select value={editForm.criticality} onChange={e => setEditForm(f => ({ ...f, criticality: e.target.value }))}
                      className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                      {['critical', 'high', 'medium', 'low'].map(c => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Environment</label>
                    <select value={editForm.environment} onChange={e => setEditForm(f => ({ ...f, environment: e.target.value }))}
                      className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                      <option value="">Unset</option>
                      {['production', 'staging', 'development', 'testing', 'sandbox'].map(e => (
                        <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Data Classification</label>
                    <select value={editForm.data_classification} onChange={e => setEditForm(f => ({ ...f, data_classification: e.target.value }))}
                      className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                      <option value="">Unclassified</option>
                      {['public', 'internal', 'confidential', 'restricted'].map(c => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Team / Owner</label>
                    <input value={editForm.team} onChange={e => setEditForm(f => ({ ...f, team: e.target.value }))}
                      placeholder="e.g., platform-team"
                      className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                  </div>
                  <div className="col-span-2 flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input type="checkbox" checked={editForm.internet_exposed}
                        onChange={e => setEditForm(f => ({ ...f, internet_exposed: e.target.checked }))}
                        className="rounded border-slate-300" />
                      Internet Exposed
                    </label>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button onClick={handleSave} disabled={saving}
                      className="rounded-xl px-6 py-2.5 text-sm font-medium bg-sky-500 text-white hover:bg-sky-600 shadow-sm shadow-sky-500/25 flex items-center gap-2 disabled:opacity-50">
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">Criticality</p>
                    <span className={cn('px-2.5 py-1 rounded-lg text-xs font-medium border capitalize', crit.text, crit.bg, crit.border)}>
                      {asset.criticality}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">Environment</p>
                    <p className="text-sm text-slate-900 capitalize">{asset.environment || 'Untagged'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">Classification</p>
                    <p className="text-sm text-slate-900 capitalize">{asset.data_classification || 'Unclassified'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">Team / Owner</p>
                    <p className="text-sm text-slate-900">{asset.team || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">Internet Exposed</p>
                    {asset.internet_exposed ? (
                      <span className="flex items-center gap-1 text-sm text-red-600 font-medium"><Wifi className="w-4 h-4" /> Yes</span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-slate-500"><WifiOff className="w-4 h-4" /> No</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">Lifecycle</p>
                    <p className="text-sm text-slate-900 capitalize">{asset.lifecycle_state}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Configuration */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Configuration</h3>
              <div className="bg-slate-50 rounded-lg p-4 font-mono text-xs text-slate-700 overflow-x-auto max-h-64 overflow-y-auto">
                <pre>{JSON.stringify(asset.configuration, null, 2)}</pre>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-slate-400" /> Tags
              </h3>
              {asset.tags && Object.keys(asset.tags).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(asset.tags).map(([key, value]) => (
                    <span key={key} className="px-3 py-1.5 bg-slate-50 rounded-lg text-xs border border-slate-200">
                      <span className="font-medium text-slate-700">{key}</span>
                      <span className="text-slate-400 mx-1">=</span>
                      <span className="text-slate-600">{value}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No tags found</p>
              )}
            </div>

            {/* Findings */}
            {asset.findings && asset.findings.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" /> Security Findings
                </h3>
                <div className="space-y-2">
                  {asset.findings.map(f => (
                    <div key={f.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{f.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Detected: {new Date(f.first_detected_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium capitalize',
                          f.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          f.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                          'bg-amber-100 text-amber-700'
                        )}>
                          {f.severity}
                        </span>
                        <span className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium capitalize',
                          f.status === 'open' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                        )}>
                          {f.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metadata */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Resource Details</h3>
              <div className="space-y-3">
                {[
                  { label: 'Provider', value: asset.provider?.toUpperCase() },
                  { label: 'Account', value: asset.account_id },
                  { label: 'Region', value: asset.region },
                  { label: 'Service', value: asset.service?.toUpperCase() },
                  { label: 'Type', value: asset.resource_type?.replace(/_/g, ' ') },
                  { label: 'Resource ID', value: asset.resource_id, mono: true },
                  { label: 'First Seen', value: asset.first_seen_at ? new Date(asset.first_seen_at).toLocaleString() : '—' },
                  { label: 'Last Seen', value: asset.last_seen_at ? new Date(asset.last_seen_at).toLocaleString() : '—' },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-xs text-slate-400 font-medium">{item.label}</p>
                    <p className={cn('text-sm text-slate-700 break-all', item.mono && 'font-mono text-xs')}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Relationships */}
            {asset.relationships && asset.relationships.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Relationships</h3>
                <div className="space-y-2">
                  {asset.relationships.map((rel, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                      <p className="font-medium text-slate-700 capitalize">{rel.type?.replace(/_/g, ' ')}</p>
                      <p className="text-slate-500 font-mono truncate mt-0.5">{rel.target_arn}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overrides */}
            {asset.overrides && asset.overrides.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Manual Overrides</h3>
                <div className="space-y-2">
                  {asset.overrides.map((o, i) => (
                    <div key={i} className="p-2.5 bg-amber-50 rounded-lg border border-amber-100 text-xs">
                      <p className="font-medium text-amber-800">{o.field_name}: {o.override_value}</p>
                      <p className="text-amber-600 mt-0.5">{o.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
