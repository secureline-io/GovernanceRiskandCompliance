'use client';

import { useApi } from './useApi';

export interface DashboardData {
  compliance_percentage: number;
  controls: {
    total: number;
    compliant: number;
    non_compliant: number;
    in_progress: number;
    not_tested: number;
  };
  risks: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  findings: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  evidence: {
    total: number;
    recent: number;
  };
  vendors: {
    total: number;
    unassessed: number;
    high_risk: number;
  };
  tasks: {
    total: number;
    overdue: number;
  };
  recent_activity: any[];
}

export function useDashboard(orgId: string | null) {
  const url = orgId ? `/api/dashboard?org_id=${orgId}` : null;
  const { data, loading, error, refetch } = useApi<DashboardData>(url);

  return {
    dashboard: data,
    loading,
    error,
    refetch,
  };
}
