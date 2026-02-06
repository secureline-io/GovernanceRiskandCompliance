'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Download,
  FileText,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Users,
  Calendar,
  Search,
  Clock,
  Shield,
  Zap,
  ChevronDown,
  RefreshCw,
  Code,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type ReportType =
  | 'compliance-summary'
  | 'framework-compliance'
  | 'cloud-security'
  | 'vendor-risk'
  | 'audit-readiness'
  | 'risk-report'
  | 'application-security';

type ReportFormat = 'PDF' | 'CSV' | 'XLSX';
type ScheduleFrequency = 'weekly' | 'monthly' | 'quarterly' | 'none';

interface ReportDefinition {
  id: ReportType;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradientClass: string;
}

interface GeneratedReport {
  id: string;
  name: string;
  type: ReportType;
  generatedDate: Date;
  generatedBy: string;
  format: ReportFormat;
  fileSize: string;
}

interface GeneratingReport {
  type: ReportType;
  format: ReportFormat;
  schedule: ScheduleFrequency;
}

// Report Definitions - 7 Scrut-style reports
const REPORT_DEFINITIONS: ReportDefinition[] = [
  {
    id: 'compliance-summary',
    title: 'Compliance Summary',
    description: 'Overview of compliance status across all frameworks',
    icon: <CheckCircle className="w-8 h-8 text-white" />,
    gradientClass: 'from-sky-400 to-blue-600',
  },
  {
    id: 'framework-compliance',
    title: 'Framework Compliance',
    description: 'Detailed compliance status per framework',
    icon: <Shield className="w-8 h-8 text-white" />,
    gradientClass: 'from-emerald-400 to-teal-600',
  },
  {
    id: 'cloud-security',
    title: 'Cloud Security',
    description: 'Cloud security posture and vulnerability findings',
    icon: <Cloud className="w-8 h-8 text-white" />,
    gradientClass: 'from-violet-400 to-purple-600',
  },
  {
    id: 'vendor-risk',
    title: 'Vendor Risk Assessment',
    description: 'Third-party vendor risk evaluation report',
    icon: <Users className="w-8 h-8 text-white" />,
    gradientClass: 'from-amber-400 to-orange-600',
  },
  {
    id: 'audit-readiness',
    title: 'Audit Readiness',
    description: 'Audit preparation status and evidence completeness',
    icon: <CheckCircle className="w-8 h-8 text-white" />,
    gradientClass: 'from-rose-400 to-pink-600',
  },
  {
    id: 'risk-report',
    title: 'Risk Report',
    description: 'Comprehensive risk analysis with heat map',
    icon: <AlertTriangle className="w-8 h-8 text-white" />,
    gradientClass: 'from-red-500 to-orange-600',
  },
  {
    id: 'application-security',
    title: 'Application Security Assessment',
    description: 'AppSec scan results and remediation status',
    icon: <Code className="w-8 h-8 text-white" />,
    gradientClass: 'from-cyan-400 to-sky-600',
  },
];

// Cloud icon component (not available in lucide directly, using custom SVG-like implementation)
function Cloud({ className }: { className: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M19.5 7c1.91 1.64 3.13 4.02 3.13 6.7 0 5.03-4.1 9.1-9.15 9.1H6.5C3.01 22.8 0 19.77 0 16.3c0-3.07 2.45-5.6 5.5-5.94.64-2.37 2.8-4.11 5.35-4.11 1.98 0 3.77.85 5.02 2.21.52-.37 1.15-.58 1.83-.58z" />
    </svg>
  );
}

