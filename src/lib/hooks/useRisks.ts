'use client';

import { useApi, apiPost, apiPatch, apiDelete } from './useApi';

export interface RiskData {
  id: string;
  org_id: string;
  title: string;
  description?: string;
  category?: string;
  risk_source?: string;
  inherent_likelihood: number;
  inherent_impact: number;
  inherent_risk_score: number;
  residual_likelihood?: number;
  residual_impact?: number;
  residual_risk_score?: number;
  risk_response?: string;
  status: string;
  owner_id?: string;
  review_date?: string;
  last_reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export function useRisks(orgId: string | null) {
  const url = orgId ? `/api/risks?org_id=${orgId}` : null;
  const { data, loading, error, refetch } = useApi<RiskData[]>(url);

  const createRisk = async (risk: Partial<RiskData>) => {
    const result = await apiPost<RiskData>('/api/risks', { ...risk, org_id: orgId });
    if (result.data) await refetch();
    return result;
  };

  const updateRisk = async (id: string, updates: Partial<RiskData>) => {
    const result = await apiPatch<RiskData>(`/api/risks/${id}`, updates);
    if (result.data) await refetch();
    return result;
  };

  const deleteRisk = async (id: string) => {
    const result = await apiDelete(`/api/risks/${id}`);
    if (result.success) await refetch();
    return result;
  };

  return {
    risks: data || [],
    loading,
    error,
    refetch,
    createRisk,
    updateRisk,
    deleteRisk,
  };
}
