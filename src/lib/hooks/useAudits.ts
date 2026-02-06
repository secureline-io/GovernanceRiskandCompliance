import { useCallback, useEffect, useState } from 'react';

const DEFAULT_ORG_ID = 'default';

export interface Audit {
  id: string;
  org_id: string;
  name: string;
  audit_type: 'internal' | 'external' | 'regulatory' | 'certification';
  status: 'planning' | 'in_progress' | 'fieldwork' | 'reporting' | 'completed' | 'closed';
  start_date?: string;
  end_date?: string;
  auditor?: string;
  lead_auditor_name?: string;
  scope: string[];
  frameworks: string[];
  description?: string;
  progress: number;
  findings_count?: number;
  audit_findings?: AuditFinding[];
  created_at: string;
  updated_at: string;
}

export interface AuditFinding {
  id: string;
  audit_id: string;
  org_id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'informational';
  status: 'open' | 'remediation' | 'verified' | 'closed';
  control_ref?: string;
  description?: string;
  remediation_plan?: string;
  due_date?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditReadinessItem {
  id: string;
  audit_id: string;
  org_id: string;
  title: string;
  category: 'evidence' | 'controls' | 'policies' | 'training' | 'vendor';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assigned_to?: string;
  due_date?: string;
  notes?: string;
  created_at: string;
}

interface UseAuditsReturn {
  audits: Audit[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createAudit: (data: Partial<Audit>) => Promise<Audit>;
  updateAudit: (id: string, data: Partial<Audit>) => Promise<Audit>;
  deleteAudit: (id: string) => Promise<boolean>;
  createFinding: (auditId: string, data: Partial<AuditFinding>) => Promise<AuditFinding>;
  fetchReadiness: (auditId: string) => Promise<AuditReadinessItem[]>;
  createReadinessItem: (auditId: string, data: Partial<AuditReadinessItem>) => Promise<AuditReadinessItem>;
}

export const useAudits = (): UseAuditsReturn => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/audits?org_id=${DEFAULT_ORG_ID}`);
      if (!response.ok) throw new Error('Failed to fetch audits');
      const { data } = await response.json();
      setAudits(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createAudit = useCallback(async (data: Partial<Audit>) => {
    try {
      const response = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: DEFAULT_ORG_ID, ...data })
      });
      if (!response.ok) throw new Error('Failed to create audit');
      const { data: audit } = await response.json();
      setAudits((prev) => [...prev, audit]);
      return audit;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Unknown error');
    }
  }, []);

  const updateAudit = useCallback(async (id: string, data: Partial<Audit>) => {
    try {
      const response = await fetch(`/api/audits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update audit');
      const { data: audit } = await response.json();
      setAudits((prev) => prev.map((a) => (a.id === id ? audit : a)));
      return audit;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Unknown error');
    }
  }, []);

  const deleteAudit = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/audits/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete audit');
      setAudits((prev) => prev.filter((a) => a.id !== id));
      return true;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Unknown error');
    }
  }, []);

  const createFinding = useCallback(async (auditId: string, data: Partial<AuditFinding>) => {
    try {
      const response = await fetch(`/api/audits/${auditId}/findings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: DEFAULT_ORG_ID, ...data })
      });
      if (!response.ok) throw new Error('Failed to create finding');
      const { data: finding } = await response.json();
      return finding;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Unknown error');
    }
  }, []);

  const fetchReadiness = useCallback(async (auditId: string) => {
    try {
      const response = await fetch(`/api/audits/${auditId}/readiness?org_id=${DEFAULT_ORG_ID}`);
      if (!response.ok) throw new Error('Failed to fetch readiness items');
      const { data } = await response.json();
      return data || [];
    } catch (err) {
      throw err instanceof Error ? err : new Error('Unknown error');
    }
  }, []);

  const createReadinessItem = useCallback(async (auditId: string, data: Partial<AuditReadinessItem>) => {
    try {
      const response = await fetch(`/api/audits/${auditId}/readiness`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: DEFAULT_ORG_ID, ...data })
      });
      if (!response.ok) throw new Error('Failed to create readiness item');
      const { data: item } = await response.json();
      return item;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Unknown error');
    }
  }, []);

  return {
    audits,
    loading,
    error,
    refetch,
    createAudit,
    updateAudit,
    deleteAudit,
    createFinding,
    fetchReadiness,
    createReadinessItem
  };
};
