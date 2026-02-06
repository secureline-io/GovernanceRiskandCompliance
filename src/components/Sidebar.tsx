'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Shield,
  FileText,
  FolderOpen,
  Cloud,
  Lock,
  AlertTriangle,
  Users,
  Building2,
  ChevronDown,
  ChevronRight,
  Settings,
  BookOpen,
  ClipboardList,
  Target,
  UserCheck,
  GraduationCap,
  Key,
  Box,
  ChevronsLeft,
  ChevronsRight,
  Link2,
  BarChart3,
  AlertOctagon,
  CheckSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentView?: string;
  setCurrentView?: (view: string) => void;
  isOpen: boolean;
  setIsOpen?: (open: boolean) => void;
}

interface NavSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  items?: NavItem[];
  href?: string;
  badge?: number;
  divider?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'compliance',
    'risk',
    'governance',
    'security',
    'organization'
  ]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const navSections: NavSection[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: '/'
    },
    {
      id: 'compliance',
      label: 'Compliance',
      icon: <Shield className="w-5 h-5" />,
      items: [
        { id: 'frameworks', label: 'Frameworks', href: '/compliance', icon: <BookOpen className="w-4 h-4" /> },
        { id: 'controls', label: 'Controls', href: '/controls', icon: <ClipboardList className="w-4 h-4" /> },
        { id: 'evidence', label: 'Evidence', href: '/evidence', icon: <FolderOpen className="w-4 h-4" /> },
        { id: 'cloud', label: 'Cloud Security', href: '/cspm', icon: <Cloud className="w-4 h-4" /> },
      ]
    },
    {
      id: 'risk',
      label: 'Risk Management',
      icon: <AlertTriangle className="w-5 h-5" />,
      items: [
        { id: 'risk-register', label: 'Risk Register', href: '/risks', icon: <Target className="w-4 h-4" /> },
        { id: 'vendors', label: 'Vendors', href: '/vendors', icon: <Building2 className="w-4 h-4" /> },
      ]
    },
    {
      id: 'governance',
      label: 'Governance',
      icon: <ClipboardList className="w-5 h-5" />,
      items: [
        { id: 'policies', label: 'Policies', href: '/policies', icon: <FileText className="w-4 h-4" /> },
        { id: 'audits', label: 'Audits', href: '/audits', icon: <Target className="w-4 h-4" /> },
        { id: 'corrective-action', label: 'Corrective Actions', href: '/corrective-action', icon: <CheckSquare className="w-4 h-4" /> },
      ]
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Lock className="w-5 h-5" />,
      items: [
        { id: 'incidents', label: 'Incidents', href: '/incidents', icon: <AlertOctagon className="w-4 h-4" /> },
        { id: 'access', label: 'Access Control', href: '/access', icon: <Key className="w-4 h-4" /> },
        { id: 'vault', label: 'Vault', href: '/vault', icon: <Lock className="w-4 h-4" /> },
      ]
    },
    {
      id: 'organization',
      label: 'Organization',
      icon: <Users className="w-5 h-5" />,
      items: [
        { id: 'employees', label: 'Employees', href: '/employees', icon: <UserCheck className="w-4 h-4" /> },
        { id: 'training', label: 'Training', href: '/training', icon: <GraduationCap className="w-4 h-4" /> },
        { id: 'assets', label: 'Assets', href: '/assets', icon: <Box className="w-4 h-4" /> },
      ]
    },
    {
      id: 'divider-1',
      label: '',
      icon: <></>,
      divider: true
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChart3 className="w-5 h-5" />,
      href: '/reports'
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: <Link2 className="w-5 h-5" />,
      href: '/integrations'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      href: '/settings'
    },
  ];

  const isActiveLink = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const isActiveSectionItem = (section: NavSection) => {
    if (section.href) return isActiveLink(section.href);
    return section.items?.some(item => isActiveLink(item.href));
  };

  // Collapsed sidebar
  if (!isOpen) {
    return (
      <div className="w-[72px] bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center py-4 border-r border-slate-800 transition-all duration-300 h-full">
        {/* Logo */}
        <div className="mb-8">
          <Link
            href="/"
            className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-500 rounded-full flex items-center justify-center hover:shadow-lg hover:shadow-sky-500/50 transition-all duration-300"
            title="Scrut"
          >
            <Shield className="w-6 h-6 text-white" />
          </Link>
        </div>

        {/* Navigation Icons */}
        <nav className="flex-1 space-y-3 flex flex-col items-center">
          {navSections
            .filter(section => !section.divider)
            .slice(0, 6)
            .map((section) => {
              const href = section.href || section.items?.[0]?.href || '#';
              const isActive = isActiveSectionItem(section);

              return (
                <Link
                  key={section.id}
                  href={href}
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300',
                    isActive
                      ? 'bg-sky-500/20 text-sky-400 shadow-lg shadow-sky-500/20'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-300'
                  )}
                  title={section.label}
                >
                  {section.icon}
                </Link>
              );
            })}
        </nav>

        {/* Bottom actions */}
        <div className="space-y-3 flex flex-col items-center">
          {/* Collapse button */}
          <button
            onClick={() => setIsOpen?.(true)}
            className="w-10 h-10 rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-300 flex items-center justify-center transition-all duration-300"
            title="Expand sidebar"
          >
            <ChevronsRight className="w-5 h-5" />
          </button>

          {/* User Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-xs hover:shadow-lg hover:shadow-sky-500/20 transition-all duration-300 cursor-pointer"
            title="Ashish M">
            AM
          </div>
        </div>
      </div>
    );
  }

  // Expanded sidebar
  return (
    <div className="w-[260px] bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col h-full border-r border-slate-800 transition-all duration-300">
      {/* Logo */}
      <div className="px-4 py-6 border-b border-slate-800/50">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-500 rounded-full flex items-center justify-center group-hover:shadow-lg group-hover:shadow-sky-500/50 transition-all duration-300">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Scrut</h1>
            <p className="text-xs text-slate-400">GRC Platform</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {navSections.map((section) => {
          // Divider
          if (section.divider) {
            return (
              <div key={section.id} className="my-4 border-t border-slate-800/50" />
            );
          }

          // Collapsible section with items
          if (section.items) {
            const isExpanded = expandedSections.includes(section.id);
            const isActive = isActiveSectionItem(section);

            return (
              <div key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-slate-800/50 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-300'
                  )}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <span className={cn(
                      'transition-colors duration-200',
                      isActive ? 'text-sky-400' : ''
                    )}>
                      {section.icon}
                    </span>
                    <span className="font-medium text-sm">{section.label}</span>
                    {section.badge && (
                      <span className="ml-auto text-xs bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full font-semibold">
                        {section.badge}
                      </span>
                    )}
                  </div>
                  <div className={cn(
                    'transition-transform duration-300',
                    isExpanded ? 'rotate-180' : ''
                  )}>
                    <ChevronDown className={cn(
                      'w-4 h-4',
                      isActive ? 'text-sky-400' : 'text-slate-600'
                    )} />
                  </div>
                </button>

                {/* Expanded items */}
                {isExpanded && (
                  <div className="mt-2 ml-0 space-y-1 animate-in fade-in duration-200">
                    {section.items.map((item) => {
                      const itemActive = isActiveLink(item.href);

                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          className={cn(
                            'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 relative',
                            itemActive
                              ? 'text-white font-medium'
                              : 'text-slate-400 hover:text-slate-300 hover:bg-white/5'
                          )}
                        >
                          {itemActive && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500 rounded-r-full" />
                          )}
                          <div className={cn(
                            'ml-1 transition-colors duration-200',
                            itemActive ? 'text-sky-400' : ''
                          )}>
                            {item.icon}
                          </div>
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Single link item
          const isActive = isActiveLink(section.href || '');

          return (
            <Link
              key={section.id}
              href={section.href || '#'}
              className={cn(
                'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group',
                isActive
                  ? 'text-white font-medium'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-white/5'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500 rounded-r-full" />
              )}
              <span className={cn(
                'transition-colors duration-200',
                isActive ? 'text-sky-400' : ''
              )}>
                {section.icon}
              </span>
              <span className="text-sm font-medium">{section.label}</span>
              {section.badge && (
                <span className="ml-auto text-xs bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full font-semibold">
                  {section.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse button + User Profile */}
      <div className="border-t border-slate-800/50 px-3 py-4 space-y-3">
        {/* Collapse button */}
        <button
          onClick={() => setIsOpen?.(false)}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-300 hover:bg-white/5 transition-all duration-200"
          title="Collapse sidebar"
        >
          <ChevronsLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Collapse</span>
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all duration-200 cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 group-hover:shadow-lg group-hover:shadow-sky-500/20 transition-all duration-300 relative">
            AM
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-slate-900" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Ashish M</p>
            <p className="text-xs text-slate-400 truncate">Security Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
