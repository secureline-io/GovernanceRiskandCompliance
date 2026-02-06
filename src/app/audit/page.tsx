import { ClipboardList, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuditCenterPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Center</h1>
        <p className="text-gray-500 text-sm mt-1">Centralized audit management</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-2xl font-bold">4</p><p className="text-sm text-gray-500">Active Audits</p></div><div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center"><ClipboardList className="w-6 h-6 text-blue-500" /></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-2xl font-bold">3</p><p className="text-sm text-gray-500">Scheduled</p></div><div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center"><Calendar className="w-6 h-6 text-orange-500" /></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-2xl font-bold">12</p><p className="text-sm text-gray-500">Completed</p></div><div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center"><CheckCircle className="w-6 h-6 text-green-500" /></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-2xl font-bold">2</p><p className="text-sm text-gray-500">Findings</p></div><div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center"><AlertCircle className="w-6 h-6 text-red-500" /></div></div></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Coming Soon</CardTitle></CardHeader><CardContent><div className="text-center py-12"><ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-semibold text-gray-900 mb-2">Audit Center</h3><p className="text-gray-500 max-w-md mx-auto">Manage audit requests and track fieldwork.</p></div></CardContent></Card>
    </div>
  );
}
