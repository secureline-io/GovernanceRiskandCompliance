'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  X,
  Rocket
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  link: string;
  completed: boolean;
}

const INITIAL_CHECKLIST_ITEMS = [
  {
    id: 'framework',
    title: 'Configure your first framework',
    description: 'Set up SOC 2, ISO 27001, or another compliance framework',
    link: '/compliance'
  },
  {
    id: 'controls',
    title: 'Add controls to your library',
    description: 'Define the security controls your organization implements',
    link: '/controls'
  },
  {
    id: 'evidence',
    title: 'Upload initial evidence',
    description: 'Upload documents, screenshots, or automated evidence',
    link: '/evidence'
  },
  {
    id: 'policies',
    title: 'Create your first policy',
    description: 'Draft and publish a security or privacy policy',
    link: '/policies'
  },
  {
    id: 'vendors',
    title: 'Register your vendors',
    description: 'Add third-party vendors and assess their risk levels',
    link: '/vendors'
  },
  {
    id: 'risks',
    title: 'Set up risk register',
    description: 'Identify and score organizational risks',
    link: '/risks'
  },
  {
    id: 'integrations',
    title: 'Configure integrations',
    description: 'Connect AWS, Azure, GitHub, Slack for automated monitoring',
    link: '/integrations'
  }
];

const STORAGE_KEY = 'grc_onboarding_progress';
const DISMISS_KEY = 'grc_onboarding_dismissed';

export default function OnboardingChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage on client
  useEffect(() => {
    setIsLoading(true);

    // Check if dismissed
    const dismissed = localStorage.getItem(DISMISS_KEY) === 'true';
    setIsDismissed(dismissed);

    // Load progress
    const savedProgress = localStorage.getItem(STORAGE_KEY);
    const completedIds = savedProgress ? JSON.parse(savedProgress) : [];

    // Build checklist items with completion status
    const checklist: ChecklistItem[] = INITIAL_CHECKLIST_ITEMS.map(item => ({
      ...item,
      completed: completedIds.includes(item.id)
    }));

    setItems(checklist);
    setIsLoading(false);
  }, []);

  const handleToggleComplete = (itemId: string) => {
    const updated = items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setItems(updated);

    // Save to localStorage
    const completedIds = updated
      .filter(item => item.completed)
      .map(item => item.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedIds));
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(DISMISS_KEY, 'true');
  };

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (isLoading || isDismissed) {
    return null;
  }

  return (
    <div className="mb-6">
      <Card className="border-0 bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-50 shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="mt-1 p-2 rounded-lg bg-indigo-100">
                <Rocket className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg text-slate-900">
                  Getting Started
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Complete these setup steps to get the most out of your GRC platform
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1.5 hover:bg-white/50 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
              aria-label="Dismiss onboarding checklist"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">
                Progress
              </span>
              <span className="text-xs font-semibold text-indigo-600">
                {completedCount} of {totalCount} complete
              </span>
            </div>
            <div className="h-2 bg-white/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </CardHeader>

        {/* Expandable Content */}
        <CardContent className={cn(
          'overflow-hidden transition-all duration-300',
          isExpanded ? 'block' : 'hidden'
        )}>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all duration-200',
                  item.completed
                    ? 'border-green-200 bg-green-50/50'
                    : 'border-slate-200 bg-white/70 hover:border-indigo-300 hover:bg-white'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(item.id)}
                    className="mt-1 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded transition-transform hover:scale-110"
                    aria-label={`Toggle ${item.title}`}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-300 hover:text-slate-400" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <Link href={item.link}>
                      <h4
                        className={cn(
                          'font-semibold text-sm cursor-pointer transition-colors',
                          item.completed
                            ? 'text-slate-500 line-through'
                            : 'text-slate-900 hover:text-indigo-600'
                        )}
                      >
                        {item.title}
                      </h4>
                    </Link>
                    <p className={cn(
                      'text-xs mt-1 line-clamp-2',
                      item.completed ? 'text-slate-400' : 'text-slate-600'
                    )}>
                      {item.description}
                    </p>
                  </div>

                  {/* Link Arrow */}
                  <Link
                    href={item.link}
                    className={cn(
                      'flex-shrink-0 mt-1 p-1.5 rounded transition-colors',
                      item.completed
                        ? 'text-slate-300'
                        : 'text-indigo-600 hover:bg-indigo-100'
                    )}
                    aria-label={`Go to ${item.title}`}
                  >
                    <ChevronDown className="h-4 w-4 rotate-90 -mr-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>

        {/* Footer with Toggle */}
        <div className="px-6 py-3 border-t border-slate-200/50 bg-white/30 flex items-center justify-between">
          <span className="text-xs text-slate-600 font-medium">
            {completedCount === totalCount
              ? '🎉 All tasks complete!'
              : `${totalCount - completedCount} task${totalCount - completedCount !== 1 ? 's' : ''} remaining`}
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-white/50 rounded transition-colors text-slate-600 hover:text-slate-900"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </Card>
    </div>
  );
}
