'use client';

export default function PoliciesView() {
  return (
    <div className="p-6 space-y-6">
      {/* Policy Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <PolicyStatCard label="Total Policies" value="42" icon="📋" color="blue" />
        <PolicyStatCard label="Need Review" value="8" icon="⏰" color="yellow" />
        <PolicyStatCard label="Acknowledgments Due" value="15" icon="✍️" color="orange" />
        <PolicyStatCard label="Up to Date" value="34" icon="✅" color="green" />
      </div>

      {/* Policy Library */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Policy Library</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search policies..."
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>All Categories</option>
              <option>Security</option>
              <option>Privacy</option>
              <option>HR</option>
              <option>Operations</option>
            </select>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              + New Policy
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <PolicyCard
            name="Information Security Policy"
            category="Security"
            version="2.1"
            status="Active"
            lastReviewed="Jan 15, 2026"
            nextReview="Jul 15, 2026"
            owner="Security Team"
            acknowledgmentRate={95}
          />
          <PolicyCard
            name="Data Privacy Policy"
            category="Privacy"
            version="1.8"
            status="Active"
            lastReviewed="Dec 1, 2025"
            nextReview="Jun 1, 2026"
            owner="Privacy Officer"
            acknowledgmentRate={87}
          />
          <PolicyCard
            name="Remote Work Policy"
            category="HR"
            version="3.0"
            status="Active"
            lastReviewed="Nov 20, 2025"
            nextReview="May 20, 2026"
            owner="HR Team"
            acknowledgmentRate={100}
          />
          <PolicyCard
            name="Acceptable Use Policy"
            category="Security"
            version="1.5"
            status="Under Review"
            lastReviewed="Oct 10, 2025"
            nextReview="Feb 10, 2026"
            owner="IT Team"
            acknowledgmentRate={72}
          />
          <PolicyCard
            name="Incident Response Policy"
            category="Security"
            version="2.3"
            status="Active"
            lastReviewed="Jan 5, 2026"
            nextReview="Jul 5, 2026"
            owner="Security Team"
            acknowledgmentRate={98}
          />
        </div>
      </div>

      {/* Policy Review Schedule & Acknowledgments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Reviews</h3>
          <div className="space-y-3">
            <ReviewScheduleItem
              policy="Acceptable Use Policy"
              dueDate="Feb 10, 2026"
              reviewer="IT Team"
              status="Overdue"
            />
            <ReviewScheduleItem
              policy="Business Continuity Policy"
              dueDate="Feb 28, 2026"
              reviewer="Operations Team"
              status="Scheduled"
            />
            <ReviewScheduleItem
              policy="Third-Party Risk Management"
              dueDate="Mar 15, 2026"
              reviewer="Risk Manager"
              status="Scheduled"
            />
            <ReviewScheduleItem
              policy="Data Retention Policy"
              dueDate="Mar 30, 2026"
              reviewer="Compliance Team"
              status="Scheduled"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Pending Acknowledgments</h3>
          <div className="space-y-3">
            <AcknowledgmentItem
              policy="Information Security Policy v2.1"
              employee="John Doe"
              department="Engineering"
              dueDate="Feb 15, 2026"
            />
            <AcknowledgmentItem
              policy="Data Privacy Policy v1.8"
              employee="Jane Smith"
              department="Marketing"
              dueDate="Feb 20, 2026"
            />
            <AcknowledgmentItem
              policy="Remote Work Policy v3.0"
              employee="Bob Johnson"
              department="Sales"
              dueDate="Feb 25, 2026"
            />
            <AcknowledgmentItem
              policy="Acceptable Use Policy v1.5"
              employee="Alice Williams"
              department="HR"
              dueDate="Feb 28, 2026"
            />
          </div>
        </div>
      </div>

      {/* Policy Compliance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Policy Compliance Overview</h3>
        <div className="space-y-4">
          <ComplianceBar
            category="Security Policies"
            acknowledged={142}
            total={150}
            percentage={95}
          />
          <ComplianceBar
            category="Privacy Policies"
            acknowledged={88}
            total={100}
            percentage={88}
          />
          <ComplianceBar
            category="HR Policies"
            acknowledged={96}
            total={100}
            percentage={96}
          />
          <ComplianceBar
            category="Operations Policies"
            acknowledged={68}
            total={80}
            percentage={85}
          />
        </div>
      </div>

      {/* Recent Changes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Policy Changes</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Policy</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Changed By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <ChangeRow
                policy="Information Security Policy"
                changeType="Major Update"
                version="2.1"
                date="Jan 15, 2026"
                changedBy="Security Team"
                summary="Added zero-trust requirements"
              />
              <ChangeRow
                policy="Remote Work Policy"
                changeType="Major Update"
                version="3.0"
                date="Nov 20, 2025"
                changedBy="HR Team"
                summary="Updated collaboration tools section"
              />
              <ChangeRow
                policy="Data Privacy Policy"
                changeType="Minor Update"
                version="1.8"
                date="Dec 1, 2025"
                changedBy="Privacy Officer"
                summary="Clarified data retention periods"
              />
            </tbody>
          </table>
        </div>
      </div>

      {/* Policy Templates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Policy Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TemplateCard
            name="Cybersecurity Policy"
            description="Template for establishing cybersecurity controls"
            category="Security"
          />
          <TemplateCard
            name="BYOD Policy"
            description="Template for bring-your-own-device guidelines"
            category="HR"
          />
          <TemplateCard
            name="Data Classification Policy"
            description="Template for classifying and handling data"
            category="Privacy"
          />
        </div>
      </div>
    </div>
  );
}

function PolicyStatCard({ label, value, icon, color }: any) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center text-2xl mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}

function PolicyCard({ name, category, version, status, lastReviewed, nextReview, owner, acknowledgmentRate }: any) {
  const statusColors: Record<string, string> = {
    Active: 'bg-green-100 text-green-800',
    'Under Review': 'bg-yellow-100 text-yellow-800',
    Draft: 'bg-gray-100 text-gray-800',
    Archived: 'bg-red-100 text-red-800',
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-semibold">{name}</h4>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[status]}`}>
              {status}
            </span>
            <span className="text-xs text-gray-500">v{version}</span>
          </div>
          <p className="text-sm text-gray-600">{category} • Owner: {owner}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-xs mb-3">
        <div>
          <p className="text-gray-500">Last Reviewed</p>
          <p className="font-medium">{lastReviewed}</p>
        </div>
        <div>
          <p className="text-gray-500">Next Review</p>
          <p className="font-medium">{nextReview}</p>
        </div>
        <div>
          <p className="text-gray-500">Acknowledgment</p>
          <p className={`font-medium ${acknowledgmentRate >= 90 ? 'text-green-600' : acknowledgmentRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
            {acknowledgmentRate}%
          </p>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${acknowledgmentRate >= 90 ? 'bg-green-500' : acknowledgmentRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
          style={{ width: `${acknowledgmentRate}%` }}
        />
      </div>
    </div>
  );
}

function ReviewScheduleItem({ policy, dueDate, reviewer, status }: any) {
  const statusColors: Record<string, string> = {
    Scheduled: 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    Overdue: 'bg-red-100 text-red-800',
  };

  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
      <div className="flex-1">
        <p className="font-medium text-sm">{policy}</p>
        <p className="text-xs text-gray-500">Reviewer: {reviewer}</p>
      </div>
      <div className="text-right ml-4">
        <p className="text-sm font-medium mb-1">{dueDate}</p>
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[status]}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

function AcknowledgmentItem({ policy, employee, department, dueDate }: any) {
  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
      <div className="flex-1">
        <p className="font-medium text-sm">{employee}</p>
        <p className="text-xs text-gray-500">{department} • {policy}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-500">Due</p>
        <p className="text-sm font-medium">{dueDate}</p>
      </div>
    </div>
  );
}

function ComplianceBar({ category, acknowledged, total, percentage }: any) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium text-gray-700">{category}</span>
        <span className="text-gray-600">{acknowledged}/{total} ({percentage}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${
            percentage >= 90 ? 'bg-green-500' : percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ChangeRow({ policy, changeType, version, date, changedBy, summary }: any) {
  const typeColors: Record<string, string> = {
    'Major Update': 'bg-purple-100 text-purple-800',
    'Minor Update': 'bg-blue-100 text-blue-800',
    'Correction': 'bg-yellow-100 text-yellow-800',
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm font-medium text-gray-900">{policy}</td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${typeColors[changeType]}`}>
          {changeType}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{version}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{date}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{changedBy}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{summary}</td>
    </tr>
  );
}

function TemplateCard({ name, description, category }: any) {
  return (
    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-gray-50 cursor-pointer transition-colors">
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-2xl">📄</span>
        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">{category}</span>
      </div>
      <h4 className="font-medium text-sm mb-1">{name}</h4>
      <p className="text-xs text-gray-600">{description}</p>
      <button className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
        Use Template →
      </button>
    </div>
  );
}
