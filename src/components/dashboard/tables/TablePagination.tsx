
import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TablePaginationProps {
  itemCount: number;
  itemLabel: string;
}

export const TablePagination: React.FC<TablePaginationProps> = ({ itemCount, itemLabel }) => {
  if (itemCount === 0) return null;

  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <div className="text-gray-500">
        Showing {Math.min(itemCount, 5)} of {itemCount} {itemLabel}
      </div>
      <div className="flex space-x-1">
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-blue-50 border-blue-200 text-blue-700">
          1
        </Button>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
