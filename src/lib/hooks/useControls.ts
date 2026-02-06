'use client';

import { useApi, apiPost, apiPatch, apiDelete } from './useApi';

export interface ControlData {
  id: string;
  org_id: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  control_type?: string;
  control_nature?: string;
  frequency?: string;
  status: string;
  effectiveness_score?: number;
  owner_id?: string;
  implementation_details?: string;
  created_at: string;
  updated_at: string;
}

export function useControls(orgId: string | null) {
  const url = orgId ? `/api/controls?org_id=${orgId}` : null;
  const { data, loading, error, refetch } = useApi<ControlData[]>(url);

  const createControl = async (control: Partial<ControlData>) => {
    const result = await apiPost<ControlData>('/api/controls', { ...control, org_id: orgId });
    if (result.data) await refetch();
    return result;
  };

  const updateControl = async (id: string, updates: Partial<ControlData>) => {
    const result = await apiPatch<ControlData>(`/api/controls/${id}`, updates);
    if (result.data) await refetch();
    return result;
  };

  const deleteControl = async (id: string) => {
    const result = await apiDelete(`/api/controls/${id}`);
    if (result.success) await refetch();
    return result;
  };

  return {
    controls: data || [],
    loading,
    error,
    refetch,
    createControl,
    updateControl,
    deleteControl,
  };
}
