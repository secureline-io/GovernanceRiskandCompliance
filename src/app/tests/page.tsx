'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Calendar,
  PlayCircle,
  AlertTriangle,
  Search,
  Plus,
  ChevronDown,
  List,
  Grid3x3,
  Zap,
  Lock,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TestResult {
  id: string;
  controlRef: string;
  testName: string;
  type: 'Automated' | 'Manual' | 'Hybrid';
  status: 'Scheduled' | 'In Progress' | 'Passed' | 'Failed' | 'Overdue';
  lastRun: string;
  nextDue: string;
  tester: string;
  evidence?: string;
  findings?: string;
  notes?: string;
}

const MOCK_TESTS: TestResult[] = [
  {
    id: 'TST-001',
    controlRef: 'AC-2.1',
    testName: 'User Access Review',
    type: 'Manual',
    status: 'Passed',
    lastRun: '2024-01-15',
    nextDue: '2024-04-15',
    tester: 'Sarah Chen',
    evidence: 'Access control spreadsheet reviewed, 156 active accounts',
    findings: 'All users properly segregated by role',
    notes: 'Quarterly review completed with no issues',
  },
  {
    id: 'TST-002',
    controlRef: 'AU-12.1',
    testName: 'Audit Log Review',
    type: 'Automated',
    status: 'Passed',
    lastRun: '2024-01-20',
    nextDue: '2024-02-20',
    tester: 'System',
    evidence: '10,234 log entries analyzed',
    findings: 'All critical events properly logged',
    notes: 'Automated daily review in progress',
  },
  {
    id: 'TST-003',
    controlRef: 'SC-7.1',
    testName: 'Network Boundary Assessment',
    type: 'Hybrid',
    status: 'Failed',
    lastRun: '2024-01-18',
    nextDue: '2024-02-08',
    tester: 'Mike Rodriguez',
    evidence: 'Network scan report, 2 open ports detected',
    findings: 'Unexpected open ports on production gateway',
    notes: 'Remediation in progress, vendor contacted',
  },
  {
    id: 'TST-004',
    controlRef: 'CP-9.1',
    testName: 'Backup Restoration Test',
    type: 'Manual',
    status: 'In Progress',
    lastRun: '2024-01-10',
    nextDue: '2024-02-15',
    tester: 'Emma Wilson',
    evidence: 'Test environment backup initiated',
    findings: 'Pending completion',
    notes: 'Restoration verification in progress',
  },
  {
    id: 'TST-005',
    controlRef: 'IA-6.1',
    testName: 'MFA Enforcement Verification',
    type: 'Automated',
    status: 'Overdue',
    lastRun: '2023-12-01',
    nextDue: '2024-01-15',
    tester: 'System',
    evidence: 'Directory scan pending',
    findings: 'Test not yet executed',
    notes: 'Requires scheduling and manual verification',
  },
  {
    id: 'TST-006',
    controlRef: 'SI-4.1',
    testName: 'Intrusion Detection System Monitoring',
    type: 'Automated',
    status: 'Scheduled',
    lastRun: '2024-01-15',
    nextDue: '2024-02-15',
    tester: 'System',
    evidence: 'Scheduled for execution',
    findings: 'Pending test run',
    notes: 'Automated daily monitoring active',
  },
  {
    id: 'TST-007',
    controlRef: 'IR-4.1',
    testName: 'Incident Response Procedure Review',
    type: 'Manual',
    status: 'Passed',
    lastRun: '2024-01-08',
    nextDue: '2024-04-08',
    tester: 'James Park',
    evidence: 'IR procedures document reviewed',
    findings: 'Procedures current and documented',
    notes: 'Annual review completed with updates',
  },
  {
    id: 'TST-008',
    controlRef: 'AT-3.1',
    testName: 'Security Awareness Training Compliance',
    type: 'Manual',
    status: 'Passed',
    lastRun: '2024-01-20',
    nextDue: '2024-07-20',
    tester: 'Lisa Anderson',
    evidence: 'Training records for 487 employees',
    findings: '98% completion rate achieved',
    notes: 'Annual training campaign completed',
  },
  {
    id: 'TST-009',
    controlRef: 'SC-13.1',
    testName: 'Cryptographic Key Management Review',
    type: 'Hybrid',
    status: 'In Progress',
    lastRun: '2024-01-17',
    nextDue: '2024-02-17',
    tester: 'David Chen',
    evidence: 'Key inventory assessment ongoing',
    findings: 'Initial review 75% complete',
    notes: 'HSM audit scheduled for next week',
  },
  {
    id: 'TST-010',
    controlRef: 'PS-6.1',
    testName: 'Vendor Security Assessment',
    type: 'Manual',
    status: 'Scheduled',
    lastRun: '2023-10-15',
    nextDue: '2024-02-28',
    tester: 'Robert Martinez',
    evidence: 'Assessment tool ready',
    findings: 'Pending vendor survey response',
    notes: 'Evaluation in procurement phase',
  },
];

