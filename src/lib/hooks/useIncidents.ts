import { useCallback, useEffect, useState } from 'react';

const DEFAULT_ORG_ID = 'default';

export interface Incident {
  id: string;
  org_id: string;
  title: string;
  description?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'detected' | 'triaged' | 'contained' | 'eradicated' | 'recovered' | 'closed' | 'post_mortem';
  incident_type?: 'security_breach' | 'data_leak' | 'system_outage' | 'compliance_violation' | 'vendor_incident' | 'phishing' | 'malware' | 'unauthorized_access' | 'other';
  detected_at: string;
  resolved_at?: string;
  commander?: string;
  affected_systems: string[];
  linked_risk_ids: string[];
  linked_control_ids: string[];
  linked_policy_ids: string[];
  root_cause?: string;
  impact_assessment?: string;
  lessons_learned?: string;
  incident_timeline?: IncidentTimelineEvent[];
  created_at: string;
  updated_at: string;
}

export interface IncidentTimelineEvent {
  id: string;
  incident_id: string;
  event_type: 'status_change' | 'note' | 'action' | 'escalation' | 'communication';
  description: string;
  author?: string;
  created_at: string;
}

interface UseIncidentsReturn {
  incidents: Incident[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createIncident: (data: Partial<Incident>) => Promise<Incident>;
  updateIncident: (id: string, data: Partial<Incident>) => Promise<Incident>;
  deleteIncident: (id: string) => Promise<boolean>;
  addTimelineEvent: (incidentId: string, data: Partial<IncidentTimelineEvent>) => Promise<IncidentTimelineEvent>;
}

export const useIncidents = (): UseIncidentsReturn => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/incidents?org_id=${DEFAULT_ORG_ID}`);
      if (!response.ok) throw new Error('Failed to fetch incidents');
      const { data } = await response.json();
      setIncidents(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createIncident = useCallback(async (data: Partial<Incident>) => {
    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: DEFAULT_ORG_ID, ...data })
      });
      if (!response.ok) throw new Error('Failed to create incident');
      const { data: incident } = await response.json();
      setIncidents((prev) => [...prev, incident]);
      return incident;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Unknown error');
    }
  }, []);

  const updateIncident = useCallback(async (id: string, data: Partial<Incident>) => {
    try {
      const response = await fetch(`/api/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update incident');
      const { data: incident } = await response.json();
      setIncidents((prev) => prev.map((i) => (i.id === id ? incident : i)));
      return incident;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Unknown error');
    }
  }, []);

  const deleteIncident = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/incidents/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete incident');
      setIncidents((prev) => prev.filter((i) => i.id !== id));
      return true;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Unknown error');
    }
  }, []);

  const addTimelineEvent = useCallback(async (incidentId: string, data: Partial<IncidentTimelineEvent>) => {
    try {
      const response = await fetch(`/api/incidents/${incidentId}/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to add timeline event');
      const { data: event } = await response.json();
      return event;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Unknown error');
    }
  }, []);

  return {
    incidents,
    loading,
    error,
    refetch,
    createIncident,
    updateIncident,
    deleteIncident,
    addTimelineEvent
  };
};
