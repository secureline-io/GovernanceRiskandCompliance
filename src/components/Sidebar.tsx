'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
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
  Eye,
  UserCheck,
  GraduationCap,
  Key,
  Box,
  TrendingUp,
  Cog,
  Link2,
  BarChart3
} from 'lucide-react';

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
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>(['compliance', 'risk']);

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
      id: 'tests',
      label: 'Tests',
      icon: <CheckSquare className="w-5 h-5" />,
      href: '/tests'
    },
    {
      id: 'compliance',
      label: 'Compliance',
      icon: <Shield className="w-5 h-5" />,
      items: [
        { id: 'frameworks', label: 'Frameworks', href: '/compliance', icon: <BookOpen className="w-4 h-4" /> },
        { id: 'controls', label: 'Controls', href: '/controls', icon: <ClipboardList className="w-4 h-4" /> },
        { id: 'policies', label: 'Policies', href: '/policies', icon: <FileText className="w-4 h-4" /> },
        { id: 'evidence-tasks', label: 'Evidence Tasks', href: '/evidence', icon: <FolderOpen className="w-4 h-4" /> },
        { id: 'cloud', label: 'Cloud', href: '/cspm', icon: <Cloud className="w-4 h-4" /> },
        { id: 'vault', label: 'Vault', href: '/vault', icon: <Lock className="w-4 h-4" /> },
      ]
    },
    {
      id: 'risk',
      label: 'Risk',
      icon: <AlertTriangle className="w-5 h-5" />,
      items: [
        { id: 'vendors', label: 'Vendors', href: '/vendors', icon: <Building2 className="w-4 h-4" /> },
        { id: 'risk-management', label: 'Risk Management', href: '/risks', icon: <Target className="w-4 h-4" /> },
      ]
    },
    {
      id: 'trust',
      label: 'Trust',
      icon: <Eye className="w-5 h-5" />,
      items: [
        { id: 'trust-vault', label: 'Trust Vault', href: '/trust-vault', icon: <Lock className="w-4 h-4" /> },
      ]
    },
    {
      id: 'audit',
      label: 'Audit',
      icon: <ClipboardList className="w-5 h-5" />,
      items: [
        { id: 'audit-center', label: 'Audit Center', href: '/audit', icon: <Target className="w-4 h-4" /> },
        { id: 'corrective-action', label: 'Corrective Action', href: '/corrective-action', icon: <CheckSquare className="w-4 h-4" /> },
      ]
    },
    {
      id: 'people',
      label: 'People',
      icon: <Users className="w-5 h-5" />,
      items: [
        { id: 'employees', label: 'Employees', href: '/employees', icon: <UserCheck className="w-4 h-4" /> },
        { id: 'training', label: 'Training Campaigns', href: '/training', icon: <GraduationCap className="w-4 h-4" /> },
        { id: 'access', label: 'Access', href: '/access', icon: <Key className="w-4 h-4" /> },
      ]
    },
    {
      id: 'assets',
      label: 'Asset Management',
      icon: <Box className="w-5 h-5" />,
      href: '/assets'
    },
    {
      id: 'updates',
      label: 'Product Updates',
      icon: <TrendingUp className="w-5 h-5" />,
      href: '/updates'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Cog className="w-5 h-5" />,
      href: '/settings'
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: <Link2 className="w-5 h-5" />,
      href: '/integrations'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChart3 className="w-5 h-5" />,
      href: '/reports'
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

  if (!isOpen) {
    return (
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-2">
        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-white" />
        </div>
        {navSections.slice(0, 8).map((section) => (
          <Link
            key={section.id}
            href={section.href || section.items?.[0]?.href || '#'}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              isActiveSectionItem(section)
                ? 'bg-teal-50 text-teal-600'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            title={section.label}
          >
            {section.icon}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-gray-100">
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Scrut</h1>
            <p className="text-xs text-gray-500">Automation</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navSections.map((section) => (
          <div key={section.id}>
            {section.items ? (
              // Collapsible section
              <>
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                    isActiveSectionItem(section)
                      ? 'text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={isActiveSectionItem(section) ? 'text-teal-600' : ''}>
                      {section.icon}
                    </span>
                    <span className="font-medium text-sm">{section.label}</span>
                  </div>
                  {expandedSections.includes(section.id) ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {expandedSections.includes(section.id) && (
                  <div className="ml-4 mt-1 space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActiveLink(item.href)
                            ? 'bg-teal-50 text-teal-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {item.icon && <span className="text-gray-400">{item.icon}</span>}
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              // Single link
              <Link
                href={section.href || '#'}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActiveLink(section.href || '')
                    ? 'bg-teal-50 text-teal-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className={isActiveLink(section.href || '') ? 'text-teal-600' : ''}>
                  {section.icon}
                </span>
                <span className="text-sm font-medium">{section.label}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            SG
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Subham Gupta</p>
            <p className="text-xs text-gray-500 truncate">Security Admin</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
