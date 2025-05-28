
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sun } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  return (
    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
      <Sun className="h-4 w-4" />
      <span className="sr-only">Light mode active</span>
    </Button>
  );
};
