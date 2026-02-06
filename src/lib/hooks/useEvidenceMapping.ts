import { useCallback, useState } from 'react';

const DEFAULT_ORG_ID = 'default';

export interface EvidenceReuseItem {
  evidence_id: string;
  title: string;
  linked_controls: number;
  linked_frameworks: string[];
}

export interface ControlCoverage {
  control_id: string;
  code: string;
  name: string;
  has_evidence: boolean;
  evidence_source: 'manual' | 'automated' | 'none';
}

export interface FrameworkCoverage {
  framework_id: string;
  name: string;
  total_requirements: number;
  covered: number;
  coverage_pct: number;
}

export interface EvidenceMappingData {
  evidence_reuse: EvidenceReuseItem[];
  ungapped_controls: ControlCoverage[];
  framework_coverage: FrameworkCoverage[];
}

interface UseEvidenceMappingReturn {
  data: EvidenceMappingData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useEvidenceMapping = (): UseEvidenceMappingReturn => {
  const [data, setData] = useState<EvidenceMappingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/evidence/mapping?org_id=${DEFAULT_ORG_ID}`);
      if (!response.ok) throw new Error('Failed to fetch evidence mapping');
      const { data: result } = await response.json();
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    refetch
  };
};
