import React from "react";
import { Card } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { UserManagementHeader } from "@/components/admin/users/UserManagementHeader";
import { ReadOnlyUsersTable } from "@/components/admin/users/ReadOnlyUsersTable";
import { AuditLogViewer } from "@/components/admin/audit/AuditLogViewer";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";

export const UsersList: React.FC = () => {
  const { users, loading, error, fetchUsers, handleRowClick } = useAdminUsers("all");

  React.useEffect(() => {
    document.title = "Admin Users | Refine";
  }, []);

  return (
    <div className="space-y-4">
      <UserManagementHeader pageTitle="User Management" onRefresh={fetchUsers} />

      <Card>
        <div className="flex items-center gap-2 text-blue-600">
          <InfoCircleOutlined />
          <span className="text-sm">
            User accounts are managed through the authentication system. Admin privileges are managed separately for security.
          </span>
        </div>
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
  );
};
