'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  Shield,
  Clock,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  ChevronDown,
  Eye,
  Edit2,
  XCircle,
  AlertOctagon,
  Flame,
  Info,
} from 'lucide-react';

// Types
interface TimelineEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  status: 'Open' | 'Investigating' | 'Containment' | 'Remediation' | 'Resolved' | 'Closed';
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  category:
    | 'Data Breach'
    | 'System Outage'
    | 'Access Violation'
    | 'Policy Violation'
    | 'Phishing'
    | 'Malware'
    | 'Physical Security'
    | 'Other';
  assignedTo: string;
  reportedDate: string;
  timeline: TimelineEntry[];
  affectedSystems: string[];
  relatedControls: string[];
}

// Utility functions
const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'Critical':
      return 'bg-red-50 text-red-700 border-red-200/60';
    case 'High':
      return 'bg-orange-50 text-orange-700 border-orange-200/60';
    case 'Medium':
      return 'bg-amber-50 text-amber-700 border-amber-200/60';
    case 'Low':
      return 'bg-sky-50 text-sky-700 border-sky-200/60';
    case 'Info':
      return 'bg-slate-50 text-slate-700 border-slate-200/60';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200/60';
  }
};

const getSeverityBgColor = (severity: string): string => {
  switch (severity) {
    case 'Critical':
      return 'bg-red-600';
    case 'High':
      return 'bg-orange-500';
    case 'Medium':
      return 'bg-amber-500';
    case 'Low':
      return 'bg-sky-500';
    case 'Info':
      return 'bg-slate-400';
    default:
      return 'bg-slate-400';
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Open':
      return 'bg-red-50 text-red-700 border-red-200/60';
    case 'Investigating':
      return 'bg-orange-50 text-orange-700 border-orange-200/60';
    case 'Containment':
      return 'bg-amber-50 text-amber-700 border-amber-200/60';
    case 'Remediation':
      return 'bg-blue-50 text-blue-700 border-blue-200/60';
    case 'Resolved':
      return 'bg-green-50 text-green-700 border-green-200/60';
    case 'Closed':
      return 'bg-slate-50 text-slate-700 border-slate-200/60';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200/60';
  }
};

const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'P1':
      return 'text-red-600 bg-red-50';
    case 'P2':
      return 'text-orange-600 bg-orange-50';
    case 'P3':
      return 'text-amber-600 bg-amber-50';
    case 'P4':
      return 'text-slate-600 bg-slate-50';
    default:
      return 'text-slate-600 bg-slate-50';
  }
};

const calculateSLAStatus = (reportedDate: string, severity: string): { remaining: string; percentage: number; color: string } => {
  const reported = new Date(reportedDate);
  const now = new Date();
  const diffMs = now.getTime() - reported.getTime();

  let slaHours = 72;
  switch (severity) {
    case 'Critical':
      slaHours = 4;
      break;
    case 'High':
      slaHours = 8;
      break;
    case 'Medium':
      slaHours = 24;
      break;
    case 'Low':
      slaHours = 72;
      break;
    default:
      slaHours = 72;
  }

  const slaMs = slaHours * 60 * 60 * 1000;
  const remainingMs = slaMs - diffMs;
  const remainingHours = remainingMs / (60 * 60 * 1000);

  let percentage = (remainingMs / slaMs) * 100;
  if (percentage < 0) percentage = 0;
  if (percentage > 100) percentage = 100;

  let color = 'text-green-600';
  if (remainingHours < 1) color = 'text-red-600';
  else if (remainingHours < slaHours * 0.25) color = 'text-red-600';
  else if (remainingHours < slaHours * 0.5) color = 'text-orange-600';
  else if (remainingHours < slaHours * 0.75) color = 'text-amber-600';

  const hoursStr = Math.max(0, Math.floor(remainingHours))
    .toString()
    .padStart(2, '0');
  const minutesStr = Math.max(0, Math.floor((remainingHours % 1) * 60))
    .toString()
    .padStart(2, '0');

  return {
    remaining: `${hoursStr}:${minutesStr}h`,
    percentage: Math.max(0, percentage),
    color,
  };
};

