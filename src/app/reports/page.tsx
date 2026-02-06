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
  Filter,
  Search,
  Clock,
  FileJson,
  FileSpreadsheet,
  Zap,
  MoreVertical,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type ReportType =
  | 'compliance-summary'
  | 'risk-assessment'
  | 'control-effectiveness'
  | 'audit-findings'
  | 'vendor-risk'
  | 'evidence-collection'
  | 'policy-compliance'
  | 'executive-dashboard';

type ReportFormat = 'PDF' | 'CSV' | 'XLSX';
type ScheduleFrequency = 'weekly' | 'monthly' | 'quarterly' | 'none';

interface ReportDefinition {
  id: ReportType;
  title: string;
  description: string;
  icon: React.ReactNode;
  lastGenerated?: Date;
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

// Report Definitions
const REPORT_DEFINITIONS: ReportDefinition[] = [
  {
    id: 'compliance-summary',
    title: 'Compliance Summary Report',
    description: 'Overview of compliance status across all frameworks and regulations',
    icon: <CheckCircle className="w-6 h-6 text-sky-500" />,
  },
  {
    id: 'risk-assessment',
    title: 'Risk Assessment Report',
    description: 'Comprehensive risk analysis and prioritization matrix',
    icon: <AlertTriangle className="w-6 h-6 text-sky-500" />,
  },
  {
    id: 'control-effectiveness',
    title: 'Control Effectiveness Report',
    description: 'Assessment of control performance and maturity levels',
    icon: <CheckCircle className="w-6 h-6 text-sky-500" />,
  },
  {
    id: 'audit-findings',
    title: 'Audit Findings Report',
    description: 'Summary of audit observations and remediation status',
    icon: <FileText className="w-6 h-6 text-sky-500" />,
  },
  {
    id: 'vendor-risk',
    title: 'Vendor Risk Report',
    description: 'Third-party and vendor risk assessment dashboard',
    icon: <Users className="w-6 h-6 text-sky-500" />,
  },
  {
    id: 'evidence-collection',
    title: 'Evidence Collection Report',
    description: 'Compiled evidence and documentation status tracking',
    icon: <FileJson className="w-6 h-6 text-sky-500" />,
  },
  {
    id: 'policy-compliance',
    title: 'Policy Compliance Report',
    description: 'Policy adherence and governance effectiveness metrics',
    icon: <TrendingUp className="w-6 h-6 text-sky-500" />,
  },
  {
    id: 'executive-dashboard',
    title: 'Executive Dashboard Report',
    description: 'High-level executive summary with key metrics and trends',
    icon: <BarChart3 className="w-6 h-6 text-sky-500" />,
  },
];

// Skeleton Component
function ReportCardSkeleton() {
  return (
    <Card className="border-slate-200/60 shadow-sm animate-pulse">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-6 bg-slate-200 rounded-lg w-3/4" />
            <div className="h-4 bg-slate-200 rounded-lg w-full" />
            <div className="h-4 bg-slate-200 rounded-lg w-5/6" />
          </div>
          <div className="h-6 w-6 bg-slate-200 rounded-lg" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 rounded-lg w-1/2" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-slate-200 rounded-lg w-16" />
            ))}
          </div>
          <div className="h-10 bg-slate-200 rounded-lg w-full mt-4" />
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

// Report Card Component
function ReportCard({
  report,
  onGenerate,
  isLoading,
}: {
  report: ReportDefinition;
  onGenerate: (type: ReportType, format: ReportFormat, schedule: ScheduleFrequency) => void;
  isLoading: boolean;
}) {
  const [expandedSchedule, setExpandedSchedule] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('PDF');
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleFrequency>('none');

  const handleGenerate = () => {
    onGenerate(report.id, selectedFormat, selectedSchedule);
    setSelectedFormat('PDF');
    setSelectedSchedule('none');
  };

  return (
    <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {report.icon}
              <CardTitle className="text-slate-900">{report.title}</CardTitle>
            </div>
            <p className="text-sm text-slate-600">{report.description}</p>
          </div>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <MoreVertical className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {report.lastGenerated && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4" />
              <span>Last generated: {report.lastGenerated.toLocaleDateString()}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Export Format
            </label>
            <div className="flex gap-2">
              {(['PDF', 'CSV', 'XLSX'] as ReportFormat[]).map((format) => (
                <button
                  key={format}
                  onClick={() => setSelectedFormat(format)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedFormat === format
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          <div>
            <button
              onClick={() => setExpandedSchedule(!expandedSchedule)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200/60 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">
                  Schedule: {selectedSchedule === 'none' ? 'None' : selectedSchedule}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-600 transition-transform ${
                  expandedSchedule ? 'rotate-180' : ''
                }`}
              />
            </button>

            {expandedSchedule && (
              <div className="mt-2 space-y-2 p-3 bg-slate-50 rounded-lg">
                {(['none', 'weekly', 'monthly', 'quarterly'] as ScheduleFrequency[]).map(
                  (freq) => (
                    <button
                      key={freq}
                      onClick={() => {
                        setSelectedSchedule(freq);
                        setExpandedSchedule(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded text-sm hover:bg-slate-200 transition-colors capitalize"
                    >
                      {freq === 'none' ? 'No Schedule' : freq}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white px-4 py-2.5 rounded-2xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Generate Report
              </>
            )}
          </button>
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

// Main Reports Page
export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [generatingReports, setGeneratingReports] = useState<GeneratingReport[]>([]);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [reports, setReports] = useState<GeneratedReport[]>([]);

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

    return () => clearTimeout(timer);
  }, []);

  // Save reports to localStorage when they change
  useEffect(() => {
    if (reports.length > 0) {
      localStorage.setItem('grc-reports', JSON.stringify(reports));
    }
  }, [reports]);

  const handleGenerateReport = (
    type: ReportType,
    format: ReportFormat,
    schedule: ScheduleFrequency
  ) => {
    setIsLoading(true);
    setGeneratingReports((prev) => [...prev, { type, format, schedule }]);

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
      setGeneratingReports((prev) => prev.filter((r) => r.type !== type));
      setToastMessage(
        `${REPORT_DEFINITIONS.find((r) => r.id === type)?.title} generated successfully!`
      );
      setShowToast(true);
      setIsLoading(false);

      if (schedule !== 'none') {
        setToastMessage(
          `Report scheduled for ${schedule} generation!`
        );
        setShowToast(true);
      }
    }, 2000);
  };

  const totalReportsGenerated = reports.length;
  const scheduledReports = generatingReports.filter((r) => r.schedule !== 'none').length;
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
            Generate comprehensive compliance, risk, and audit reports for your organization
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={BarChart3}
            label="Total Reports Generated"
            value={totalReportsGenerated}
            isLoading={showSkeleton}
          />
          <StatCard
            icon={Calendar}
            label="Scheduled Reports"
            value={scheduledReports}
            isLoading={showSkeleton}
          />
          <StatCard
            icon={TrendingUp}
            label="Reports This Month"
            value={thisMonthReports}
            isLoading={showSkeleton}
          />
        </div>

        {/* Report Types Section */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Available Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {showSkeleton ? (
              Array.from({ length: 8 }).map((_, i) => <ReportCardSkeleton key={i} />)
            ) : (
              REPORT_DEFINITIONS.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onGenerate={handleGenerateReport}
                  isLoading={generatingReports.some((r) => r.type === report.id)}
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
                    <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
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
