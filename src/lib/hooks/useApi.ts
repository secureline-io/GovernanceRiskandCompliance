'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseApiOptions {
  immediate?: boolean;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useApi<T>(url: string | null, options: UseApiOptions = { immediate: true }): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Request failed');
      setData(json.data ?? json);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (options.immediate && url) {
      fetchData();
    }
  }, [fetchData, options.immediate, url]);

  return { data, loading, error, refetch: fetchData };
}

export async function apiPost<T>(url: string, body: Record<string, unknown>): Promise<{ data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.error || 'Request failed' };
    return { data: json.data ?? json };
  } catch (err: any) {
    return { error: err.message || 'Unknown error' };
  }
}

export async function apiPatch<T>(url: string, body: Record<string, unknown>): Promise<{ data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.error || 'Request failed' };
    return { data: json.data ?? json };
  } catch (err: any) {
    return { error: err.message || 'Unknown error' };
  }
}

export async function apiDelete(url: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const res = await fetch(url, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) return { error: json.error || 'Request failed' };
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Unknown error' };
  }
}