export default function TestsPage() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleData, setScheduleData] = useState<{
    testName: string;
    controlRef: string;
    type: TestResult['type'];
    frequency: string;
    dueDate: string;
    tester: string;
  }>({
    testName: '',
    controlRef: '',
    type: 'Manual',
    frequency: '',
    dueDate: '',
    tester: '',
  });

  useEffect(() => {
    const savedTests = localStorage.getItem('controlTests');
    if (savedTests) {
      setTests(JSON.parse(savedTests));
    } else {
      setTests(MOCK_TESTS);
      localStorage.setItem('controlTests', JSON.stringify(MOCK_TESTS));
    }
    setIsLoading(false);
  }, []);

  const filteredTests = tests.filter((test) => {
    const matchesSearch =
      test.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.controlRef.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || test.status === statusFilter;
    const matchesType = !typeFilter || test.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    scheduled: tests.filter((t) => t.status === 'Scheduled').length,
    completed: tests.filter((t) => t.status === 'Passed').length,
    passRate: Math.round(
      (tests.filter((t) => t.status === 'Passed').length / tests.length) * 100
    ),
    overdue: tests.filter((t) => t.status === 'Overdue').length,
  };

  const handleScheduleTest = () => {
    if (scheduleData.testName && scheduleData.controlRef) {
      const newTest: TestResult = {
        id: `TST-${String(tests.length + 1).padStart(3, '0')}`,
        testName: scheduleData.testName,
        controlRef: scheduleData.controlRef,
        type: scheduleData.type,
        status: 'Scheduled',
        lastRun: 'Never',
        nextDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        tester: 'TBD',
      };
      const updated = [...tests, newTest];
      setTests(updated);
      localStorage.setItem('controlTests', JSON.stringify(updated));
      setScheduleData({ testName: '', controlRef: '', type: 'Manual', frequency: '', dueDate: '', tester: '' });
      setShowScheduleForm(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Passed':
        return 'bg-emerald-100 text-emerald-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      case 'Scheduled':
        return 'bg-amber-100 text-amber-800';
      case 'In Progress':
        return 'bg-sky-100 text-sky-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800 animate-pulse';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Automated':
        return 'bg-sky-100 text-sky-800';
      case 'Manual':
        return 'bg-slate-100 text-slate-800';
      case 'Hybrid':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const StatCard = ({
    label,
    value,
    icon: Icon,
  }: {
    label: string;
    value: string | number;
    icon: any;
  }) => (
    <div className="animate-fadeIn">
      <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-slate-900">{value}</p>
              <p className="text-sm text-slate-600 mt-1">{label}</p>
            </div>
            <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center">
              <Icon className="w-6 h-6 text-sky-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-12 bg-slate-200 rounded-2xl w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-slate-200 rounded-2xl animate-pulse"
            ></div>
          ))}
        </div>
        <div className="h-96 bg-slate-200 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 animate-fadeIn">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Control Testing</h1>
        <p className="text-slate-600">
          Test and validate your security controls across compliance frameworks
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Tests Scheduled"
          value={stats.scheduled}
          icon={Calendar}
        />
        <StatCard label="Tests Completed" value={stats.completed} icon={CheckCircle2} />
        <StatCard label="Pass Rate" value={`${stats.passRate}%`} icon={Zap} />
        <StatCard label="Overdue Tests" value={stats.overdue} icon={AlertTriangle} />
      </div>

      <Card className="border-slate-200/60 shadow-sm rounded-2xl animate-fadeIn">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl text-slate-900">
                Test Execution Log
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                title="Toggle view mode"
              >
                {viewMode === 'list' ? (
                  <Grid3x3 className="w-5 h-5" />
                ) : (
                  <List className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setShowScheduleForm(!showScheduleForm)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-2xl hover:bg-sky-600 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Schedule Test
              </button>
            </div>
          </div>
        </CardHeader>

        {showScheduleForm && (
          <CardContent className="pb-4 border-t border-slate-200/60 pt-4">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Test Name"
                value={scheduleData.testName}
                onChange={(e) =>
                  setScheduleData({ ...scheduleData, testName: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-200/60 rounded-lg focus:outline-none focus:border-sky-500"
              />
              <input
                type="text"
                placeholder="Control Reference (e.g., AC-2.1)"
                value={scheduleData.controlRef}
                onChange={(e) =>
                  setScheduleData({ ...scheduleData, controlRef: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-200/60 rounded-lg focus:outline-none focus:border-sky-500"
              />
              <select
                value={scheduleData.type}
                onChange={(e) =>
                  setScheduleData({
                    ...scheduleData,
                    type: e.target.value as TestResult['type'],
                  })
                }
                className="w-full px-4 py-2 border border-slate-200/60 rounded-lg focus:outline-none focus:border-sky-500"
              >
                <option value="Manual">Manual</option>
                <option value="Automated">Automated</option>
                <option value="Hybrid">Hybrid</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleScheduleTest}
                  className="flex-1 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-medium"
                >
                  Schedule
                </button>
                <button
                  onClick={() => setShowScheduleForm(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </CardContent>
        )}

        <CardContent className="pt-4">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tests by ID, name, or control reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200/60 rounded-lg focus:outline-none focus:border-sky-500 bg-white"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-slate-200/60 rounded-lg focus:outline-none focus:border-sky-500 bg-white"
              >
                <option value="">All Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Passed">Passed</option>
                <option value="Failed">Failed</option>
                <option value="Overdue">Overdue</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-slate-200/60 rounded-lg focus:outline-none focus:border-sky-500 bg-white"
              >
                <option value="">All Types</option>
                <option value="Automated">Automated</option>
                <option value="Manual">Manual</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200/60">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">
                      Test ID
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">
                      Control Ref
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">
                      Test Name
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">
                      Last Run
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">
                      Next Due
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">
                      Tester
                    </th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {filteredTests.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center">
                        <p className="text-slate-500">No tests found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTests.map((test) => (
                      <tbody key={test.id}>
                        <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-4 font-mono font-semibold text-sky-600">
                            {test.id}
                          </td>
                          <td className="px-4 py-4 text-slate-700">{test.controlRef}</td>
                          <td className="px-4 py-4 font-medium text-slate-900">
                            {test.testName}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(
                                test.type
                              )}`}
                            >
                              {test.type}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                test.status
                              )}`}
                            >
                              {test.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-slate-600">{test.lastRun}</td>
                          <td className="px-4 py-4 text-slate-600">{test.nextDue}</td>
                          <td className="px-4 py-4 text-slate-600">{test.tester}</td>
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() =>
                                setExpandedRow(
                                  expandedRow === test.id ? null : test.id
                                )
                              }
                              className="p-1 hover:bg-slate-200/60 rounded transition-colors"
                            >
                              <ChevronDown
                                className={`w-5 h-5 text-slate-600 transition-transform ${
                                  expandedRow === test.id ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                          </td>
                        </tr>
                        {expandedRow === test.id && (
                          <tr className="bg-slate-50/50">
                            <td colSpan={9} className="px-4 py-6">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                  <h4 className="font-semibold text-slate-900 mb-2">
                                    Evidence Collected
                                  </h4>
                                  <p className="text-slate-600 text-sm">
                                    {test.evidence || 'No evidence collected yet'}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-slate-900 mb-2">
                                    Findings
                                  </h4>
                                  <p className="text-slate-600 text-sm">
                                    {test.findings || 'No findings recorded'}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-slate-900 mb-2">
                                    Notes
                                  </h4>
                                  <p className="text-slate-600 text-sm">
                                    {test.notes || 'No additional notes'}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
