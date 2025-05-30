
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

interface UserData {
  id: string;
  email: string;
  full_name?: string;
}

interface UsersTableProps {
  users: UserData[];
  adminUsers: string[];
  loading: boolean;
  error?: string | null;
  diagnosticInfo?: any;
  onAdminToggle: (user: UserData) => void;
  onRowClick: (userId: string) => void;
  onRefresh?: () => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({ 
  users, 
  adminUsers, 
  loading, 
  error,
  diagnosticInfo,
  onAdminToggle,
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
              {diagnosticInfo.adminFallbackUsed && (
                <div>Admin Fallback Used: Yes (Count: {diagnosticInfo.adminFallbackCount || 0})</div>
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

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground mb-4">No users found in the system</div>
        
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
