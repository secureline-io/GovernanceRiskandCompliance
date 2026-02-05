'use client';

export default function RiskView() {
  return (
    <div className="p-6 space-y-6">
      {/* Risk Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <RiskStatCard severity="Critical" count={2} color="purple" />
        <RiskStatCard severity="High" count={4} color="red" />
        <RiskStatCard severity="Medium" count={12} color="yellow" />
        <RiskStatCard severity="Low" count={23} color="blue" />
      </div>

      {/* Risk Register */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Risk Register</h3>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
            + Add Risk
          </button>
        </div>
        <div className="space-y-3">
          <RiskItem
            id="RISK-001"
            title="Third-Party API Outage Impact"
            category="Operational"
            likelihood="High"
            impact="High"
            inherentRisk="High"
            residualRisk="Medium"
            status="Open"
            owner="DevOps Team"
          />
          <RiskItem
            id="RISK-002"
            title="Ransomware Attack on Infrastructure"
            category="Security"
            likelihood="Medium"
            impact="Critical"
            inherentRisk="High"
            residualRisk="Medium"
            status="Mitigating"
            owner="Security Team"
          />
          <RiskItem
            id="RISK-003"
            title="Key Personnel Departure"
            category="Strategic"
            likelihood="Medium"
            impact="Medium"
            inherentRisk="Medium"
            residualRisk="Low"
            status="Monitoring"
            owner="HR Team"
          />
          <RiskItem
            id="RISK-004"
            title="Compliance Deadline Miss"
            category="Compliance"
            likelihood="Low"
            impact="High"
            inherentRisk="Medium"
            residualRisk="Low"
            status="Monitoring"
            owner="Compliance Team"
          />
        </div>
      </div>

      {/* Risk Heatmap & Treatment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Risk Heatmap (Inherent vs Residual)</h3>
          <div className="grid grid-cols-6 gap-2 text-xs">
            <div className="font-semibold text-center p-2">Impact →</div>
            <div className="bg-gray-100 p-2 text-center font-medium">Very Low</div>
            <div className="bg-gray-100 p-2 text-center font-medium">Low</div>
            <div className="bg-gray-100 p-2 text-center font-medium">Medium</div>
            <div className="bg-gray-100 p-2 text-center font-medium">High</div>
            <div className="bg-gray-100 p-2 text-center font-medium">Critical</div>

            <div className="bg-gray-100 p-2 text-center font-medium">Critical</div>
            <div className="bg-yellow-200 p-2 text-center">0</div>
            <div className="bg-orange-300 p-2 text-center">0</div>
            <div className="bg-red-400 text-white p-2 text-center">1</div>
            <div className="bg-red-500 text-white p-2 text-center">2</div>
            <div className="bg-purple-600 text-white p-2 text-center">1</div>

            <div className="bg-gray-100 p-2 text-center font-medium">High</div>
            <div className="bg-green-300 p-2 text-center">0</div>
            <div className="bg-yellow-300 p-2 text-center">1</div>
            <div className="bg-orange-400 p-2 text-center">3</div>
            <div className="bg-red-500 text-white p-2 text-center">4</div>
            <div className="bg-red-600 text-white p-2 text-center">2</div>

            <div className="bg-gray-100 p-2 text-center font-medium">Medium</div>
            <div className="bg-green-200 p-2 text-center">2</div>
            <div className="bg-green-300 p-2 text-center">4</div>
            <div className="bg-yellow-400 p-2 text-center">6</div>
            <div className="bg-orange-500 text-white p-2 text-center">2</div>
            <div className="bg-red-500 text-white p-2 text-center">0</div>

            <div className="bg-gray-100 p-2 text-center font-medium">Low</div>
            <div className="bg-green-200 p-2 text-center">5</div>
            <div className="bg-green-300 p-2 text-center">8</div>
            <div className="bg-yellow-300 p-2 text-center">3</div>
            <div className="bg-yellow-400 p-2 text-center">1</div>
            <div className="bg-orange-400 p-2 text-center">0</div>

            <div className="bg-gray-100 p-2 text-center font-medium">Very Low</div>
            <div className="bg-green-100 p-2 text-center">12</div>
            <div className="bg-green-200 p-2 text-center">4</div>
            <div className="bg-green-300 p-2 text-center">0</div>
            <div className="bg-yellow-300 p-2 text-center">0</div>
            <div className="bg-yellow-400 p-2 text-center">0</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Risk Treatment Status</h3>
          <div className="space-y-4">
            <TreatmentBar label="Mitigate" count={18} color="blue" />
            <TreatmentBar label="Accept" count={8} color="green" />
            <TreatmentBar label="Transfer" count={5} color="purple" />
            <TreatmentBar label="Avoid" count={2} color="red" />
          </div>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium mb-2">Risk Appetite</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Target Risk Level:</span>
                <span className="font-medium">Medium or below</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Risks Above Appetite:</span>
                <span className="font-medium text-red-600">6 risks</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Assessments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Risk Assessments</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assessment Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assessor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Likelihood</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Impact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <AssessmentRow
                risk="RISK-001: Third-Party API Outage"
                date="Feb 1, 2026"
                assessor="John Doe"
                likelihood="High (4)"
                impact="High (4)"
                score={16}
                nextReview="May 1, 2026"
              />
              <AssessmentRow
                risk="RISK-002: Ransomware Attack"
                date="Jan 28, 2026"
                assessor="Security Team"
                likelihood="Medium (3)"
                impact="Critical (5)"
                score={15}
                nextReview="Apr 28, 2026"
              />
              <AssessmentRow
                risk="RISK-003: Key Personnel Departure"
                date="Jan 15, 2026"
                assessor="HR Lead"
                likelihood="Medium (3)"
                impact="Medium (3)"
                score={9}
                nextReview="Jul 15, 2026"
              />
            </tbody>
          </table>
        </div>
      </div>

      {/* Mitigation Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Active Mitigation Actions</h3>
        <div className="space-y-3">
          <MitigationAction
            action="Implement API failover to secondary provider"
            risk="RISK-001"
            owner="DevOps Team"
            dueDate="Feb 28, 2026"
            progress={60}
            status="In Progress"
          />
          <MitigationAction
            action="Deploy endpoint detection and response (EDR)"
            risk="RISK-002"
            owner="Security Team"
            dueDate="Mar 15, 2026"
            progress={40}
            status="In Progress"
          />
          <MitigationAction
            action="Create knowledge transfer documentation"
            risk="RISK-003"
            owner="Team Leads"
            dueDate="Feb 20, 2026"
            progress={85}
            status="On Track"
          />
        </div>
      </div>
    </div>
  );
}

function RiskStatCard({ severity, count, color }: any) {
  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 ${colorClasses[color]} p-6`}>
      <p className="text-3xl font-bold mb-2">{count}</p>
      <p className="text-sm font-semibold">{severity} Risk</p>
    </div>
  );
}

function RiskItem({ id, title, category, likelihood, impact, inherentRisk, residualRisk, status, owner }: any) {
  const riskColors: Record<string, string> = {
    Critical: 'bg-purple-100 text-purple-800',
    High: 'bg-red-100 text-red-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Low: 'bg-green-100 text-green-800',
  };

  const statusColors: Record<string, string> = {
    Open: 'bg-gray-100 text-gray-800',
    Mitigating: 'bg-blue-100 text-blue-800',
    Monitoring: 'bg-green-100 text-green-800',
    Closed: 'bg-gray-200 text-gray-600',
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-mono text-gray-500">{id}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[status]}`}>
              {status}
            </span>
          </div>
          <p className="font-medium text-sm mb-1">{title}</p>
          <p className="text-xs text-gray-500">Category: {category} • Owner: {owner}</p>
        </div>
        <div className="text-right ml-4">
          <div className="flex items-center space-x-2 mb-1">
            <div>
              <p className="text-xs text-gray-500">Inherent</p>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${riskColors[inherentRisk]}`}>
                {inherentRisk}
              </span>
            </div>
            <span className="text-gray-400">→</span>
            <div>
              <p className="text-xs text-gray-500">Residual</p>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${riskColors[residualRisk]}`}>
                {residualRisk}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4 text-xs text-gray-600 mt-2">
        <span>Likelihood: {likelihood}</span>
        <span>•</span>
        <span>Impact: {impact}</span>
      </div>
    </div>
  );
}

function TreatmentBar({ label, count, color }: any) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
  };

  const total = 33; // Total risks
  const percentage = (count / total) * 100;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-600">{count} risks</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${colorClasses[color]} h-2 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function AssessmentRow({ risk, date, assessor, likelihood, impact, score, nextReview }: any) {
  const getScoreColor = (score: number) => {
    if (score >= 15) return 'bg-red-100 text-red-800';
    if (score >= 10) return 'bg-orange-100 text-orange-800';
    if (score >= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm text-gray-900">{risk}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{date}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{assessor}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{likelihood}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{impact}</td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(score)}`}>
          {score}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{nextReview}</td>
    </tr>
  );
}

function MitigationAction({ action, risk, owner, dueDate, progress, status }: any) {
  const statusColors: Record<string, string> = {
    'In Progress': 'text-blue-600',
    'On Track': 'text-green-600',
    'At Risk': 'text-yellow-600',
    'Overdue': 'text-red-600',
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="font-medium text-sm mb-1">{action}</p>
          <p className="text-xs text-gray-500">
            Risk: {risk} • Owner: {owner} • Due: {dueDate}
          </p>
        </div>
        <span className={`text-sm font-medium ${statusColors[status]}`}>
          {status}
        </span>
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
