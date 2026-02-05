'use client';

export default function CSPMView() {
  return (
    <div className="p-6 space-y-6">
      {/* Cloud Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CloudAccountCard provider="aws" accountId="123456789012" status="Connected" findings={18} />
        <CloudAccountCard provider="azure" accountId="sub-abc-123" status="Connected" findings={7} />
        <CloudAccountCard provider="gcp" accountId="project-xyz" status="Disconnected" findings={0} />
      </div>

      {/* Findings Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Security Findings Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <SeverityCard severity="Critical" count={2} color="purple" />
          <SeverityCard severity="High" count={8} color="red" />
          <SeverityCard severity="Medium" count={15} color="yellow" />
          <SeverityCard severity="Low" count={23} color="blue" />
          <SeverityCard severity="Info" count={45} color="gray" />
        </div>
      </div>

      {/* Active Findings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Active Findings</h3>
          <div className="flex space-x-2">
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>All Providers</option>
              <option>AWS</option>
              <option>Azure</option>
              <option>GCP</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>All Severities</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
        </div>
        <div className="space-y-3">
          <FindingRow
            severity="high"
            title="S3 Bucket with Public Read Access"
            policy="S3-001"
            resource="prod-data-bucket"
            account="AWS: 123456789012"
            detected="2 hours ago"
            status="Open"
          />
          <FindingRow
            severity="high"
            title="IAM User Without MFA Enabled"
            policy="IAM-003"
            resource="john.doe@company.com"
            account="AWS: 123456789012"
            detected="5 hours ago"
            status="In Progress"
          />
          <FindingRow
            severity="medium"
            title="Unencrypted EBS Volume"
            policy="EC2-008"
            resource="vol-0abc123def456"
            account="AWS: 123456789012"
            detected="1 day ago"
            status="Open"
          />
          <FindingRow
            severity="medium"
            title="Security Group Port 22 Open to Internet"
            policy="VPC-002"
            resource="sg-0xyz789"
            account="AWS: 123456789012"
            detected="2 days ago"
            status="Suppressed"
          />
        </div>
      </div>

      {/* Asset Inventory */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Asset Inventory</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <AssetTypeCard type="EC2 Instances" count={34} icon="💻" />
          <AssetTypeCard type="S3 Buckets" count={127} icon="🗄️" />
          <AssetTypeCard type="RDS Databases" count={8} icon="🗃️" />
          <AssetTypeCard type="Lambda Functions" count={156} icon="⚡" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criticality</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Findings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <AssetRow
                name="prod-data-bucket"
                type="S3 Bucket"
                region="us-east-1"
                criticality="Critical"
                findings={3}
              />
              <AssetRow
                name="prod-api-server"
                type="EC2 Instance"
                region="us-west-2"
                criticality="High"
                findings={1}
              />
              <AssetRow
                name="staging-database"
                type="RDS Instance"
                region="eu-west-1"
                criticality="Medium"
                findings={0}
              />
            </tbody>
          </table>
        </div>
      </div>

      {/* Policy Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Policy Coverage by Category</h3>
          <div className="space-y-3">
            <PolicyCategoryBar category="Identity & Access" enabled={12} total={15} />
            <PolicyCategoryBar category="Data Protection" enabled={8} total={10} />
            <PolicyCategoryBar category="Network Security" enabled={18} total={20} />
            <PolicyCategoryBar category="Monitoring & Logging" enabled={6} total={8} />
            <PolicyCategoryBar category="Compliance" enabled={10} total={12} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Remediation Timeline</h3>
          <div className="space-y-4">
            <TimelineItem
              date="Feb 5, 2026"
              action="Resolved 4 high-severity findings"
              user="DevOps Team"
            />
            <TimelineItem
              date="Feb 4, 2026"
              action="Suppressed false positive: SG-123"
              user="John Doe"
            />
            <TimelineItem
              date="Feb 3, 2026"
              action="New policy deployed: IAM-MFA-Required"
              user="Security Team"
            />
            <TimelineItem
              date="Feb 2, 2026"
              action="Completed remediation of 8 medium findings"
              user="DevOps Team"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function CloudAccountCard({ provider, accountId, status, findings }: any) {
  const providerInfo: Record<string, { name: string; icon: string; color: string }> = {
    aws: { name: 'Amazon Web Services', icon: '☁️', color: 'orange' },
    azure: { name: 'Microsoft Azure', icon: '🔷', color: 'blue' },
    gcp: { name: 'Google Cloud Platform', icon: '☁️', color: 'red' },
  };

  const info = providerInfo[provider];
  const isConnected = status === 'Connected';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{info.icon}</span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {status}
        </span>
      </div>
      <h3 className="font-semibold mb-1">{info.name}</h3>
      <p className="text-sm text-gray-600 mb-4">{accountId}</p>
      {isConnected && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Active Findings</span>
          <span className="text-lg font-bold text-red-600">{findings}</span>
        </div>
      )}
    </div>
  );
}

function SeverityCard({ severity, count, color }: any) {
  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${colorClasses[color]}`}>
      <p className="text-3xl font-bold">{count}</p>
      <p className="text-sm font-medium mt-1">{severity}</p>
    </div>
  );
}

function FindingRow({ severity, title, policy, resource, account, detected, status }: any) {
  const severityColors: Record<string, string> = {
    critical: 'bg-purple-100 text-purple-800',
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800',
  };

  const statusColors: Record<string, string> = {
    'Open': 'bg-red-100 text-red-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    'Resolved': 'bg-green-100 text-green-800',
    'Suppressed': 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start space-x-3 flex-1">
          <span className={`px-2 py-1 rounded text-xs font-medium ${severityColors[severity]} uppercase`}>
            {severity}
          </span>
          <div className="flex-1">
            <p className="font-medium text-sm">{title}</p>
            <p className="text-xs text-gray-500 mt-1">
              Policy: {policy} • Resource: {resource}
            </p>
            <p className="text-xs text-gray-500">
              {account} • Detected {detected}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status]}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

function AssetTypeCard({ type, count, icon }: any) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <p className="text-2xl font-bold">{count}</p>
      </div>
      <p className="text-sm text-gray-600">{type}</p>
    </div>
  );
}

function AssetRow({ name, type, region, criticality, findings }: any) {
  const criticalityColors: Record<string, string> = {
    Critical: 'text-red-600',
    High: 'text-orange-600',
    Medium: 'text-yellow-600',
    Low: 'text-green-600',
  };

  return (
    <tr className="hover:bg-gray-50 cursor-pointer">
      <td className="px-4 py-3 text-sm font-medium text-gray-900">{name}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{type}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{region}</td>
      <td className={`px-4 py-3 text-sm font-medium ${criticalityColors[criticality]}`}>
        {criticality}
      </td>
      <td className="px-4 py-3">
        {findings > 0 ? (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
            {findings} finding{findings !== 1 ? 's' : ''}
          </span>
        ) : (
          <span className="text-sm text-gray-400">None</span>
        )}
      </td>
    </tr>
  );
}

function PolicyCategoryBar({ category, enabled, total }: any) {
  const percentage = (enabled / total) * 100;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{category}</span>
        <span className="text-gray-600">{enabled}/{total}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-indigo-600 h-2 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function TimelineItem({ date, action, user }: any) {
  return (
    <div className="flex space-x-3">
      <div className="flex-shrink-0 w-2 h-2 mt-2 bg-indigo-600 rounded-full" />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{action}</p>
        <p className="text-xs text-gray-500">{user} • {date}</p>
      </div>
    </div>
  );
}
