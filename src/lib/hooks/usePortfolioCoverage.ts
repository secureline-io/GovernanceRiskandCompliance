'use client';

import { useApi } from './useApi';

export interface PortfolioCoverage {
  framework_id: string;
  framework_code: string;
  framework_name: string;
  total_requirements: number;
  covered_requirements: number;
  coverage_pct: number;
}

export interface PortfolioData {
  coverage: PortfolioCoverage[];
  overlapping_controls: any[];
  gaps: any[];
}

export function usePortfolioCoverage(orgId: string | null, frameworkIds: string[]) {
  const idsParam = frameworkIds.join(',');
  const url = orgId && frameworkIds.length > 0
    ? `/api/compliance/portfolio?org_id=${orgId}&framework_ids=${idsParam}`
    : null;
  const { data, loading, error, refetch } = useApi<PortfolioData>(url);

  return { portfolio: data, loading, error, refetch };
}
