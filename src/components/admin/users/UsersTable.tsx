
import React from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { AdminActionButton } from '@/components/admin/accounts/AccountAdminDialog';

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
}

export const UsersTable: React.FC<UsersTableProps> = ({ 
  users, 
  adminUsers, 
  loading, 
  onAdminToggle 
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
      <table className="w-full">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left p-3">Name</th>
            <th className="text-left p-3">Email</th>
            <th className="text-left p-3">Role</th>
            <th className="text-right p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isAdmin = adminUsers.includes(user.id);
            
            return (
              <tr key={user.id} className="border-t">
                <td className="p-3">{user.full_name || 'No Name'}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">
                  {isAdmin ? (
                    <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Admin
                    </span>
                  ) : (
                    <span className="text-muted-foreground">User</span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <AdminActionButton 
                    isAdmin={isAdmin}
                    onClick={() => onAdminToggle(user)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
