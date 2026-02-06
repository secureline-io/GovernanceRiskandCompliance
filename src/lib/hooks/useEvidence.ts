'use client';

import { useApi, apiPost } from './useApi';

export interface EvidenceData {
  id: string;
  org_id: string;
  title: string;
  description?: string;
  source: string;
  hash?: string;
  payload?: any;
  file_path?: string;
  file_type?: string;
  file_size_bytes?: number;
  integration_id?: string;
  collector_user_id?: string;
  audit_notes?: string;
  collected_at: string;
  created_at: string;
  evidence_control_links?: any[];
}

export function useEvidence(orgId: string | null) {
  const url = orgId ? `/api/evidence?org_id=${orgId}` : null;
  const { data, loading, error, refetch } = useApi<EvidenceData[]>(url);

  const createEvidence = async (evidence: Partial<EvidenceData>) => {
    const result = await apiPost<EvidenceData>('/api/evidence', { ...evidence, org_id: orgId });
    if (result.data) await refetch();
    return result;
  };

  return {
    evidence: data || [],
    loading,
    error,
    refetch,
    createEvidence,
  };
}
