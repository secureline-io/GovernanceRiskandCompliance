'use client';

import { useAuth } from '@/lib/auth/AuthContext';

/**
 * Hook to get the current organization ID.
 * Returns the org ID from auth context, falling back to 'default'
 * for backwards compatibility during the transition to full multi-tenant auth.
 */
export function useOrgId(): string {
  const { currentOrg } = useAuth();
  return currentOrg?.org_id || 'default';
}
