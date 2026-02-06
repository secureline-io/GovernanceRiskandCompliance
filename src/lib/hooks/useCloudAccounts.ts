import { useCallback, useEffect, useState } from 'react';

const DEFAULT_ORG_ID = 'default';

export interface CloudAccount {
  id: string;
  org_id: string;
  provider: 'AWS' | 'Azure' | 'GCP';
  account_id: string;
  account_name?: string;
  regions: string[];
  sync_status: 'pending' | 'syncing' | 'synced' | 'error';
  last_sync_at?: string;
  error_message?: string;
  findings_count?: number;
  cspm_findings?: any[];
  created_at: string;
  updated_at: string;
}

interface UseCloudAccountsReturn {
  accounts: CloudAccount[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createAccount: (data: Partial<CloudAccount>) => Promise<CloudAccount>;
  updateAccount: (id: string, data: Partial<CloudAccount>) => Promise<CloudAccount>;
  deleteAccount: (id: string) => Promise<boolean>;
}

export const useCloudAccounts = (): UseCloudAccountsReturn => {
  const [accounts, setAccounts] = useState<CloudAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/cloud-accounts?org_id=${DEFAULT_ORG_ID}`);
      if (!response.ok) throw new Error('Failed to fetch cloud accounts');
      const { data } = await response.json();
      setAccounts(data || []);
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

  const createAccount = useCallback(async (data: Partial<CloudAccount>) => {
    try {
      const response = await fetch('/api/cloud-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: DEFAULT_ORG_ID, ...data })
      });
      if (!response.ok) throw new Error('Failed to create account');
      const { data: account } = await response.json();
      setAccounts((prev) => [...prev, account]);
      return account;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Unknown error');
    }
  }, []);

  const updateAccount = useCallback(async (id: string, data: Partial<CloudAccount>) => {
    try {
      const response = await fetch(`/api/cloud-accounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update account');
      const { data: account } = await response.json();
      setAccounts((prev) => prev.map((a) => (a.id === id ? account : a)));
      return account;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Unknown error');
    }
  }, []);

  const deleteAccount = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/cloud-accounts/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete account');
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      return true;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Unknown error');
    }
  }, []);

  return {
    accounts,
    loading,
    error,
    refetch,
    createAccount,
    updateAccount,
    deleteAccount
  };
};
