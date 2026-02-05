'use client';

export default function VendorsView() {
  return (
    <div className="p-6 space-y-6">
      {/* Vendor Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <VendorStatCard label="Total Vendors" value="45" icon="🤝" color="blue" />
        <VendorStatCard label="High Risk" value="6" icon="⚠️" color="red" />
        <VendorStatCard label="Reviews Due" value="12" icon="📋" color="yellow" />
        <VendorStatCard label="Certified" value="38" icon="✅" color="green" />
      </div>

      {/* Vendor Directory */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Vendor Directory</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search vendors..."
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>All Categories</option>
              <option>Cloud Infrastructure</option>
              <option>Software Services</option>
              <option>Data Processing</option>
              <option>Security Tools</option>
            </select>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              + Add Vendor
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <VendorCard
            name="Amazon Web Services"
            category="Cloud Infrastructure"
            riskScore={85}
            riskLevel="Low"
            lastReview="Jan 15, 2026"
            nextReview="Jul 15, 2026"
            certifications={['SOC 2', 'ISO 27001', 'PCI DSS']}
            status="Active"
          />
          <VendorCard
            name="Salesforce"
            category="Software Services"
            riskScore={78}
            riskLevel="Medium"
            lastReview="Dec 1, 2025"
            nextReview="Jun 1, 2026"
            certifications={['SOC 2', 'ISO 27001']}
            status="Active"
          />
          <VendorCard
            name="Acme Analytics Inc"
            category="Data Processing"
            riskScore={45}
            riskLevel="High"
            lastReview="Oct 10, 2025"
            nextReview="Feb 10, 2026"
            certifications={['SOC 2']}
            status="Review Required"
          />
          <VendorCard
            name="SecureCloud Backup"
            category="Cloud Infrastructure"
            riskScore={92}
            riskLevel="Low"
            lastReview="Jan 5, 2026"
            nextReview="Jul 5, 2026"
            certifications={['SOC 2', 'ISO 27001', 'ISO 27018']}
            status="Active"
          />
        </div>
      </div>

      {/* Risk Distribution & Assessment Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Vendor Risk Distribution</h3>
          <div className="space-y-4">
            <RiskDistribution level="Low Risk (80-100)" count={24} total={45} color="green" />
            <RiskDistribution level="Medium Risk (60-79)" count={15} total={45} color="yellow" />
            <RiskDistribution level="High Risk (40-59)" count={5} total={45} color="orange" />
            <RiskDistribution level="Critical Risk (0-39)" count={1} total={45} color="red" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Reviews</h3>
          <div className="space-y-3">
            <ReviewItem
              vendor="Acme Analytics Inc"
              dueDate="Feb 10, 2026"
              type="Annual Review"
              priority="high"
            />
            <ReviewItem
              vendor="DataStorage Pro"
              dueDate="Feb 15, 2026"
              type="Quarterly Review"
              priority="medium"
            />
            <ReviewItem
              vendor="Email Service Corp"
              dueDate="Feb 20, 2026"
              type="Security Assessment"
              priority="medium"
            />
            <ReviewItem
              vendor="Payment Gateway LLC"
              dueDate="Feb 28, 2026"
              type="Annual Review"
              priority="high"
            />
          </div>
        </div>
      </div>

      {/* Vendor Assessments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Assessments</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assessment Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assessor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <AssessmentRow
                vendor="Amazon Web Services"
                type="Annual Security Review"
                date="Jan 15, 2026"
                assessor="Security Team"
                score={85}
                status="Approved"
              />
              <AssessmentRow
                vendor="Salesforce"
                type="Quarterly Review"
                date="Dec 1, 2025"
                assessor="Compliance Team"
                score={78}
                status="Approved"
              />
              <AssessmentRow
                vendor="Acme Analytics Inc"
                type="Annual Review"
                date="Oct 10, 2025"
                assessor="Risk Manager"
                score={45}
                status="Action Required"
              />
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Certifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Certification Coverage</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <CertificationCard cert="SOC 2 Type II" vendors={38} total={45} />
          <CertificationCard cert="ISO 27001" vendors={32} total={45} />
          <CertificationCard cert="PCI DSS" vendors={12} total={45} />
          <CertificationCard cert="HIPAA" vendors={5} total={45} />
        </div>
      </div>
    </div>
  );
}

function VendorStatCard({ label, value, icon, color }: any) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
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

function VendorCard({ name, category, riskScore, riskLevel, lastReview, nextReview, certifications, status }: any) {
  const riskColors: Record<string, string> = {
    Low: 'text-green-600 bg-green-50',
    Medium: 'text-yellow-600 bg-yellow-50',
    High: 'text-red-600 bg-red-50',
    Critical: 'text-purple-600 bg-purple-50',
  };

  const statusColors: Record<string, string> = {
    Active: 'bg-green-100 text-green-800',
    'Review Required': 'bg-yellow-100 text-yellow-800',
    Suspended: 'bg-red-100 text-red-800',
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
          </div>
          <p className="text-sm text-gray-600">{category}</p>
        </div>
        <div className={`px-3 py-1 rounded-lg ${riskColors[riskLevel]}`}>
          <p className="text-xs font-medium">{riskLevel} Risk</p>
          <p className="text-lg font-bold text-center">{riskScore}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4 text-xs text-gray-600 mb-2">
        <span>Last Review: {lastReview}</span>
        <span>•</span>
        <span>Next Review: {nextReview}</span>
      </div>

      <div className="flex items-center space-x-2">
        {certifications.map((cert: string) => (
          <span key={cert} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
            {cert}
          </span>
        ))}
      </div>
    </div>
  );
}

function RiskDistribution({ level, count, total, color }: any) {
  const percentage = (count / total) * 100;
  const colorClasses: Record<string, string> = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{level}</span>
        <span className="text-gray-600">{count} vendors</span>
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

function ReviewItem({ vendor, dueDate, type, priority }: any) {
  const priorityColors: Record<string, string> = {
    high: 'text-red-600',
    medium: 'text-yellow-600',
    low: 'text-green-600',
  };

  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
      <div className="flex-1">
        <p className="font-medium text-sm">{vendor}</p>
        <p className="text-xs text-gray-500">{type}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{dueDate}</p>
        <p className={`text-xs font-medium uppercase ${priorityColors[priority]}`}>
          {priority}
        </p>
      </div>
    </div>
  );
}

function AssessmentRow({ vendor, type, date, assessor, score, status }: any) {
  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const statusColors: Record<string, string> = {
    Approved: 'bg-green-100 text-green-800',
    'Action Required': 'bg-red-100 text-red-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm font-medium text-gray-900">{vendor}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{type}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{date}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{assessor}</td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded text-sm font-medium ${getRiskColor(score)}`}>
          {score}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status]}`}>
          {status}
        </span>
      </td>
      <td className="px-4 py-3">
        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
          View Details
        </button>
      </td>
    </tr>
  );
}

function CertificationCard({ cert, vendors, total }: any) {
  const percentage = (vendors / total) * 100;

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="text-sm font-medium text-gray-700 mb-2">{cert}</p>
      <p className="text-2xl font-bold mb-1">{vendors}</p>
      <p className="text-xs text-gray-600">{percentage.toFixed(0)}% of vendors</p>
    </div>
  );
}
