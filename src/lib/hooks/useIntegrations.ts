import { useCallback, useEffect, useState } from 'react';

const DEFAULT_ORG_ID = 'default';

export interface Integration {
  id: string;
  org_id: string;
  name: string;
  type: string;
  api_key?: string;
  description?: string;
  status: 'pending' | 'active' | 'inactive';
  sync_status: 'pending' | 'syncing' | 'synced' | 'error';
  last_sync_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

interface IntegrationStats {
  active: number;
  error: number;
  total: number;
}

interface UseIntegrationsReturn {
  integrations: Integration[];
  stats: IntegrationStats;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createIntegration: (data: Partial<Integration>) => Promise<Integration>;
  updateIntegration: (id: string, data: Partial<Integration>) => Promise<Integration>;
  deleteIntegration: (id: string) => Promise<boolean>;
}

export const useIntegrations = (): UseIntegrationsReturn => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [stats, setStats] = useState<IntegrationStats>({ active: 0, error: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/integrations?org_id=${DEFAULT_ORG_ID}`);
      if (!response.ok) throw new Error('Failed to fetch integrations');
      const { data, stats: s } = await response.json();
      setIntegrations(data || []);
      setStats(s || { active: 0, error: 0, total: 0 });
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

  const createIntegration = useCallback(async (data: Partial<Integration>) => {
    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: DEFAULT_ORG_ID, ...data })
      });
      if (!response.ok) throw new Error('Failed to create integration');
      const { data: integration } = await response.json();
      setIntegrations((prev) => [...prev, integration]);
      return integration;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Unknown error');
    }
  }, []);

  const updateIntegration = useCallback(async (id: string, data: Partial<Integration>) => {
    try {
      const response = await fetch(`/api/integrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update integration');
      const { data: integration } = await response.json();
      setIntegrations((prev) => prev.map((i) => (i.id === id ? integration : i)));
      return integration;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Unknown error');
    }
  }, []);

  const deleteIntegration = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/integrations/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete integration');
      setIntegrations((prev) => prev.filter((i) => i.id !== id));
      return true;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Unknown error');
    }
  }, []);

  return {
    integrations,
    stats,
    loading,
    error,
    refetch,
    createIntegration,
    updateIntegration,
    deleteIntegration
  };
};
