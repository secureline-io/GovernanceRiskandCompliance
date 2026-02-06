'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { SearchModal } from './SearchModal';
import {
  Search,
  Bell,
  Menu,
  Command,
  X,
  Shield,
  AlertTriangle,
  FileText,
  Building2,
  FolderOpen,
  Target,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronsUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'control' | 'risk' | 'policy' | 'vendor' | 'evidence' | 'framework';
  href: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success' | 'error';
  time: string;
  read: boolean;
}

const typeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  control: { icon: <Shield className="w-4 h-4" />, color: 'text-sky-600', bg: 'bg-sky-50' },
  risk: { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-amber-600', bg: 'bg-amber-50' },
  policy: { icon: <FileText className="w-4 h-4" />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  vendor: { icon: <Building2 className="w-4 h-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  evidence: { icon: <FolderOpen className="w-4 h-4" />, color: 'text-violet-600', bg: 'bg-violet-50' },
  framework: { icon: <Target className="w-4 h-4" />, color: 'text-rose-600', bg: 'bg-rose-50' },
};

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const { profile, currentOrg, orgs, switchOrg, signOut, isSuperAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [orgSwitcherOpen, setOrgSwitcherOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const orgRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const orgId = currentOrg?.org_id || 'default';
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';
  const displayName = profile?.full_name || 'User';
  const displayRole = isSuperAdmin
    ? 'Super Admin'
    : currentOrg?.role
      ? currentOrg.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
      : 'User';

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (orgRef.current && !orgRef.current.contains(e.target as Node)) setOrgSwitcherOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Cmd+K keyboard shortcut - opens global search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchModalOpen(false);
        setNotifOpen(false);
        setUserMenuOpen(false);
        setOrgSwitcherOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load notifications on mount
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await fetch(`/api/dashboard?org_id=${orgId}`);
        if (res.ok) {
          const data = await res.json();
          const notifs: Notification[] = [];
          if (data.open_risks > 0) notifs.push({ id: '1', title: 'Open Risks', message: `${data.open_risks} risks require attention`, type: 'warning', time: 'Now', read: false });
          if (data.pending_tasks > 0) notifs.push({ id: '2', title: 'Pending Tasks', message: `${data.pending_tasks} tasks are overdue`, type: 'error', time: 'Today', read: false });
          if (data.total_evidence > 0) notifs.push({ id: '3', title: 'Evidence Collected', message: `${data.total_evidence} evidence items tracked`, type: 'success', time: 'Today', read: true });
          if (data.total_vendors > 0) notifs.push({ id: '4', title: 'Vendor Reviews', message: `${data.vendors_needing_review || 0} vendors need assessment`, type: 'info', time: 'This week', read: false });
          setNotifications(notifs.length > 0 ? notifs : [
            { id: '1', title: 'Welcome', message: 'Set up your first framework to get started', type: 'info', time: 'Now', read: false }
          ]);
        }
      } catch {
        setNotifications([
          { id: '1', title: 'Platform Ready', message: 'Configure your compliance frameworks to begin', type: 'info', time: 'Now', read: false }
        ]);
      }
    };
    loadNotifications();
  }, [orgId]);

  // Debounced search
  const performSearch = useCallback(async (query: string) => {
    if (query.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    const results: SearchResult[] = [];
    try {
      const endpoints = [
        { url: `/api/controls?org_id=${orgId}`, type: 'control' as const, href: '/controls', titleKey: 'name', subtitleKey: 'code' },
        { url: `/api/risks?org_id=${orgId}`, type: 'risk' as const, href: '/risks', titleKey: 'title', subtitleKey: 'category' },
        { url: `/api/policies?org_id=${orgId}`, type: 'policy' as const, href: '/policies', titleKey: 'title', subtitleKey: 'status' },
        { url: `/api/vendors?org_id=${orgId}`, type: 'vendor' as const, href: '/vendors', titleKey: 'name', subtitleKey: 'industry' },
        { url: `/api/evidence?org_id=${orgId}`, type: 'evidence' as const, href: '/evidence', titleKey: 'title', subtitleKey: 'source' },
      ];
      const responses = await Promise.allSettled(endpoints.map(ep => fetch(ep.url).then(r => r.json())));
      responses.forEach((res, i) => {
        if (res.status === 'fulfilled') {
          const items = res.value.data || res.value || [];
          const ep = endpoints[i];
          if (Array.isArray(items)) {
            items
              .filter((item: Record<string, string>) => {
                const searchable = `${item[ep.titleKey] || ''} ${item[ep.subtitleKey] || ''} ${item.description || ''}`.toLowerCase();
                return searchable.includes(query.toLowerCase());
              })
              .slice(0, 3)
              .forEach((item: Record<string, string>) => {
                results.push({
                  id: item.id || Math.random().toString(),
                  title: item[ep.titleKey] || 'Untitled',
                  subtitle: `${ep.type.charAt(0).toUpperCase() + ep.type.slice(1)} · ${item[ep.subtitleKey] || ''}`,
                  type: ep.type,
                  href: ep.href,
                });
              });
          }
        }
      });
    } catch { /* silently fail */ }
    setSearchResults(results.slice(0, 8));
    setSearching(false);
  }, [orgId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) performSearch(searchQuery);
      else setSearchResults([]);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const notifTypeStyle: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    warning: { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-amber-500', bg: 'bg-amber-50' },
    error: { icon: <Clock className="w-4 h-4" />, color: 'text-red-500', bg: 'bg-red-50' },
    success: { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    info: { icon: <Bell className="w-4 h-4" />, color: 'text-sky-500', bg: 'bg-sky-50' },
  };

  return (
    <>
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Menu + Org Switcher + Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-200 active:scale-95"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>

        {/* Org Switcher (only if multiple orgs) */}
        {orgs.length > 1 && (
          <div ref={orgRef} className="relative">
            <button
              onClick={() => setOrgSwitcherOpen(!orgSwitcherOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-sm"
            >
              <Building2 className="w-4 h-4 text-slate-500" />
              <span className="text-slate-700 font-medium max-w-[150px] truncate">{currentOrg?.org_name || 'Select Org'}</span>
              <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {orgSwitcherOpen && (
              <div className="absolute top-full mt-2 left-0 w-64 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden animate-scaleIn z-50">
                <div className="px-3 py-2 border-b border-slate-100">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Organizations</span>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {orgs.map((org) => (
                    <button
                      key={org.org_id}
                      onClick={() => { switchOrg(org.org_id); setOrgSwitcherOpen(false); }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left',
                        currentOrg?.org_id === org.org_id && 'bg-sky-50'
                      )}
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                        {org.org_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{org.org_name}</p>
                        <p className="text-xs text-slate-400 capitalize">{org.role.replace('_', ' ')}</p>
                      </div>
                      {currentOrg?.org_id === org.org_id && (
                        <CheckCircle2 className="w-4 h-4 text-sky-500 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search */}
        <div ref={searchRef} className="relative">
          <button
            onClick={() => setSearchModalOpen(true)}
            className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-xl border transition-all duration-200 hover:bg-slate-50 hover:border-slate-300",
              "w-72 border-slate-200 bg-slate-50/80"
            )}
          >
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="text-sm text-slate-400 flex-1 text-left">Search...</span>
            <div className="flex items-center gap-1 text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded-md flex-shrink-0">
              <Command className="w-3 h-3" />
              <span className="text-[10px] font-medium">K</span>
            </div>
          </button>
        </div>
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
            className={cn(
              "relative p-2.5 rounded-xl transition-all duration-200 active:scale-95",
              notifOpen ? "bg-slate-100" : "hover:bg-slate-100"
            )}
          >
            <Bell className={cn("w-5 h-5", notifOpen ? "text-slate-800" : "text-slate-500")} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden animate-scaleIn z-50">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-sky-600 hover:text-sky-700 font-medium">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => {
                  const style = notifTypeStyle[notif.type];
                  return (
                    <div
                      key={notif.id}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 border-b border-slate-50 transition-colors hover:bg-slate-50/50",
                        !notif.read && "bg-sky-50/30"
                      )}
                    >
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", style.bg, style.color)}>
                        {style.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn("text-sm font-medium", notif.read ? "text-slate-600" : "text-slate-800")}>{notif.title}</p>
                          {!notif.read && <span className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
                <Link href="/settings" onClick={() => setNotifOpen(false)} className="text-xs text-sky-600 hover:text-sky-700 font-medium">
                  Notification Settings →
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-8 bg-slate-200 mx-1" />

        {/* User Menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all duration-200",
              userMenuOpen ? "bg-slate-100" : "hover:bg-slate-50"
            )}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-lg flex items-center justify-center text-white text-sm font-semibold shadow-sm">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-700 leading-tight">{displayName}</p>
              <p className="text-[11px] text-slate-400 leading-tight">{displayRole}</p>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200 hidden md:block", userMenuOpen && "rotate-180")} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden animate-scaleIn z-50">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">{displayName}</p>
                <p className="text-xs text-slate-500">{profile?.email || ''}</p>
              </div>
              <div className="py-1">
                <Link href="/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  <User className="w-4 h-4 text-slate-400" />
                  Profile Settings
                </Link>
                <Link href="/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  <Settings className="w-4 h-4 text-slate-400" />
                  Preferences
                </Link>
              </div>
              <div className="border-t border-slate-100 py-1">
                <button
                  onClick={() => { signOut(); setUserMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* Global Search Modal */}
    <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </>
  );
}
