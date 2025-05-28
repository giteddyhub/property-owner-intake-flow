
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserFiltersToolbarProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  selectedUsers: string[];
  onBulkAction: (action: string) => void;
  onExportUsers: () => void;
}

export const UserFiltersToolbar: React.FC<UserFiltersToolbarProps> = ({
  showFilters,
  setShowFilters,
  selectedUsers,
  onBulkAction,
  onExportUsers
}) => {
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2"
      >
        <Filter className="h-4 w-4" />
        {showFilters ? 'Hide' : 'Show'} Advanced Filters
      </Button>

      <div className="flex items-center gap-2">
        {selectedUsers.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Bulk Actions ({selectedUsers.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onBulkAction('Export')}>
                Export Selected
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkAction('Disable')}>
                Disable Accounts
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkAction('Enable')}>
                Enable Accounts
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button variant="outline" onClick={onExportUsers}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  );
};
