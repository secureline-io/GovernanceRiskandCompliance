'use client';

export default function EvidenceView() {
  return (
    <div className="p-6 space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer">
          <div className="text-5xl mb-3">📁</div>
          <h3 className="text-lg font-semibold mb-2">Upload Evidence</h3>
          <p className="text-sm text-gray-600 mb-4">
            Drag and drop files here, or click to browse
          </p>
          <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Select Files
          </button>
        </div>
      </div>

      {/* Evidence Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <EvidenceStatCard label="Total Evidence" value="1,247" icon="📄" color="blue" />
        <EvidenceStatCard label="This Quarter" value="89" icon="📅" color="green" />
        <EvidenceStatCard label="Pending Review" value="12" icon="⏰" color="yellow" />
        <EvidenceStatCard label="Expiring Soon" value="5" icon="⚠️" color="red" />
      </div>

      {/* Evidence Library */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Evidence Library</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search evidence..."
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>All Types</option>
              <option>Documents</option>
              <option>Screenshots</option>
              <option>Reports</option>
              <option>Policies</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>All Controls</option>
              <option>AC-001</option>
              <option>AC-002</option>
              <option>CM-001</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <EvidenceItem
            name="Access Control Review Q4 2025.pdf"
            type="Document"
            control="AC-002"
            uploadedBy="John Doe"
            uploadedAt="2 hours ago"
            size="2.4 MB"
            status="Approved"
          />
          <EvidenceItem
            name="MFA Enforcement Screenshot.png"
            type="Screenshot"
            control="AC-001"
            uploadedBy="Jane Smith"
            uploadedAt="5 hours ago"
            size="856 KB"
            status="Pending Review"
          />
          <EvidenceItem
            name="Incident Response Plan v2.3.docx"
            type="Document"
            control="IR-001"
            uploadedBy="Security Team"
            uploadedAt="1 day ago"
            size="1.8 MB"
            status="Approved"
          />
          <EvidenceItem
            name="Vulnerability Scan Report Jan 2026.pdf"
            type="Report"
            control="VA-001"
            uploadedBy="DevOps Team"
            uploadedAt="2 days ago"
            size="5.2 MB"
            status="Approved"
          />
          <EvidenceItem
            name="Backup Verification Log.csv"
            type="Log"
            control="BC-002"
            uploadedBy="IT Team"
            uploadedAt="3 days ago"
            size="124 KB"
            status="Approved"
          />
        </div>
      </div>

      {/* Evidence by Control */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Evidence by Control</h3>
          <div className="space-y-3">
            <ControlEvidenceBar control="AC-001: Multi-Factor Auth" count={15} required={12} />
            <ControlEvidenceBar control="AC-002: Access Reviews" count={8} required={12} />
            <ControlEvidenceBar control="CM-001: Change Management" count={24} required={20} />
            <ControlEvidenceBar control="IR-001: Incident Response" count={6} required={8} />
            <ControlEvidenceBar control="BC-002: Backup Procedures" count={12} required={12} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <ActivityLog
              action="uploaded"
              item="Access Control Review Q4 2025.pdf"
              user="John Doe"
              time="2 hours ago"
            />
            <ActivityLog
              action="approved"
              item="MFA Configuration Screenshot"
              user="Security Lead"
              time="4 hours ago"
            />
            <ActivityLog
              action="commented on"
              item="Vulnerability Scan Report"
              user="Jane Smith"
              time="6 hours ago"
            />
            <ActivityLog
              action="updated"
              item="Incident Response Plan v2.3"
              user="Security Team"
              time="1 day ago"
            />
          </div>
        </div>
      </div>

      {/* Retention Policy */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Evidence Retention & Expiration</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evidence</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Control</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Retention</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <RetentionRow
                name="SOC 2 Audit Report 2024"
                control="AU-001"
                uploaded="Jan 15, 2024"
                retention="7 years"
                expires="Jan 15, 2031"
                status="Active"
              />
              <RetentionRow
                name="Q3 2025 Access Review"
                control="AC-002"
                uploaded="Sep 30, 2025"
                retention="3 years"
                expires="Sep 30, 2028"
                status="Active"
              />
              <RetentionRow
                name="Old Security Policy v1.0"
                control="PS-001"
                uploaded="Mar 1, 2023"
                retention="2 years"
                expires="Mar 1, 2026"
                status="Expiring Soon"
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EvidenceStatCard({ label, value, icon, color }: any) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
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

function EvidenceItem({ name, type, control, uploadedBy, uploadedAt, size, status }: any) {
  const statusColors: Record<string, string> = {
    'Approved': 'bg-green-100 text-green-800',
    'Pending Review': 'bg-yellow-100 text-yellow-800',
    'Rejected': 'bg-red-100 text-red-800',
  };

  const typeIcons: Record<string, string> = {
    Document: '📄',
    Screenshot: '🖼️',
    Report: '📊',
    Log: '📋',
  };

  return (
    <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
      <span className="text-3xl">{typeIcons[type] || '📄'}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{name}</p>
        <p className="text-xs text-gray-500">
          Control: {control} • {uploadedBy} • {uploadedAt} • {size}
        </p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {status}
      </span>
      <button className="p-2 hover:bg-gray-100 rounded">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
    </div>
  );
}

function ControlEvidenceBar({ control, count, required }: any) {
  const percentage = Math.min((count / required) * 100, 100);
  const isComplete = count >= required;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{control}</span>
        <span className={`font-medium ${isComplete ? 'text-green-600' : 'text-gray-600'}`}>
          {count}/{required}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${isComplete ? 'bg-green-500' : 'bg-indigo-600'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ActivityLog({ action, item, user, time }: any) {
  const actionIcons: Record<string, string> = {
    uploaded: '⬆️',
    approved: '✅',
    'commented on': '💬',
    updated: '✏️',
  };

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
      <span className="text-xl">{actionIcons[action] || '📌'}</span>
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-medium">{user}</span> {action}{' '}
          <span className="font-medium">{item}</span>
        </p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
}

function RetentionRow({ name, control, uploaded, retention, expires, status }: any) {
  const statusColors: Record<string, string> = {
    Active: 'bg-green-100 text-green-800',
    'Expiring Soon': 'bg-yellow-100 text-yellow-800',
    Expired: 'bg-red-100 text-red-800',
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm text-gray-900">{name}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{control}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{uploaded}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{retention}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{expires}</td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status]}`}>
          {status}
        </span>
      </td>
    </tr>
  );
}
