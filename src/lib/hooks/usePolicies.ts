'use client';

import { useApi, apiPost, apiPatch, apiDelete } from './useApi';

export interface PolicyData {
  id: string;
  org_id: string;
  title: string;
  content_markdown?: string;
  status: string;
  version: number;
  policy_type?: string;
  owner_id?: string;
  published_at?: string;
  review_date?: string;
  created_at: string;
  updated_at: string;
  policy_acknowledgements?: any[];
  acknowledgement_stats?: {
    total: number;
    acknowledged: number;
    pending: number;
    overdue: number;
    completion_rate: number;
  };
}

export function usePolicies(orgId: string | null) {
  const url = orgId ? `/api/policies?org_id=${orgId}` : null;
  const { data, loading, error, refetch } = useApi<PolicyData[]>(url);

  const createPolicy = async (policy: Partial<PolicyData>) => {
    const result = await apiPost<PolicyData>('/api/policies', { ...policy, org_id: orgId });
    if (result.data) await refetch();
    return result;
  };

  const updatePolicy = async (id: string, updates: Partial<PolicyData>) => {
    const result = await apiPatch<PolicyData>(`/api/policies/${id}`, updates);
    if (result.data) await refetch();
    return result;
  };

  const deletePolicy = async (id: string) => {
    const result = await apiDelete(`/api/policies/${id}`);
    if (result.success) await refetch();
    return result;
  };

  const publishPolicy = async (id: string, userIds?: string[], dueDate?: string) => {
    const result = await apiPost(`/api/policies/${id}/publish`, {
      user_ids: userIds,
      due_date: dueDate,
    });
    if (result.data) await refetch();
    return result;
  };

  return {
    policies: data || [],
    loading,
    error,
    refetch,
    createPolicy,
    updatePolicy,
    deletePolicy,
    publishPolicy,
  };
}
