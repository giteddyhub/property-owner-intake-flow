
import React from 'react';
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
import { AccountData } from '@/types/admin';
import { Mail, FileText, Home, Users as UsersIcon } from 'lucide-react';

interface AccountsTableProps {
  loading: boolean;
  currentItems: AccountData[];
  handleViewAccount: (accountId: string) => void;
  currentPage: number;
  filteredAccounts: AccountData[];
  itemsPerPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export const AccountsTable: React.FC<AccountsTableProps> = ({
  loading,
  currentItems,
  handleViewAccount,
  currentPage,
  filteredAccounts,
  itemsPerPage,
  totalPages,
  setCurrentPage
}) => {
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

  return (
    <div className="bg-white rounded-md shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
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
            // Loading skeleton
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={`skeleton-${i}`}>
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
              <TableCell colSpan={6} className="h-24 text-center">
                No account records found.
              </TableCell>
            </TableRow>
          ) : (
            currentItems.map((account) => (
              <TableRow key={account.id}>
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
                      <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{account.submissions_count}</span>
                    </div>
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewAccount(account.id)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6}>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredAccounts.length > 0 ? indexOfFirstItem : 0} to {indexOfLastItem} of {filteredAccounts.length} results
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
  );
};
