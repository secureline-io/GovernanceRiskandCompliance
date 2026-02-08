'use client';

import { useApi, apiPost, apiDelete } from './useApi';

export interface UCFControl {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  guidance?: string;
  typical_evidence_types?: string[];
  sort_order: number;
  mapped_requirements_count?: number;
  frameworks_impacted?: string[];
}

export interface UCFMapping {
  id: string;
  ucf_control_id: string;
  requirement_id: string;
  mapping_strength: 'full' | 'partial' | 'related';
  mapping_notes?: string;
  requirement?: { code: string; title: string; framework: { code: string; name: string } };
}

export interface UCFImplementation {
  id: string;
  org_id: string;
  ucf_control_id: string;
  control_id: string;
  implementation_status: string;
  notes?: string;
  control?: { code: string; name: string; status: string };
}

// Hook: List all UCF controls (optionally filter by category)
export function useUCFControls(category?: string) {
  const url = category ? `/api/ucf?category=${encodeURIComponent(category)}` : '/api/ucf';
  const { data, loading, error, refetch } = useApi<UCFControl[]>(url);

  return { controls: data || [], loading, error, refetch };
}

// Hook: Get single UCF control with cross-framework impact
export function useUCFControl(ucfId: string | null) {
  const { data, loading, error, refetch } = useApi<UCFControl>(ucfId ? `/api/ucf/${ucfId}` : null);

  return { control: data, loading, error, refetch };
}

// Hook: Get UCF control's requirement mappings
export function useUCFMappings(ucfId: string | null) {
  const { data, loading, error, refetch } = useApi<UCFMapping[]>(ucfId ? `/api/ucf/${ucfId}/mappings` : null);

  const addMapping = async (requirementId: string, strength: string, notes?: string) => {
    const result = await apiPost<UCFMapping>(`/api/ucf/${ucfId}/mappings`, {
      requirement_id: requirementId,
      mapping_strength: strength,
      mapping_notes: notes,
    });
    if (result.data) await refetch();
    return result;
  };

  const removeMapping = async (requirementId: string) => {
    const result = await apiDelete(`/api/ucf/${ucfId}/mappings?requirement_id=${requirementId}`);
    if (result.success) await refetch();
    return result;
  };

  return { mappings: data || [], loading, error, refetch, addMapping, removeMapping };
}

// Hook: Get org's implementations of a UCF control
export function useUCFImplementations(ucfId: string | null, orgId: string | null) {
  const { data, loading, error, refetch } = useApi<UCFImplementation[]>(
    ucfId && orgId ? `/api/ucf/${ucfId}/implementations?org_id=${orgId}` : null
  );

  const addImplementation = async (controlId: string, status: string, notes?: string) => {
    const result = await apiPost<UCFImplementation>(`/api/ucf/${ucfId}/implementations`, {
      org_id: orgId,
      control_id: controlId,
      implementation_status: status,
      notes,
    });
    if (result.data) await refetch();
    return result;
  };

  return { implementations: data || [], loading, error, refetch, addImplementation };
}
