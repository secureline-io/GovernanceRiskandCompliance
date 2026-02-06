'use client';

import { useApi, apiPost, apiPatch, apiDelete } from './useApi';

export interface VendorData {
  id: string;
  org_id: string;
  name: string;
  industry?: string;
  contact_email?: string;
  contact_name?: string;
  website?: string;
  description?: string;
  risk_level: string;
  status: string;
  criticality?: string;
  data_shared?: string[];
  contract_end_date?: string;
  last_assessed_at?: string;
  next_assessment_date?: string;
  created_at: string;
  updated_at: string;
  vendor_assessments?: any[];
}

export function useVendors(orgId: string | null) {
  const url = orgId ? `/api/vendors?org_id=${orgId}` : null;
  const { data, loading, error, refetch } = useApi<VendorData[]>(url);

  const createVendor = async (vendor: Partial<VendorData>) => {
    const result = await apiPost<VendorData>('/api/vendors', { ...vendor, org_id: orgId });
    if (result.data) await refetch();
    return result;
  };

  const updateVendor = async (id: string, updates: Partial<VendorData>) => {
    const result = await apiPatch<VendorData>(`/api/vendors/${id}`, updates);
    if (result.data) await refetch();
    return result;
  };

  const deleteVendor = async (id: string) => {
    const result = await apiDelete(`/api/vendors/${id}`);
    if (result.success) await refetch();
    return result;
  };

  return {
    vendors: data || [],
    loading,
    error,
    refetch,
    createVendor,
    updateVendor,
    deleteVendor,
  };
}
