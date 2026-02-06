'use client';

import { useApi, apiPost, apiPatch, apiDelete } from './useApi';

export interface FrameworkData {
  id: string;
  code: string;
  name: string;
  version?: string;
  authority?: string;
  category?: string;
  description?: string;
  is_active: boolean;
  is_custom: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  framework_requirements?: { count: number }[];
}

export interface RequirementData {
  id: string;
  framework_id: string;
  domain_id?: string;
  code: string;
  name: string;
  description?: string;
  guidance?: string;
  is_mandatory: boolean;
  display_order: number;
  domain?: { id: string; name: string; code: string };
}

export function useFrameworks() {
  const { data, loading, error, refetch } = useApi<FrameworkData[]>('/api/frameworks');

  const createFramework = async (framework: Partial<FrameworkData>) => {
    const result = await apiPost<FrameworkData>('/api/frameworks', framework as Record<string, unknown>);
    if (result.data) await refetch();
    return result;
  };

  const updateFramework = async (id: string, updates: Partial<FrameworkData>) => {
    const result = await apiPatch<FrameworkData>(`/api/frameworks/${id}`, updates as Record<string, unknown>);
    if (result.data) await refetch();
    return result;
  };

  const deleteFramework = async (id: string) => {
    const result = await apiDelete(`/api/frameworks/${id}`);
    if (result.success) await refetch();
    return result;
  };

  return {
    frameworks: data || [],
    loading,
    error,
    refetch,
    createFramework,
    updateFramework,
    deleteFramework,
  };
}

export function useFrameworkRequirements(frameworkId: string | null) {
  const url = frameworkId ? `/api/frameworks/${frameworkId}/requirements` : null;
  const { data, loading, error, refetch } = useApi<RequirementData[]>(url);

  return {
    requirements: data || [],
    loading,
    error,
    refetch,
  };
}
