
import React from 'react';
import { Download, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from './SearchInput';
import { useDataExport } from '@/hooks/useDataExport';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DataTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  onRefresh: () => void;
  isAutoRefreshing: boolean;
  onToggleAutoRefresh: () => void;
  exportData?: any[];
  exportFilename?: string;
  isRefreshing?: boolean;
}

export const DataTableToolbar: React.FC<DataTableToolbarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  onRefresh,
  isAutoRefreshing,
  onToggleAutoRefresh,
  exportData = [],
  exportFilename = 'data',
  isRefreshing = false
}) => {
  const { isExporting, exportToCSV, exportToJSON } = useDataExport();

  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-2 flex-1">
        <SearchInput
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className="max-w-sm"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleAutoRefresh}
          className={isAutoRefreshing ? 'bg-green-50 border-green-200' : ''}
        >
          {isAutoRefreshing ? (
            <ToggleRight className="h-4 w-4 text-green-600" />
          ) : (
            <ToggleLeft className="h-4 w-4 text-gray-400" />
          )}
          Auto-refresh
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        
        {exportData.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isExporting}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => exportToCSV(exportData, exportFilename)}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToJSON(exportData, exportFilename)}>
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};