// Skeleton Component
function ReportCardSkeleton() {
  return (
    <Card className="border-slate-200/60 shadow-sm hover:shadow-lg transition-shadow overflow-hidden animate-pulse">
      <div className="h-32 bg-slate-200" />
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="h-6 bg-slate-200 rounded-lg w-3/4" />
          <div className="h-4 bg-slate-200 rounded-lg w-full" />
          <div className="flex gap-2 pt-4">
            <div className="h-9 bg-slate-200 rounded-lg flex-1" />
            <div className="h-9 bg-slate-200 rounded-lg flex-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Toast Notification Component
function Toast({
  message,
  visible,
  onClose,
}: {
  message: string;
  visible: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2 animate-fadeIn z-50">
      <CheckCircle className="w-5 h-5" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

// Export Dropdown Component
function ExportDropdown({
  onExport,
  isLoading,
}: {
  onExport: (format: ReportFormat) => void;
  isLoading: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white rounded-lg font-medium transition-colors text-sm"
      >
        <Download className="w-4 h-4" />
        Export
        <ChevronDown className="w-4 h-4" />
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-32 bg-white border border-slate-200/60 rounded-lg shadow-lg z-10">
          {(['PDF', 'CSV', 'XLSX'] as ReportFormat[]).map((format) => (
            <button
              key={format}
              onClick={() => {
                onExport(format);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm text-slate-700 first:rounded-t-lg last:rounded-b-lg transition-colors"
            >
              {format}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Report Card Component
function ReportCard({
  report,
  onGenerate,
  onSchedule,
  isLoading,
}: {
  report: ReportDefinition;
  onGenerate: (type: ReportType, format: ReportFormat) => void;
  onSchedule: (type: ReportType) => void;
  isLoading: boolean;
}) {
  const handleExport = (format: ReportFormat) => {
    onGenerate(report.id, format);
  };

  return (
    <Card className="border-slate-200/60 shadow-sm hover:shadow-lg transition-all overflow-hidden">
      {/* Gradient Preview Area */}
      <div className={`h-32 bg-gradient-to-br ${report.gradientClass} flex items-center justify-center`}>
        {report.icon}
      </div>

      {/* Content Area */}
      <CardContent className="pt-4">
        <div className="space-y-3">
          {/* Title and Description */}
          <div>
            <h3 className="font-bold text-slate-900 text-base">{report.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{report.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <ExportDropdown onExport={handleExport} isLoading={isLoading} />
            <button
              onClick={() => onSchedule(report.id)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors text-sm"
            >
              <Calendar className="w-4 h-4" />
              Schedule
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Stats Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  isLoading,
}: {
  icon: React.ComponentType<{ className: string }>;
  label: string;
  value: string | number;
  isLoading?: boolean;
}) {
  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {isLoading ? '—' : value}
          </p>
        </div>
        <div className="p-3 bg-sky-50 rounded-xl">
          <Icon className="w-6 h-6 text-sky-500" />
        </div>
      </div>
    </div>
  );
}

// Report History Table Component
function ReportHistoryTable({ reports }: { reports: GeneratedReport[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ReportType | 'all'>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'all'>('all');

  const filteredReports = useMemo(() => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter((r) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((r) => r.type === typeFilter);
    }

    if (dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      cutoffDate.setDate(now.getDate() - (dateRange === 'week' ? 7 : 30));
      filtered = filtered.filter((r) => r.generatedDate >= cutoffDate);
    }

    return filtered.sort((a, b) => b.generatedDate.getTime() - a.generatedDate.getTime());
  }, [reports, searchTerm, typeFilter, dateRange]);

  const uniqueTypes = Array.from(new Set(reports.map((r) => r.type)));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200/60 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ReportType | 'all')}
            className="px-4 py-2 border border-slate-200/60 rounded-2xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="all">All Types</option>
            {uniqueTypes.map((type) => {
              const definition = REPORT_DEFINITIONS.find((r) => r.id === type);
              return (
                <option key={type} value={type}>
                  {definition?.title}
                </option>
              );
            })}
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as 'week' | 'month' | 'all')}
            className="px-4 py-2 border border-slate-200/60 rounded-2xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/60">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                  Report Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                  Generated Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                  Generated By
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                  Format
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                  File Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-600">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm">No reports found</p>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-slate-200/60 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {report.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {REPORT_DEFINITIONS.find((r) => r.id === report.type)?.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {report.generatedDate.toLocaleDateString()}{' '}
                      {report.generatedDate.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{report.generatedBy}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 font-medium text-xs">
                        {report.format}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{report.fileSize}</td>
                    <td className="px-6 py-4 text-sm">
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors text-sky-600 hover:text-sky-700">
                        <Download className="w-4 h-4" />
                        <span className="text-xs font-medium">Download</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredReports.length > 0 && (
        <div className="text-sm text-slate-600">
          Showing {filteredReports.length} of {reports.length} reports
        </div>
      )}
    </div>
  );
}

// Schedule Modal Component
function ScheduleModal({
  isOpen,
  reportTitle,
  onClose,
  onSchedule,
}: {
  isOpen: boolean;
  reportTitle: string;
  onClose: () => void;
  onSchedule: (frequency: ScheduleFrequency) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-96 shadow-xl">
        <CardHeader>
          <CardTitle>Schedule Report</CardTitle>
          <p className="text-sm text-slate-600 mt-2">{reportTitle}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {(['weekly', 'monthly', 'quarterly'] as ScheduleFrequency[]).map((freq) => (
              <button
                key={freq}
                onClick={() => {
                  onSchedule(freq);
                  onClose();
                }}
                className="w-full text-left px-4 py-3 border border-slate-200/60 hover:bg-slate-50 rounded-lg transition-colors capitalize font-medium text-slate-700"
              >
                {freq}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-slate-200/60 hover:bg-slate-50 rounded-lg text-slate-700 font-medium transition-colors"
          >
            Cancel
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Reports Page
export default function ReportsPage() {
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [generatingTypes, setGeneratingTypes] = useState<Set<ReportType>>(new Set());
  const [scheduleModal, setScheduleModal] = useState<{
    isOpen: boolean;
    reportType: ReportType | null;
    reportTitle: string;
  }>({
    isOpen: false,
    reportType: null,
    reportTitle: '',
  });
  const [scheduledReports, setScheduledReports] = useState<Set<ReportType>>(new Set());

  // Load data from localStorage on mount
  useEffect(() => {
    const timer = setTimeout(() => setShowSkeleton(false), 300);

    const savedReports = localStorage.getItem('grc-reports');
    if (savedReports) {
      try {
        const parsed = JSON.parse(savedReports);
        const reportsWithDates = parsed.map((r: any) => ({
          ...r,
          generatedDate: new Date(r.generatedDate),
        }));
        setReports(reportsWithDates);
      } catch (error) {
        console.error('Failed to load reports from localStorage', error);
      }
    }

    const savedSchedules = localStorage.getItem('grc-scheduled-reports');
    if (savedSchedules) {
      try {
        setScheduledReports(new Set(JSON.parse(savedSchedules)));
      } catch (error) {
        console.error('Failed to load scheduled reports', error);
      }
    }

    return () => clearTimeout(timer);
  }, []);

  // Save reports to localStorage when they change
  useEffect(() => {
    if (reports.length > 0) {
      localStorage.setItem('grc-reports', JSON.stringify(reports));
    }
  }, [reports]);

  // Save scheduled reports to localStorage
  useEffect(() => {
    localStorage.setItem('grc-scheduled-reports', JSON.stringify(Array.from(scheduledReports)));
  }, [scheduledReports]);

  const handleGenerateReport = (type: ReportType, format: ReportFormat) => {
    setGeneratingTypes((prev) => new Set(prev).add(type));

    // Simulate report generation
    setTimeout(() => {
      const newReport: GeneratedReport = {
        id: `report-${Date.now()}`,
        name: `${REPORT_DEFINITIONS.find((r) => r.id === type)?.title} - ${new Date().toLocaleDateString()}`,
        type,
        generatedDate: new Date(),
        generatedBy: 'Current User',
        format,
        fileSize: `${Math.floor(Math.random() * 5000) + 500}KB`,
      };

      setReports((prev) => [newReport, ...prev]);
      setGeneratingTypes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(type);
        return newSet;
      });

      setToastMessage(
        `${REPORT_DEFINITIONS.find((r) => r.id === type)?.title} generated successfully!`
      );
      setShowToast(true);
    }, 2000);
  };

  const handleScheduleReport = (type: ReportType) => {
    const report = REPORT_DEFINITIONS.find((r) => r.id === type);
    setScheduleModal({
      isOpen: true,
      reportType: type,
      reportTitle: report?.title || '',
    });
  };

  const handleConfirmSchedule = (frequency: ScheduleFrequency) => {
    if (scheduleModal.reportType) {
      setScheduledReports((prev) => new Set(prev).add(scheduleModal.reportType!));
      setToastMessage(`Report scheduled for ${frequency} generation!`);
      setShowToast(true);
    }
  };

  const totalReportsGenerated = reports.length;
  const scheduledCount = scheduledReports.size;
  const thisMonthReports = reports.filter((r) => {
    const now = new Date();
    return (
      r.generatedDate.getMonth() === now.getMonth() &&
      r.generatedDate.getFullYear() === now.getFullYear()
    );
  }).length;

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 space-y-8 animate-fadeIn">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-600 text-sm mt-2">
            Generate compliance, risk, and security reports for your organization
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={BarChart3}
            label="Total Generated"
            value={totalReportsGenerated}
            isLoading={showSkeleton}
          />
          <StatCard
            icon={Calendar}
            label="Scheduled"
            value={scheduledCount}
            isLoading={showSkeleton}
          />
          <StatCard
            icon={TrendingUp}
            label="This Month"
            value={thisMonthReports}
            isLoading={showSkeleton}
          />
        </div>

        {/* Report Templates Section */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Report Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {showSkeleton ? (
              Array.from({ length: 7 }).map((_, i) => <ReportCardSkeleton key={i} />)
            ) : (
              REPORT_DEFINITIONS.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onGenerate={handleGenerateReport}
                  onSchedule={handleScheduleReport}
                  isLoading={generatingTypes.has(report.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Report History Section */}
        {!showSkeleton && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Report History</h2>
            {reports.length > 0 ? (
              <ReportHistoryTable reports={reports} />
            ) : (
              <Card className="border-slate-200/60 shadow-sm">
                <CardContent className="pt-12">
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Reports Yet</h3>
                    <p className="text-slate-600 max-w-md mx-auto">
                      Generate your first report to see it appear in the history
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Schedule Modal */}
        <ScheduleModal
          isOpen={scheduleModal.isOpen}
          reportTitle={scheduleModal.reportTitle}
          onClose={() =>
            setScheduleModal({ isOpen: false, reportType: null, reportTitle: '' })
          }
          onSchedule={handleConfirmSchedule}
        />

        {/* Toast Notification */}
        <Toast
          message={toastMessage}
          visible={showToast}
          onClose={() => setShowToast(false)}
        />
      </div>
    </div>
  );
}
