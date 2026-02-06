import { useCallback, useEffect, useState } from 'react';

const DEFAULT_ORG_ID = 'default';

export interface Asset {
  id: string;
  org_id: string;
  name: string;
  type: 'Server' | 'Database' | 'Application' | 'Network' | 'Endpoint' | 'Cloud Resource';
  criticality: 'critical' | 'high' | 'medium' | 'low';
  owner?: string;
  description?: string;
  cloud_account_id?: string;
  created_at: string;
  updated_at: string;
}

interface UseAssetsReturn {
  assets: Asset[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createAsset: (data: Partial<Asset>) => Promise<Asset>;
  updateAsset: (id: string, data: Partial<Asset>) => Promise<Asset>;
  deleteAsset: (id: string) => Promise<boolean>;
}

export const useAssets = (): UseAssetsReturn => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/assets?org_id=${DEFAULT_ORG_ID}`);
      if (!response.ok) throw new Error('Failed to fetch assets');
      const { data } = await response.json();
      setAssets(data || []);
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

  const createAsset = useCallback(async (data: Partial<Asset>) => {
    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: DEFAULT_ORG_ID, ...data })
      });
      if (!response.ok) throw new Error('Failed to create asset');
      const { data: asset } = await response.json();
      setAssets((prev) => [...prev, asset]);
      return asset;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Unknown error');
    }
  }, []);

  const updateAsset = useCallback(async (id: string, data: Partial<Asset>) => {
    try {
      const response = await fetch(`/api/assets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update asset');
      const { data: asset } = await response.json();
      setAssets((prev) => prev.map((a) => (a.id === id ? asset : a)));
      return asset;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Unknown error');
    }
  }, []);

  const deleteAsset = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/assets/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete asset');
      setAssets((prev) => prev.filter((a) => a.id !== id));
      return true;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Unknown error');
    }
  }, []);

  return {
    assets,
    loading,
    error,
    refetch,
    createAsset,
    updateAsset,
    deleteAsset
  };
};
