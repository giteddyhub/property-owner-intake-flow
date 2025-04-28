
import React from 'react';
import { Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ActionsToolbar: React.FC = () => {
  return (
    <div className="flex space-x-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="text-gray-600 border border-gray-200 hover:bg-gray-50"
      >
        <Filter className="h-4 w-4 mr-1" /> Filter
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="text-gray-600 border border-gray-200 hover:bg-gray-50"
      >
        <Download className="h-4 w-4 mr-1" /> Export
      </Button>
    </div>
  );
};
