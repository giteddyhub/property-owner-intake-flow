
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface ActionsToolbarProps {
  onRefresh?: () => void;
}

export const ActionsToolbar: React.FC<ActionsToolbarProps> = ({ onRefresh }) => {
  return (
    <div className="flex space-x-2">
      {onRefresh && (
        <Button variant="outline" onClick={onRefresh} size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      )}
    </div>
  );
};