const mockIncidents: Incident[] = [
  {
    id: 'INC-001',
    title: 'Unauthorized Database Access Detected',
    description:
      'Multiple failed authentication attempts followed by successful access from unknown IP address detected on production database server.',
    severity: 'Critical',
    status: 'Investigating',
    priority: 'P1',
    category: 'Data Breach',
    assignedTo: 'Sarah Chen',
    reportedDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    timeline: [
      {
        id: '1',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        action: 'Incident Reported',
        actor: 'Security Monitor',
        details: 'Unauthorized access detected by monitoring system',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        action: 'Investigation Started',
        actor: 'Sarah Chen',
        details: 'Initial forensic analysis begun',
      },
    ],
    affectedSystems: ['Production DB Server', 'User Authentication Service'],
    relatedControls: ['AC-2', 'AU-12', 'SI-4'],
  },
  {
    id: 'INC-002',
    title: 'Phishing Email Campaign Detected',
    description:
      'Mass phishing emails impersonating company IT department targeting employee email accounts. Campaign appears to target credential harvesting.',
    severity: 'High',
    status: 'Open',
    priority: 'P1',
    category: 'Phishing',
    assignedTo: 'James Mitchell',
    reportedDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    timeline: [
      {
        id: '1',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        action: 'Incident Reported',
        actor: 'Email Gateway',
        details: 'Phishing emails detected and quarantined',
      },
    ],
    affectedSystems: ['Email System', 'User Endpoints'],
    relatedControls: ['AT-4', 'SI-3'],
  },
  {
    id: 'INC-003',
    title: 'System Outage - Web Application',
    description:
      'Main web application service became unresponsive due to database connection pool exhaustion. Users unable to access critical business functionality.',
    severity: 'High',
    status: 'Remediation',
    priority: 'P1',
    category: 'System Outage',
    assignedTo: 'Alex Rodriguez',
    reportedDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    timeline: [
      {
        id: '1',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        action: 'Incident Reported',
        actor: 'Monitoring System',
        details: 'Service health check failed',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString(),
        action: 'Root Cause Identified',
        actor: 'Alex Rodriguez',
        details: 'Database connection pool exhaustion detected',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        action: 'Remediation Started',
        actor: 'Alex Rodriguez',
        details: 'Deploying connection pool fix',
      },
    ],
    affectedSystems: ['Web Application Server', 'Database'],
    relatedControls: ['CP-2', 'CP-13'],
  },
  {
    id: 'INC-004',
    title: 'Policy Violation - Password Management',
    description:
      'Multiple user accounts found with passwords meeting non-compliance criteria. Passwords not updated within required timeframe.',
    severity: 'Medium',
    status: 'Remediation',
    priority: 'P2',
    category: 'Policy Violation',
    assignedTo: 'Maria Santos',
    reportedDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    timeline: [
      {
        id: '1',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        action: 'Audit Detected',
        actor: 'Compliance System',
        details: 'Non-compliant passwords identified',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        action: 'Remediation Plan Created',
        actor: 'Maria Santos',
        details: 'Users notified to update passwords',
      },
    ],
    affectedSystems: ['Identity Management System'],
    relatedControls: ['IA-5'],
  },
  {
    id: 'INC-005',
    title: 'Malware Detected on User Endpoint',
    description:
      'Trojan malware detected on developer workstation. Preliminary analysis suggests data exfiltration may have occurred.',
    severity: 'Critical',
    status: 'Containment',
    priority: 'P1',
    category: 'Malware',
    assignedTo: 'David Park',
    reportedDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    timeline: [
      {
        id: '1',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        action: 'Threat Detected',
        actor: 'Endpoint Protection',
        details: 'Trojan malware signature match',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3.8 * 60 * 60 * 1000).toISOString(),
        action: 'Containment Initiated',
        actor: 'David Park',
        details: 'Endpoint isolated from network',
      },
    ],
    affectedSystems: ['Developer Workstation', 'Network'],
    relatedControls: ['SI-2', 'SI-3', 'SC-7'],
  },
  {
    id: 'INC-006',
    title: 'Access Control Review - Privilege Escalation',
    description:
      'User account granted admin privileges beyond required scope. Detected during quarterly access review process.',
    severity: 'High',
    status: 'Closed',
    priority: 'P2',
    category: 'Access Violation',
    assignedTo: 'Lisa Wang',
    reportedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    timeline: [
      {
        id: '1',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'Violation Identified',
        actor: 'Access Control System',
        details: 'Over-privileged account detected',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'Remediation Completed',
        actor: 'Lisa Wang',
        details: 'Privileges revoked and access restored to baseline',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'Resolved',
        actor: 'Lisa Wang',
        details: 'Incident closed and documented',
      },
    ],
    affectedSystems: ['Identity Management System'],
    relatedControls: ['AC-2', 'AC-6'],
  },
  {
    id: 'INC-007',
    title: 'Physical Security - Server Room Access Log Anomaly',
    description:
      'Unauthorized access attempt to secure server room detected. Access logs show after-hours entry attempt using duplicate card.',
    severity: 'Medium',
    status: 'Investigating',
    priority: 'P2',
    category: 'Physical Security',
    assignedTo: 'Robert Chen',
    reportedDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    timeline: [
      {
        id: '1',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        action: 'Anomaly Detected',
        actor: 'Access Control System',
        details: 'Unusual access pattern detected',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
        action: 'Investigation Initiated',
        actor: 'Robert Chen',
        details: 'Video footage review started',
      },
    ],
    affectedSystems: ['Physical Access Control', 'Security Cameras'],
    relatedControls: ['PE-3', 'PE-6'],
  },
  {
    id: 'INC-008',
    title: 'Data Exfiltration - Suspicious Download Activity',
    description:
      'Unusual volume of data download activity detected from privileged user account during non-business hours. Data destined for external cloud storage.',
    severity: 'Critical',
    status: 'Open',
    priority: 'P1',
    category: 'Data Breach',
    assignedTo: 'Emma Thompson',
    reportedDate: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    timeline: [
      {
        id: '1',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        action: 'Incident Reported',
        actor: 'DLP System',
        details: 'Suspicious data exfiltration pattern detected',
      },
    ],
    affectedSystems: ['Data Lake', 'Network Egress Points'],
    relatedControls: ['DL-1', 'SC-7', 'AC-4'],
  },
  {
    id: 'INC-009',
    title: 'Certificate Expiration Alert',
    description:
      'SSL certificate for main API endpoint expires in 5 days. Certificate renewal not yet processed.',
    severity: 'Low',
    status: 'Remediation',
    priority: 'P3',
    category: 'System Outage',
    assignedTo: 'Kevin Park',
    reportedDate: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    timeline: [
      {
        id: '1',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        action: 'Alert Triggered',
        actor: 'Certificate Monitor',
        details: 'Certificate expiration warning generated',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        action: 'Renewal Initiated',
        actor: 'Kevin Park',
        details: 'Certificate renewal request submitted',
      },
    ],
    affectedSystems: ['API Server'],
    relatedControls: ['SC-12'],
  },
  {
    id: 'INC-010',
    title: 'Resolved - Vendor Security Assessment Finding',
    description:
      'Third-party vendor security assessment revealed findings. All remediation actions completed and verified.',
    severity: 'Info',
    status: 'Resolved',
    priority: 'P3',
    category: 'Policy Violation',
    assignedTo: 'Nicole Brown',
    reportedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    timeline: [
      {
        id: '1',
        timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'Assessment Completed',
        actor: 'Third Party',
        details: 'Security assessment findings documented',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'Remediation Completed',
        actor: 'Nicole Brown',
        details: 'All findings addressed and verified',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'Closed',
        actor: 'Nicole Brown',
        details: 'Incident resolved and documented',
      },
    ],
    affectedSystems: ['Vendor Systems'],
    relatedControls: ['SA-1'],
  },
];

