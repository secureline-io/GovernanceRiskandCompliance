'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import {
  Search,
  FileText,
  Shield,
  BarChart3,
  Users,
  Settings,
  ChevronRight,
  X,
  Clock,
  AlertTriangle,
  FolderOpen,
  CheckCircle2,
  Target,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RecentModule {
  id: string;
  title: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

interface RecentDocument {
  id: string;
  title: string;
  type: 'policy' | 'evidence' | 'control' | 'risk';
  href: string;
  icon: React.ReactNode;
  color: string;
}

const recentModules: RecentModule[] = [
  { id: 'dashboard', title: 'Dashboard', icon: <BarChart3 className="w-5 h-5" />, href: '/dashboard', color: 'bg-sky-50 text-sky-600' },
  { id: 'tests', title: 'Tests', icon: <CheckCircle2 className="w-5 h-5" />, href: '/tests', color: 'bg-emerald-50 text-emerald-600' },
  { id: 'compliance', title: 'Compliance', icon: <Shield className="w-5 h-5" />, href: '/compliance', color: 'bg-indigo-50 text-indigo-600' },
  { id: 'risks', title: 'Risk Management', icon: <AlertTriangle className="w-5 h-5" />, href: '/risks', color: 'bg-amber-50 text-amber-600' },
  { id: 'policies', title: 'Policies', icon: <FileText className="w-5 h-5" />, href: '/policies', color: 'bg-purple-50 text-purple-600' },
  { id: 'controls', title: 'Controls', icon: <Target className="w-5 h-5" />, href: '/controls', color: 'bg-rose-50 text-rose-600' },
  { id: 'evidence', title: 'Evidence Tasks', icon: <FolderOpen className="w-5 h-5" />, href: '/evidence', color: 'bg-violet-50 text-violet-600' },
  { id: 'audits', title: 'Audits', icon: <Users className="w-5 h-5" />, href: '/audits', color: 'bg-teal-50 text-teal-600' },
  { id: 'vendors', title: 'Vendors', icon: <Building2 className="w-5 h-5" />, href: '/vendors', color: 'bg-cyan-50 text-cyan-600' },
  { id: 'settings', title: 'Settings', icon: <Settings className="w-5 h-5" />, href: '/settings', color: 'bg-slate-50 text-slate-600' },
];

const recentDocuments: RecentDocument[] = [
  {
    id: 'doc-1',
    title: 'Data Protection Policy 2024',
    type: 'policy',
    href: '/policies/data-protection',
    icon: <FileText className="w-4 h-4" />,
    color: 'bg-purple-50 text-purple-600',
  },
  {
    id: 'doc-2',
    title: 'SOC 2 Type II Evidence',
    type: 'evidence',
    href: '/evidence/soc2-evidence',
    icon: <FolderOpen className="w-4 h-4" />,
    color: 'bg-violet-50 text-violet-600',
  },
  {
    id: 'doc-3',
    title: 'Access Control Framework',
    type: 'control',
    href: '/controls/access-control',
    icon: <Shield className="w-4 h-4" />,
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    id: 'doc-4',
    title: 'Third-Party Risk Assessment',
    type: 'evidence',
    href: '/evidence/vendor-risk',
    icon: <FolderOpen className="w-4 h-4" />,
    color: 'bg-violet-50 text-violet-600',
  },
  {
    id: 'doc-5',
    title: 'Incident Response Policy',
    type: 'policy',
    href: '/policies/incident-response',
    icon: <FileText className="w-4 h-4" />,
    color: 'bg-purple-50 text-purple-600',
  },
  {
    id: 'doc-6',
    title: 'Network Security Controls',
    type: 'control',
    href: '/controls/network-security',
    icon: <Shield className="w-4 h-4" />,
    color: 'bg-indigo-50 text-indigo-600',
  },
];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Filter results based on search query
  const filteredModules = searchQuery
    ? recentModules.filter((m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : recentModules.slice(0, 6);

  const filteredDocuments = searchQuery
    ? recentDocuments.filter((d) =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : recentDocuments;

  const allResults = [...filteredModules, ...filteredDocuments];

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
      setSelectedIndex(-1);
      setSearchQuery('');
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < allResults.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && allResults[selectedIndex]) {
          const item = allResults[selectedIndex];
          router.push(item.href);
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, allResults, router, onClose]);

  // Close modal on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20"
      onClick={handleBackdropClick}
    >
      {/* Backdrop blur */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Search Input */}
        <div className="border-b border-slate-200 px-6 py-4 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            placeholder="Search for anything..."
            className="flex-1 bg-transparent border-none outline-none text-base text-slate-900 placeholder-slate-500"
          />
          <div className="flex items-center gap-2 text-slate-400 bg-slate-200/40 px-2 py-1 rounded-lg flex-shrink-0">
            <kbd className="text-xs font-semibold">⌘K</kbd>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {allResults.length > 0 ? (
            <>
              {/* Recent Modules Section */}
              {filteredModules.length > 0 && (
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                    Recent Modules
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {filteredModules.map((module, idx) => {
                      const itemIndex = idx;
                      const isSelected = selectedIndex === itemIndex;
                      return (
                        <button
                          key={module.id}
                          onClick={() => {
                            router.push(module.href);
                            onClose();
                          }}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left',
                            isSelected
                              ? 'bg-sky-50 border border-sky-200'
                              : 'bg-slate-50 border border-slate-100 hover:bg-slate-100'
                          )}
                        >
                          <div className={cn('p-2 rounded-lg', module.color)}>
                            {module.icon}
                          </div>
                          <span className="text-sm font-medium text-slate-700 truncate">
                            {module.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent Documents Section */}
              {filteredDocuments.length > 0 && (
                <div className="px-6 py-4">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                    Recent Documents
                  </h3>
                  <div className="space-y-2">
                    {filteredDocuments.map((doc, idx) => {
                      const itemIndex = filteredModules.length + idx;
                      const isSelected = selectedIndex === itemIndex;
                      return (
                        <button
                          key={doc.id}
                          onClick={() => {
                            router.push(doc.href);
                            onClose();
                          }}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left',
                            isSelected
                              ? 'bg-sky-50 border border-sky-200'
                              : 'bg-slate-50 border border-transparent hover:bg-slate-100'
                          )}
                        >
                          <div className={cn('p-2 rounded-lg flex-shrink-0', doc.color)}>
                            {doc.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">
                              {doc.title}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="px-6 py-12 text-center">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600 mb-1">
                No results found
              </p>
              <p className="text-xs text-slate-400">
                Try searching for modules or documents
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-3 bg-slate-50/50">
          <p className="text-xs text-slate-500">
            Results are retrieved from Policies and Evidences
          </p>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
}
