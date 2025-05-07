
import React from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { AdminActionButton } from '@/components/admin/accounts/AccountAdminDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface UserData {
  id: string;
  email: string;
  full_name?: string;
}

interface UsersTableProps {
  users: UserData[];
  adminUsers: string[];
  loading: boolean;
  onAdminToggle: (user: UserData) => void;
  onRowClick: (userId: string) => void;  // New prop for handling row clicks
}

export const UsersTable: React.FC<UsersTableProps> = ({ 
  users, 
  adminUsers, 
  loading, 
  onAdminToggle,
  onRowClick
}) => {
  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No users found in the system
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
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const isAdmin = adminUsers.includes(user.id);
            
            return (
              <TableRow 
                key={user.id}
                onClick={() => onRowClick(user.id)}
                className="cursor-pointer hover:bg-muted"
              >
                <TableCell>{user.full_name || 'No Name'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                   {isAdmin ? (
                     <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700">
                       <CheckCircle className="mr-1 h-3 w-3" />
                       Admin
                     </span>
                   ) : (
                     <span className="text-muted-foreground">User</span>
                   )}
                </TableCell>
                <TableCell className="text-right">
                  <AdminActionButton 
                    isAdmin={isAdmin}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click event
                      onAdminToggle(user);
                    }}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
