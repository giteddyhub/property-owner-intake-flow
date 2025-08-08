
import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  action: () => void;
}

export const useKeyboardShortcuts = (isAdminPage: boolean = false) => {
  const navigate = useNavigate();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'd',
      altKey: true,
      description: 'Go to Dashboard',
      action: () => navigate('/admin')
    },
    {
      key: 'a',
      altKey: true,
      description: 'Go to Accounts',
      action: () => navigate('/admin/accounts')
    },
    {
      key: 's',
      altKey: true,
      description: 'Go to Settings',
      action: () => navigate('/admin/settings')
    },
    {
      key: 'r',
      ctrlKey: true,
      description: 'Refresh Page',
      action: () => window.location.reload()
    },
    {
      key: 'k',
      ctrlKey: true,
      description: 'Show Keyboard Shortcuts',
      action: () => {
        toast.info('Keyboard Shortcuts', {
          description: 'Alt+D: Dashboard, Alt+A: Accounts, Alt+S: Settings, Ctrl+R: Refresh',
          duration: 5000,
        });
      }
    }
  ];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isAdminPage) return;

    // Don't trigger shortcuts when user is typing in inputs
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement ||
      (event.target as HTMLElement)?.contentEditable === 'true'
    ) {
      return;
    }

    for (const shortcut of shortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey;
      const altMatches = !!shortcut.altKey === event.altKey;

      if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [isAdminPage, shortcuts]);

  useEffect(() => {
    if (isAdminPage) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, isAdminPage]);

  return { shortcuts };
};
