'use client';

export default function ComplianceView() {
  return (
    <div className="p-6 space-y-6">
      {/* Framework Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FrameworkCard
          name="SOC 2 Type II"
          status="In Progress"
          progress={92}
          auditDate="March 15, 2026"
          requirements={{ total: 64, completed: 59, inProgress: 5 }}
        />
        <FrameworkCard
          name="ISO 27001:2022"
          status="In Progress"
          progress={78}
          auditDate="June 20, 2026"
          requirements={{ total: 93, completed: 73, inProgress: 20 }}
        />
        <FrameworkCard
          name="GDPR"
          status="Ready"
          progress={85}
          auditDate="N/A"
          requirements={{ total: 42, completed: 36, inProgress: 6 }}
        />
      </div>

      {/* Controls & Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls Library */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Control Library</h3>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              + Add Control
            </button>
          </div>
          <div className="space-y-3">
            <ControlItem
              code="AC-001"
              name="Multi-Factor Authentication"
              type="Preventive"
              status="Compliant"
              effectiveness={98}
            />
            <ControlItem
              code="AC-002"
              name="Access Review Process"
              type="Detective"
              status="Compliant"
              effectiveness={95}
            />
            <ControlItem
              code="CM-001"
              name="Change Management Approval"
              type="Directive"
              status="Partially Compliant"
              effectiveness={75}
            />
            <ControlItem
              code="IR-001"
              name="Incident Response Plan"
              type="Corrective"
              status="Not Tested"
              effectiveness={0}
            />
          </div>
        </div>

        {/* Requirements Checklist */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">SOC 2 Requirements</h3>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>All Categories</option>
              <option>Common Criteria</option>
              <option>Availability</option>
              <option>Confidentiality</option>
            </select>
          </div>
          <div className="space-y-3">
            <RequirementItem
              code="CC1.1"
              title="Entity Demonstrates Commitment to Integrity"
              status="Complete"
              evidence={3}
            />
            <RequirementItem
              code="CC1.2"
              title="Board of Directors Oversight"
              status="In Progress"
              evidence={1}
            />
            <RequirementItem
              code="CC2.1"
              title="Communication of Responsibilities"
              status="Complete"
              evidence={5}
            />
            <RequirementItem
              code="CC2.2"
              title="Competence Requirements"
              status="Not Started"
              evidence={0}
            />
          </div>
        </div>
      </div>

      {/* Gap Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Gap Analysis Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <GapMetric label="Compliant" count={45} percentage={70} color="green" />
          <GapMetric label="Partially Compliant" count={12} percentage={19} color="yellow" />
          <GapMetric label="Non-Compliant" count={4} percentage={6} color="red" />
          <GapMetric label="Not Tested" count={3} percentage={5} color="gray" />
        </div>
      </div>

      {/* Testing Schedule */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Control Testing Schedule</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Control</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Tested</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Test</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <TestingRow
                control="AC-001: Multi-Factor Authentication"
                frequency="Monthly"
                lastTested="Jan 15, 2026"
                nextTest="Feb 15, 2026"
                owner="Security Team"
                status="On Track"
              />
              <TestingRow
                control="AC-002: Access Review Process"
                frequency="Quarterly"
                lastTested="Dec 1, 2025"
                nextTest="Mar 1, 2026"
                owner="IT Team"
                status="On Track"
              />
              <TestingRow
                control="CM-001: Change Management"
                frequency="Weekly"
                lastTested="Feb 3, 2026"
                nextTest="Feb 10, 2026"
                owner="DevOps Team"
                status="Overdue"
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FrameworkCard({ name, status, progress, auditDate, requirements }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">{name}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          status === 'Ready' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {status}
        </span>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Overall Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Completed</span>
          <span className="font-medium">{requirements.completed}/{requirements.total}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">In Progress</span>
          <span className="font-medium">{requirements.inProgress}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Target Audit</span>
          <span className="font-medium">{auditDate}</span>
        </div>
      </div>
    </div>
  );
}

function ControlItem({ code, name, type, status, effectiveness }: any) {
  const statusColors: Record<string, string> = {
    'Compliant': 'bg-green-100 text-green-800',
    'Partially Compliant': 'bg-yellow-100 text-yellow-800',
    'Non-Compliant': 'bg-red-100 text-red-800',
    'Not Tested': 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-medium text-sm">{code}</p>
          <p className="text-sm text-gray-600">{name}</p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status]}`}>
          {status}
        </span>
      </div>
      <div className="flex items-center space-x-4 text-xs text-gray-500">
        <span>Type: {type}</span>
        <span>Effectiveness: {effectiveness}%</span>
      </div>
    </div>
  );
}

function RequirementItem({ code, title, status, evidence }: any) {
  const statusIcons: Record<string, string> = {
    'Complete': '✓',
    'In Progress': '◷',
    'Not Started': '○',
  };

  const statusColors: Record<string, string> = {
    'Complete': 'text-green-600',
    'In Progress': 'text-yellow-600',
    'Not Started': 'text-gray-400',
  };

  return (
    <div className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
      <span className={`text-xl ${statusColors[status]}`}>{statusIcons[status]}</span>
      <div className="flex-1">
        <p className="font-medium text-sm">{code}</p>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{evidence} evidence item{evidence !== 1 ? 's' : ''}</p>
      </div>
    </div>
  );
}

function GapMetric({ label, count, percentage, color }: any) {
  const colorClasses: Record<string, string> = {
    green: 'text-green-600 bg-green-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    red: 'text-red-600 bg-red-50',
    gray: 'text-gray-600 bg-gray-50',
  };

  return (
    <div className={`p-4 rounded-lg ${colorClasses[color]}`}>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs mt-1">{percentage}% of total</p>
    </div>
  );
}

function TestingRow({ control, frequency, lastTested, nextTest, owner, status }: any) {
  const statusColors: Record<string, string> = {
    'On Track': 'bg-green-100 text-green-800',
    'Overdue': 'bg-red-100 text-red-800',
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm text-gray-900">{control}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{frequency}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{lastTested}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{nextTest}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{owner}</td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status]}`}>
          {status}
        </span>
      </td>
    </tr>
  );
}
