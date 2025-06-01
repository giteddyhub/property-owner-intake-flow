
import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { UserManagementHeader } from '@/components/admin/users/UserManagementHeader';
import { EnhancedUsersTable } from '@/components/admin/users/EnhancedUsersTable';
import { AuditLogViewer } from '@/components/admin/audit/AuditLogViewer';
import { useAdminUsers } from '@/hooks/admin/useAdminUsers';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Shield, Users } from 'lucide-react';

const AdminAdvancedUsersPage: React.FC = () => {
  const {
    users,
    loading,
    error,
    fetchUsers,
    handleRowClick,
    currentItems,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalPages,
    filteredAccounts
  } = useAdminUsers('all');

  return (
    <AdminLayout pageTitle="Advanced User Management">
      <div className="space-y-6">
        <UserManagementHeader 
          pageTitle="Advanced User Management"
          onRefresh={fetchUsers}
        />
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-blue-600">
                <Zap className="h-4 w-4" />
                <span className="font-medium">Enhanced Features:</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>Bulk Operations</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>Advanced Actions</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>Audit Logging</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <EnhancedUsersTable
          loading={loading}
          currentItems={currentItems}
          handleViewAccount={handleRowClick}
          currentPage={currentPage}
          filteredAccounts={filteredAccounts}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          error={error}
          onRefresh={fetchUsers}
        />
        
        <AuditLogViewer />
      </div>
    </AdminLayout>
  );
};

export default AdminAdvancedUsersPage;
