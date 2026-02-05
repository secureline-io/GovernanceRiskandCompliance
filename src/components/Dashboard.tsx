'use client';

import { useEffect, useState } from 'react';
import {
  Shield,
  AlertTriangle,
  FileText,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface DashboardStats {
  complianceScore: number;
  activeRisks: number;
  pendingTasks: number;
  vendorCount: number;
}

interface Framework {
  id: string;
  code: string;
  name: string;
  framework_requirements: { count: number }[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    complianceScore: 0,
    activeRisks: 0,
    pendingTasks: 0,
    vendorCount: 0
  });
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [frameworksRes] = await Promise.all([
        fetch('/api/frameworks')
      ]);

      const frameworksData = await frameworksRes.json();

      if (frameworksData.data) {
        setFrameworks(frameworksData.data);
      }

      // Mock stats for now
      setStats({
        complianceScore: 73,
        activeRisks: 12,
        pendingTasks: 28,
        vendorCount: 45
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Compliance Score',
      value: `${stats.complianceScore}%`,
      change: '+5%',
      changeType: 'positive',
      icon: Shield,
      color: 'bg-teal-500'
    },
    {
      title: 'Active Risks',
      value: stats.activeRisks,
      change: '-3',
      changeType: 'positive',
      icon: AlertTriangle,
      color: 'bg-orange-500'
    },
    {
      title: 'Pending Tasks',
      value: stats.pendingTasks,
      change: '+8',
      changeType: 'negative',
      icon: Clock,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Vendors',
      value: stats.vendorCount,
      change: '+2',
      changeType: 'neutral',
      icon: Users,
      color: 'bg-purple-500'
    }
  ];

  const recentActivity = [
    { id: 1, action: 'Control AC-001 marked compliant', time: '2 hours ago', type: 'success' },
    { id: 2, action: 'New evidence uploaded for CC6.1', time: '4 hours ago', type: 'info' },
    { id: 3, action: 'Risk assessment updated', time: '6 hours ago', type: 'warning' },
    { id: 4, action: 'Vendor review completed', time: '1 day ago', type: 'success' },
    { id: 5, action: 'Policy acknowledgement pending', time: '2 days ago', type: 'warning' },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here&apos;s your compliance overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className={`flex items-center text-sm ${
                stat.changeType === 'positive' ? 'text-green-600' :
                stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {stat.changeType === 'positive' ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : stat.changeType === 'negative' ? (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                ) : null}
                {stat.change}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Frameworks Overview */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Frameworks Overview</h2>
            <a href="/compliance" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
              View All
            </a>
          </div>

          {frameworks.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No frameworks added yet</p>
              <a href="/compliance" className="text-teal-600 text-sm font-medium mt-2 inline-block">
                Add Framework
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {frameworks.map((framework) => (
                <div key={framework.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                      {framework.code.substring(0, 3)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{framework.name}</p>
                      <p className="text-sm text-gray-500">
                        {framework.framework_requirements?.[0]?.count || 0} requirements
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">0%</p>
                      <p className="text-xs text-gray-500">Compliant</p>
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '0%' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/compliance" className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Shield className="w-5 h-5 text-teal-600" />
            <span className="text-sm font-medium text-gray-700">Add Framework</span>
          </a>
          <a href="/evidence" className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Upload Evidence</span>
          </a>
          <a href="/risks" className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">Create Risk</span>
          </a>
          <a href="/vendors" className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Add Vendor</span>
          </a>
        </div>
      </div>
    </div>
  );
}
