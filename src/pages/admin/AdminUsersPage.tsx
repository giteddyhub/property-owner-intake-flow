
import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { UserManagementHeader } from '@/components/admin/users/UserManagementHeader';
import { ReadOnlyUsersTable } from '@/components/admin/users/ReadOnlyUsersTable';
import { AuditLogViewer } from '@/components/admin/audit/AuditLogViewer';
import { useAdminUsers } from '@/hooks/admin/useAdminUsers';
import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';

const AdminUsersPage: React.FC = () => {
  const {
    users,
    loading,
    error,
    fetchUsers,
    handleRowClick
  } = useAdminUsers('all');

  return (
    <AdminLayout pageTitle="User Management">
      <div className="space-y-6">
        <UserManagementHeader 
          pageTitle="User Management"
          onRefresh={fetchUsers}
        />
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Info className="h-4 w-4" />
              <span className="text-sm">
                User accounts are managed through the authentication system. 
                Admin privileges are managed separately for security.
              </span>
            </div>
          </CardContent>
        </Card>
        
        <ReadOnlyUsersTable
          users={users}
          loading={loading}
          error={error}
          onRowClick={handleRowClick}
          onRefresh={fetchUsers}
        />
        
        <AuditLogViewer />
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;
