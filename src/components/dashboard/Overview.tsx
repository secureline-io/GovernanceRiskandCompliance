'use client';

export default function Overview() {
  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Compliance Score"
          value="87%"
          change="+5%"
          trend="up"
          icon="✅"
          color="green"
        />
        <StatCard
          title="Active Findings"
          value="23"
          change="-8"
          trend="down"
          icon="🔍"
          color="yellow"
        />
        <StatCard
          title="High Risks"
          value="4"
          change="+2"
          trend="up"
          icon="⚠️"
          color="red"
        />
        <StatCard
          title="Vendor Reviews"
          value="12"
          change="Due this month"
          trend="neutral"
          icon="🤝"
          color="blue"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Framework Compliance</h3>
          <div className="space-y-4">
            <ComplianceBar label="SOC 2 Type II" percentage={92} color="green" />
            <ComplianceBar label="ISO 27001" percentage={78} color="blue" />
            <ComplianceBar label="GDPR" percentage={85} color="purple" />
            <ComplianceBar label="HIPAA" percentage={65} color="orange" />
          </div>
        </div>

        {/* Recent Findings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Security Findings</h3>
          <div className="space-y-3">
            <FindingItem
              severity="high"
              title="S3 Bucket Public Access"
              resource="prod-data-bucket"
              time="2 hours ago"
            />
            <FindingItem
              severity="medium"
              title="Unencrypted EBS Volume"
              resource="i-0abc123def"
              time="5 hours ago"
            />
            <FindingItem
              severity="high"
              title="IAM User Without MFA"
              resource="john.doe@company.com"
              time="1 day ago"
            />
            <FindingItem
              severity="low"
              title="Security Group Too Permissive"
              resource="sg-0xyz789"
              time="2 days ago"
            />
          </div>
        </div>

        {/* Risk Heatmap */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Risk Heatmap</h3>
          <div className="grid grid-cols-5 gap-2">
            {[
              ['', 'Very Low', 'Low', 'Medium', 'High', 'Very High'],
              ['Very High', 2, 3, 5, 8, 12],
              ['High', 1, 2, 4, 6, 9],
              ['Medium', 1, 1, 3, 4, 5],
              ['Low', 0, 1, 2, 2, 3],
              ['Very Low', 0, 0, 1, 1, 1],
            ].map((row, i) => (
              <div key={i} className="contents">
                {row.map((cell, j) => (
                  <div
                    key={j}
                    className={`
                      h-12 flex items-center justify-center text-xs font-medium rounded
                      ${i === 0 || j === 0 
                        ? 'bg-gray-50 text-gray-600' 
                        : getRiskColor(Number(cell))
                      }
                    `}
                  >
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Tasks</h3>
          <div className="space-y-3">
            <TaskItem
              title="Annual SOC 2 Audit"
              dueDate="Mar 15, 2026"
              priority="high"
              assignee="Security Team"
            />
            <TaskItem
              title="Vendor Risk Assessment - AWS"
              dueDate="Feb 20, 2026"
              priority="medium"
              assignee="John Doe"
            />
            <TaskItem
              title="Policy Review: Data Retention"
              dueDate="Feb 28, 2026"
              priority="medium"
              assignee="Jane Smith"
            />
            <TaskItem
              title="Control Testing: Access Reviews"
              dueDate="Mar 1, 2026"
              priority="low"
              assignee="IT Team"
            />
          </div>
        </div>
      </div>

      {/* Evidence & Audit Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Evidence & Activity</h3>
        <div className="space-y-3">
          <ActivityItem
            type="evidence"
            action="uploaded"
            item="Access Control Review Q4 2025"
            user="John Doe"
            time="30 minutes ago"
          />
          <ActivityItem
            type="control"
            action="tested"
            item="Password Complexity Policy"
            user="Security Team"
            time="2 hours ago"
          />
          <ActivityItem
            type="finding"
            action="resolved"
            item="Unpatched EC2 Instance"
            user="DevOps Team"
            time="4 hours ago"
          />
          <ActivityItem
            type="risk"
            action="created"
            item="Third-party API Integration Risk"
            user="Jane Smith"
            time="1 day ago"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, trend, icon, color }: any) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        <span className={`text-sm font-medium ${
          trend === 'up' ? 'text-red-600' : trend === 'down' ? 'text-green-600' : 'text-gray-600'
        }`}>
          {change}
        </span>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}

function ComplianceBar({ label, percentage, color }: any) {
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-600">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${colorClasses[color]} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function FindingItem({ severity, title, resource, time }: any) {
  const severityColors = {
    critical: 'bg-purple-100 text-purple-800',
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
      <span className={`px-2 py-1 rounded text-xs font-medium ${severityColors[severity]}`}>
        {severity.toUpperCase()}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{resource}</p>
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">{time}</span>
    </div>
  );
}

function getRiskColor(value: number): string {
  if (value >= 10) return 'bg-red-500 text-white';
  if (value >= 7) return 'bg-orange-500 text-white';
  if (value >= 4) return 'bg-yellow-400 text-gray-900';
  if (value >= 2) return 'bg-green-400 text-white';
  return 'bg-green-200 text-gray-900';
}

function TaskItem({ title, dueDate, priority, assignee }: any) {
  const priorityColors = {
    high: 'text-red-600',
    medium: 'text-yellow-600',
    low: 'text-green-600',
  };

  return (
    <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
      <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">
          {assignee} • Due {dueDate}
        </p>
      </div>
      <span className={`text-xs font-medium ${priorityColors[priority]}`}>
        {priority.toUpperCase()}
      </span>
    </div>
  );
}

function ActivityItem({ type, action, item, user, time }: any) {
  const typeIcons: Record<string, string> = {
    evidence: '📁',
    control: '✅',
    finding: '🔍',
    risk: '⚠️',
  };

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <span className="text-2xl">{typeIcons[type]}</span>
      <div className="flex-1">
        <p className="text-sm text-gray-900">
          <span className="font-medium">{user}</span> {action}{' '}
          <span className="font-medium">{item}</span>
        </p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
}
