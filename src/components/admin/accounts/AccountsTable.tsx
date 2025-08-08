import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell,
  TableFooter
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AccountData } from '@/types/admin';
import { UserActionsDropdown } from '@/components/admin/users/UserActionsDropdown';
import { BulkUserActions } from '@/components/admin/users/BulkUserActions';
import { Mail, Home, Users as UsersIcon, AlertTriangle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AccountsTableProps {
  loading: boolean;
  currentItems: AccountData[];
  handleViewAccount: (accountId: string) => void;
  currentPage: number;
  filteredAccounts: AccountData[];
  itemsPerPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  error?: string | null;
  diagnosticInfo?: any;
  onRefresh?: () => void;
  onShowUserOverview?: (userId: string, context?: { type: 'property' | 'owner' | 'assignment'; id: string }) => void;
}

export const AccountsTable: React.FC<AccountsTableProps> = ({
  loading,
  currentItems,
  handleViewAccount,
  currentPage,
  filteredAccounts,
  itemsPerPage,
  totalPages,
  setCurrentPage,
  error,
  diagnosticInfo,
  onRefresh,
  onShowUserOverview
}) => {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Calculate pagination values
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, filteredAccounts.length);

  // Handle previous page
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle next page
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle user deletion - refresh the data
  const handleUserDeleted = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  // Handle bulk action completion
  const handleBulkActionComplete = () => {
    setSelectedUserIds([]);
    if (onRefresh) {
      onRefresh();
    }
  };

  // Handle user selection
  const handleUserSelect = (userId: string, checked: boolean) => {
    setSelectedUserIds(prev => 
      checked 
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    );
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    setSelectedUserIds(checked ? currentItems.map(item => item.id) : []);
  };

  const isAllSelected = selectedUserIds.length === currentItems.length && currentItems.length > 0;
  const isPartiallySelected = selectedUserIds.length > 0 && selectedUserIds.length < currentItems.length;

  // Get selected users data for bulk operations
  const selectedUsers = currentItems.filter(item => selectedUserIds.includes(item.id))
    .map(item => ({
      id: item.id,
      email: item.email,
      full_name: item.full_name
    }));

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error loading accounts</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        
        {diagnosticInfo && Object.keys(diagnosticInfo).length > 0 && (
          <div className="mt-4 p-4 bg-muted/50 rounded-md">
            <h4 className="text-sm font-semibold mb-2">Diagnostic Information</h4>
            <div className="text-xs space-y-1">
              {diagnosticInfo.hasAuthSession !== undefined && (
                <div>Auth Session: {diagnosticInfo.hasAuthSession ? 'Yes' : 'No'}</div>
              )}
              {diagnosticInfo.profilesQueryStatus && (
                <div>Profiles Query Status: {diagnosticInfo.profilesQueryStatus}</div>
              )}
              {diagnosticInfo.profilesCount !== undefined && (
                <div>Profiles Count: {diagnosticInfo.profilesCount}</div>
              )}
              {diagnosticInfo.adminQueryStatus && (
                <div>Admin Query Status: {diagnosticInfo.adminQueryStatus}</div>
              )}
              {diagnosticInfo.adminCount !== undefined && (
                <div>Admin Count: {diagnosticInfo.adminCount}</div>
              )}
              {diagnosticInfo.authError && (
                <div className="text-red-500">Auth Error: {diagnosticInfo.authError}</div>
              )}
              {diagnosticInfo.profilesError && (
                <div className="text-red-500">Profiles Error: {diagnosticInfo.profilesError}</div>
              )}
              {diagnosticInfo.adminError && (
                <div className="text-red-500">Admin Error: {diagnosticInfo.adminError}</div>
              )}
            </div>
          </div>
        )}
        
        {onRefresh && (
          <div className="mt-4">
            <Button variant="outline" onClick={onRefresh} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        )}
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      <BulkUserActions
        selectedUserIds={selectedUserIds}
        selectedUsers={selectedUsers}
        onClearSelection={() => setSelectedUserIds([])}
        onBulkActionComplete={handleBulkActionComplete}
      />

      {/* Table */}
      <div className="bg-white rounded-md shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected || isPartiallySelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all users"
                />
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden md:table-cell">Account Created</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Activity</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-9 w-20" /></TableCell>
                </TableRow>
              ))
            ) : currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">No account records found.</p>
                    
                    {diagnosticInfo && Object.keys(diagnosticInfo).length > 0 && (
                      <div className="mt-4 mx-auto max-w-md p-4 bg-muted/50 rounded-md text-left">
                        <h4 className="text-sm font-semibold mb-2">Diagnostic Information</h4>
                        <div className="text-xs space-y-1">
                          {diagnosticInfo.hasAuthSession !== undefined && (
                            <div>Auth Session: {diagnosticInfo.hasAuthSession ? 'Yes' : 'No'}</div>
                          )}
                          {diagnosticInfo.profilesQueryStatus && (
                            <div>Profiles Query Status: {diagnosticInfo.profilesQueryStatus}</div>
                          )}
                          {diagnosticInfo.profilesCount !== undefined && (
                            <div>Profiles Count: {diagnosticInfo.profilesCount}</div>
                          )}
                          {diagnosticInfo.adminQueryStatus && (
                            <div>Admin Query Status: {diagnosticInfo.adminQueryStatus}</div>
                          )}
                          {diagnosticInfo.adminCount !== undefined && (
                            <div>Admin Count: {diagnosticInfo.adminCount}</div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {onRefresh && (
                      <div className="mt-4">
                        <Button variant="outline" onClick={onRefresh} size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh Data
                        </Button>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUserIds.includes(account.id)}
                      onCheckedChange={(checked) => handleUserSelect(account.id, checked === true)}
                      aria-label={`Select ${account.email}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{account.full_name || 'No Name'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{account.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {account.created_at ? format(new Date(account.created_at), 'MMM dd, yyyy') : 'Unknown'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {account.is_admin ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Admin</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">User</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex space-x-4">
                      <div className="flex items-center">
                        <Home className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{account.properties_count}</span>
                      </div>
                      <div className="flex items-center">
                        <UsersIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{account.owners_count}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewAccount(account.id)}
                      >
                        View Details
                      </Button>
                      <UserActionsDropdown
                        userId={account.id}
                        userEmail={account.email}
                        userName={account.full_name}
                        onUserDeleted={handleUserDeleted}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={7}>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredAccounts.length > 0 ? indexOfFirstItem : 0} to {indexOfLastItem} of {filteredAccounts.length} results
                    {selectedUserIds.length > 0 && (
                      <span className="ml-2 text-blue-600">
                        ({selectedUserIds.length} selected)
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
};