// Skeleton Loading Component
const IncidentTableSkeleton: React.FC = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="h-16 bg-slate-100 rounded-lg animate-pulse"
      />
    ))}
  </div>
);

// Incident Detail Expandable Row
interface IncidentDetailRowProps {
  incident: Incident;
  isExpanded: boolean;
  onToggle: () => void;
}

const IncidentDetailRow: React.FC<IncidentDetailRowProps> = ({
  incident,
  isExpanded,
  onToggle,
}) => {
  return (
    <>
      <tr
        className="border-b border-slate-200/60 hover:bg-slate-50/50 transition-colors cursor-pointer"
        onClick={onToggle}
      >
        <td className="px-6 py-4 text-sm font-mono font-semibold text-slate-900">
          {incident.id}
        </td>
        <td className="px-6 py-4 text-sm font-medium text-slate-900 max-w-xs truncate">
          {incident.title}
        </td>
        <td className="px-6 py-4 text-sm">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(
              incident.severity
            )}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${getSeverityBgColor(
                incident.severity
              )} mr-2`}
            />
            {incident.severity}
          </span>
        </td>
        <td className="px-6 py-4 text-sm">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
              incident.status
            )}`}
          >
            {incident.status}
          </span>
        </td>
        <td className="px-6 py-4 text-sm">
          <span
            className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(
              incident.priority
            )}`}
          >
            {incident.priority}
          </span>
        </td>
        <td className="px-6 py-4 text-sm text-slate-600">{incident.category}</td>
        <td className="px-6 py-4 text-sm text-slate-600">{incident.assignedTo}</td>
        <td className="px-6 py-4 text-sm text-slate-600">
          {new Date(incident.reportedDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </td>
        <td className="px-6 py-4 text-sm text-right">
          {(() => {
            const sla = calculateSLAStatus(incident.reportedDate, incident.severity);
            return (
              <span className={`font-mono font-semibold ${sla.color}`}>
                {sla.remaining}
              </span>
            );
          })()}
        </td>
        <td className="px-6 py-4 text-right">
          <button className="text-slate-400 hover:text-sky-500 transition-colors">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4 rotate-180" />
            )}
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-slate-50/50 border-b border-slate-200/60">
          <td colSpan={10} className="px-6 py-6">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">
                  Description
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {incident.description}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">
                  Affected Systems
                </h4>
                <div className="flex flex-wrap gap-2">
                  {incident.affectedSystems.map((system) => (
                    <span
                      key={system}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200/60"
                    >
                      {system}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">
                  Timeline
                </h4>
                <div className="space-y-3">
                  {incident.timeline.map((entry) => (
                    <div key={entry.id} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-sky-500 mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900">
                          {entry.action}
                        </p>
                        <p className="text-xs text-slate-600">
                          {entry.actor} •{' '}
                          {new Date(entry.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">{entry.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">
                  Related Controls
                </h4>
                <div className="flex flex-wrap gap-2">
                  {incident.relatedControls.map((control) => (
                    <span
                      key={control}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
                    >
                      {control}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// Report Incident Form
interface ReportIncidentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Incident>) => void;
}

const ReportIncidentForm: React.FC<ReportIncidentFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'High' as const,
    category: 'Data Breach' as const,
    priority: 'P2' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      severity: 'High',
      category: 'Data Breach',
      priority: 'P2',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full">
        <div className="px-6 py-4 border-b border-slate-200/60 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            Report New Incident
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Incident Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Brief description of the incident"
              className="w-full px-4 py-2 rounded-lg border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-sky-500/40 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Detailed description of the incident"
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-sky-500/40 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Severity
              </label>
              <select
                value={formData.severity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    severity: e.target.value as any,
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-sky-500/40 text-slate-900"
              >
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
                <option>Info</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as any,
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-sky-500/40 text-slate-900"
              >
                <option>Data Breach</option>
                <option>System Outage</option>
                <option>Access Violation</option>
                <option>Policy Violation</option>
                <option>Phishing</option>
                <option>Malware</option>
                <option>Physical Security</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as any,
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-sky-500/40 text-slate-900"
              >
                <option>P1</option>
                <option>P2</option>
                <option>P3</option>
                <option>P4</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              Report Incident
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Page Component
export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    const savedIncidents = localStorage.getItem('incidents');
    if (savedIncidents) {
      try {
        setIncidents(JSON.parse(savedIncidents));
      } catch {
        setIncidents(mockIncidents);
      }
    } else {
      setIncidents(mockIncidents);
      localStorage.setItem('incidents', JSON.stringify(mockIncidents));
    }
    setLoading(false);
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    if (incidents.length > 0) {
      localStorage.setItem('incidents', JSON.stringify(incidents));
    }
  }, [incidents]);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesSearch =
        incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity =
        severityFilter.length === 0 || severityFilter.includes(incident.severity);
      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(incident.status);

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [incidents, searchQuery, severityFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = incidents.length;
    const open = incidents.filter((i) => i.status === 'Open').length;
    const inProgress = incidents.filter(
      (i) => i.status === 'Investigating' || i.status === 'Containment'
    ).length;
    const resolved = incidents.filter((i) => i.status === 'Resolved').length;
    const critical = incidents.filter(
      (i) =>
        (i.severity === 'Critical' || i.severity === 'High') &&
        i.status !== 'Closed' &&
        i.status !== 'Resolved'
    ).length;

    return { total, open, inProgress, resolved, critical };
  }, [incidents]);

  const handleReportIncident = (data: Partial<Incident>) => {
    const newIncident: Incident = {
      id: `INC-${String(incidents.length + 1).padStart(3, '0')}`,
      title: data.title || '',
      description: data.description || '',
      severity: data.severity || 'Medium',
      status: 'Open',
      priority: data.priority || 'P3',
      category: data.category || 'Other',
      assignedTo: 'Unassigned',
      reportedDate: new Date().toISOString(),
      timeline: [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          action: 'Incident Reported',
          actor: 'Current User',
          details: 'Incident created via reporting form',
        },
      ],
      affectedSystems: [],
      relatedControls: [],
    };

    setIncidents([newIncident, ...incidents]);
  };

  const toggleSeverityFilter = (severity: string) => {
    setSeverityFilter((prev) =>
      prev.includes(severity)
        ? prev.filter((s) => s !== severity)
        : [...prev, severity]
    );
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 animate-fadeIn">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-100 rounded-xl">
                <AlertOctagon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Incidents</h1>
                <p className="text-slate-600 text-sm mt-1">
                  Track and manage security and operational incidents
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Report Incident
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-semibold text-slate-600 uppercase">
                  Total Incidents
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
            </div>

            <div className="bg-red-50 rounded-2xl p-4 border border-slate-200/60">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-xs font-semibold text-red-600 uppercase">
                  Open
                </span>
              </div>
              <p className="text-3xl font-bold text-red-600">{stats.open}</p>
            </div>

            <div className="bg-orange-50 rounded-2xl p-4 border border-slate-200/60">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-semibold text-orange-600 uppercase">
                  In Progress
                </span>
              </div>
              <p className="text-3xl font-bold text-orange-600">
                {stats.inProgress}
              </p>
            </div>

            <div className="bg-green-50 rounded-2xl p-4 border border-slate-200/60">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-xs font-semibold text-green-600 uppercase">
                  Resolved
                </span>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {stats.resolved}
              </p>
            </div>

            <div className="bg-red-50 rounded-2xl p-4 border border-slate-200/60">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-red-600" />
                <span className="text-xs font-semibold text-red-600 uppercase">
                  Critical/High
                </span>
              </div>
              <p className="text-3xl font-bold text-red-600">
                {stats.critical}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 mb-6">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search incidents by ID, title, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-sky-500/40 text-slate-900 placeholder-slate-500"
              />
            </div>
          </div>

          {/* Severity Filters */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-900">
                Severity
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Critical', 'High', 'Medium', 'Low', 'Info'].map((severity) => (
                <button
                  key={severity}
                  onClick={() => toggleSeverityFilter(severity)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    severityFilter.includes(severity)
                      ? `${getSeverityColor(severity)} ring-2 ring-offset-0`
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {severity}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filters */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-900">
                Status
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Open', 'Investigating', 'Containment', 'Remediation', 'Resolved', 'Closed'].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => toggleStatusFilter(status)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      statusFilter.includes(status)
                        ? `${getStatusColor(status)} ring-2 ring-offset-0`
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Incidents Table */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6">
              <IncidentTableSkeleton />
            </div>
          ) : filteredIncidents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200/60">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                      Assigned
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                      Reported
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900 uppercase tracking-wider">
                      SLA
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {filteredIncidents.map((incident) => (
                    <IncidentDetailRow
                      key={incident.id}
                      incident={incident}
                      isExpanded={expandedId === incident.id}
                      onToggle={() =>
                        setExpandedId(
                          expandedId === incident.id ? null : incident.id
                        )
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Info className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-semibold mb-1">
                No incidents found
              </p>
              <p className="text-slate-500 text-sm">
                Adjust your search or filters to find incidents
              </p>
            </div>
          )}
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mt-4 text-sm text-slate-600">
            Showing {filteredIncidents.length} of {incidents.length} incidents
          </div>
        )}
      </div>

      {/* Report Incident Form Modal */}
      <ReportIncidentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleReportIncident}
      />
    </div>
  );
}
