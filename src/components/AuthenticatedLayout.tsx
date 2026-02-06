'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import AppShell from './AppShell';
import { Shield, Loader2 } from 'lucide-react';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const pathname = usePathname();
  const { loading } = useAuth();

  // Public routes that don't need AppShell
  const publicRoutes = ['/login', '/auth/callback'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Show loading screen while auth is initializing
  if (loading && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl shadow-lg shadow-sky-500/20 mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading Secureline...</span>
          </div>
        </div>
      </div>
    );
  }

  // Public routes don't get the AppShell wrapper
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Authenticated routes get the full AppShell
  return <AppShell>{children}</AppShell>;
}
