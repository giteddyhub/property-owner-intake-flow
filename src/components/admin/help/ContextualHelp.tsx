
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Keyboard, Info, Lightbulb } from 'lucide-react';

interface HelpItem {
  title: string;
  description: string;
  action?: string;
}

interface ContextualHelpProps {
  section: 'dashboard' | 'users' | 'accounts' | 'settings';
  className?: string;
}

const helpContent: Record<string, HelpItem[]> = {
  dashboard: [
    {
      title: 'System Overview',
      description: 'Monitor key metrics like user count, property registrations, and system health.',
      action: 'Click on any metric card to see detailed information.'
    },
    {
      title: 'Real-time Updates',
      description: 'Data refreshes automatically every 30 seconds to show the latest information.',
      action: 'Use the refresh button to manually update data.'
    },
    {
      title: 'Interactive Charts',
      description: 'Click on chart elements to drill down into specific data points.',
      action: 'Hover over charts to see detailed tooltips.'
    }
  ],
  users: [
    {
      title: 'User Management',
      description: 'View, filter, and manage all user accounts in the system.',
      action: 'Use the search and filter options to find specific users.'
    },
    {
      title: 'Advanced Filtering',
      description: 'Filter users by status, registration date, activity level, and more.',
      action: 'Combine multiple filters for precise user selection.'
    },
    {
      title: 'Bulk Actions',
      description: 'Select multiple users to perform bulk operations like status changes.',
      action: 'Use checkboxes to select users and choose from available actions.'
    }
  ],
  accounts: [
    {
      title: 'Account Overview',
      description: 'Comprehensive view of user accounts including properties, submissions, and payments.',
      action: 'Click on account cards to see detailed information.'
    },
    {
      title: 'Account Details',
      description: 'View complete account information including related properties and submissions.',
      action: 'Use tabs to navigate between different account sections.'
    }
  ],
  settings: [
    {
      title: 'System Configuration',
      description: 'Manage system-wide settings and administrator preferences.',
      action: 'Changes are saved automatically or require confirmation.'
    },
    {
      title: 'Admin Management',
      description: 'Create and manage administrator accounts with different permission levels.',
      action: 'Be careful when modifying admin permissions.'
    }
  ]
};

const keyboardShortcuts = [
  { key: 'Alt + D', action: 'Go to Dashboard' },
  { key: 'Alt + U', action: 'Go to Users' },
  { key: 'Alt + A', action: 'Go to Accounts' },
  { key: 'Alt + S', action: 'Go to Settings' },
  { key: 'Ctrl + R', action: 'Refresh Page' },
  { key: 'Ctrl + K', action: 'Show Shortcuts' }
];

export const ContextualHelp: React.FC<ContextualHelpProps> = ({ 
  section, 
  className = '' 
}) => {
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const helpItems = helpContent[section] || [];

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 ${className}`}>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Get help with this section</p>
                </TooltipContent>
              </Tooltip>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  {section.charAt(0).toUpperCase() + section.slice(1)} Help
                </CardTitle>
                <CardDescription>
                  Tips and guidance for this section
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {helpItems.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Lightbulb className="h-3 w-3 text-yellow-500" />
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                    {item.action && (
                      <p className="text-xs text-primary font-medium">
                        💡 {item.action}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>

        <Popover open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Tooltip>
                <TooltipTrigger>
                  <Keyboard className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Keyboard shortcuts</p>
                </TooltipContent>
              </Tooltip>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="end">
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Keyboard className="h-4 w-4" />
                  Keyboard Shortcuts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {keyboardShortcuts.map((shortcut, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">
                        {shortcut.key}
                      </kbd>
                      <span className="text-muted-foreground">{shortcut.action}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  );
};
