
import React from 'react';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserProfile } from '@/hooks/admin/useCleanAdminData';
import { format } from 'date-fns';

interface ReadOnlyUsersTableProps {
  users: UserProfile[];
  loading: boolean;
  error?: string | null;
  onRowClick: (userId: string) => void;
  onRefresh?: () => void;
}

export const ReadOnlyUsersTable: React.FC<ReadOnlyUsersTableProps> = ({ 
  users, 
  loading, 
  error,
  onRowClick,
  onRefresh
}) => {
  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error loading users</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        
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

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground mb-4">No users found in the system</div>
        
        {onRefresh && (
          <div className="mt-4">
            <Button variant="outline" onClick={onRefresh} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Submissions</TableHead>
            <TableHead>Properties</TableHead>
            <TableHead>Owners</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow 
              key={user.id}
              onClick={() => onRowClick(user.id)}
              className="cursor-pointer hover:bg-muted"
            >
              <TableCell className="font-medium">
                {user.full_name || 'No Name'}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {user.submissions_count}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {user.properties_count}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {user.owners_count}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(user.created_at), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  User
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
