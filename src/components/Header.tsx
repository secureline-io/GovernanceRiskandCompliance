'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
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
  ExternalLink
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

const DEFAULT_ORG_ID = 'default';

const typeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  control: { icon: <Shield className="w-4 h-4" />, color: 'text-sky-600', bg: 'bg-sky-50' },
  risk: { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-amber-600', bg: 'bg-amber-50' },
  policy: { icon: <FileText className="w-4 h-4" />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  vendor: { icon: <Building2 className="w-4 h-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  evidence: { icon: <FolderOpen className="w-4 h-4" />, color: 'text-violet-600', bg: 'bg-violet-50' },
  framework: { icon: <Target className="w-4 h-4" />, color: 'text-rose-600', bg: 'bg-rose-50' },
};

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotifOpen(false);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load notifications on mount
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await fetch(`/api/dashboard?org_id=${DEFAULT_ORG_ID}`);
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
  }, []);

  // Debounced search
  const performSearch = useCallback(async (query: string) => {
    if (query.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    const results: SearchResult[] = [];
    try {
      const endpoints = [
        { url: `/api/controls?org_id=${DEFAULT_ORG_ID}`, type: 'control' as const, href: '/controls', titleKey: 'name', subtitleKey: 'code' },
        { url: `/api/risks?org_id=${DEFAULT_ORG_ID}`, type: 'risk' as const, href: '/risks', titleKey: 'title', subtitleKey: 'category' },
        { url: `/api/policies?org_id=${DEFAULT_ORG_ID}`, type: 'policy' as const, href: '/policies', titleKey: 'title', subtitleKey: 'status' },
        { url: `/api/vendors?org_id=${DEFAULT_ORG_ID}`, type: 'vendor' as const, href: '/vendors', titleKey: 'name', subtitleKey: 'industry' },
        { url: `/api/evidence?org_id=${DEFAULT_ORG_ID}`, type: 'evidence' as const, href: '/evidence', titleKey: 'title', subtitleKey: 'source' },
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
  }, []);

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
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Menu + Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-200 active:scale-95"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>

        {/* Search */}
        <div ref={searchRef} className="relative">
          <button
            onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 100); }}
            className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-xl border transition-all duration-200",
              searchOpen
                ? "w-96 border-sky-300 bg-white shadow-lg shadow-sky-500/10"
                : "w-72 border-slate-200 bg-slate-50/80 hover:bg-slate-100 hover:border-slate-300"
            )}
          >
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            {searchOpen ? (
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search controls, risks, policies..."
                className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 flex-1 w-full"
                autoFocus
              />
            ) : (
              <span className="text-sm text-slate-400 flex-1 text-left">Search...</span>
            )}
            <div className="flex items-center gap-1 text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded-md flex-shrink-0">
              <Command className="w-3 h-3" />
              <span className="text-[10px] font-medium">K</span>
            </div>
            {searchOpen && searchQuery && (
              <button onClick={(e) => { e.stopPropagation(); setSearchQuery(''); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </button>

          {/* Search Results Dropdown */}
          {searchOpen && (searchQuery.length >= 2) && (
            <div className="absolute top-full mt-2 w-96 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden animate-scaleIn z-50">
              {searching ? (
                <div className="p-4 flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-slate-500">Searching...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-80 overflow-y-auto">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{searchResults.length} results</span>
                  </div>
                  {searchResults.map((result) => {
                    const config = typeConfig[result.type];
                    return (
                      <Link
                        key={result.id}
                        href={result.href}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors"
                      >
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", config.bg, config.color)}>
                          {config.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{result.title}</p>
                          <p className="text-xs text-slate-400 truncate">{result.subtitle}</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No results for &quot;{searchQuery}&quot;</p>
                  <p className="text-xs text-slate-400 mt-1">Try searching by name, code, or description</p>
                </div>
              )}
            </div>
          )}
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

        {/* Divider */}
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
              AM
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-700 leading-tight">Ashish M</p>
              <p className="text-[11px] text-slate-400 leading-tight">Admin</p>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200 hidden md:block", userMenuOpen && "rotate-180")} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden animate-scaleIn z-50">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">Ashish M</p>
                <p className="text-xs text-slate-500">imashishmathur@gmail.com</p>
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
                <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left" disabled>
                  <LogOut className="w-4 h-4" />
                  Sign Out
                  <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded ml-auto text-slate-400">Auth Required</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
