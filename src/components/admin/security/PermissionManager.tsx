
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePermissionSystem, Permission, Role } from '@/hooks/admin/usePermissionSystem';
import { UserCog, Shield, Users } from 'lucide-react';

interface PermissionManagerProps {
  selectedUserId?: string;
  selectedUserRole?: Role;
  onRoleChange?: (userId: string, newRole: Role) => void;
}

export const PermissionManager: React.FC<PermissionManagerProps> = ({
  selectedUserId,
  selectedUserRole,
  onRoleChange
}) => {
  const { 
    userRole, 
    roleHierarchy, 
    hasPermission, 
    canManageUser, 
    getAvailableRoles 
  } = usePermissionSystem();

  const [selectedRole, setSelectedRole] = useState<Role>(selectedUserRole || 'viewer');

  const groupedPermissions = {
    'User Management': ['users.view', 'users.edit', 'users.delete', 'users.create'] as Permission[],
    'Analytics': ['analytics.view', 'analytics.export'] as Permission[],
    'System': ['system.settings', 'system.backup', 'system.logs'] as Permission[],
    'Submissions': ['submissions.view', 'submissions.edit', 'submissions.delete'] as Permission[],
    'Accounts': ['accounts.view', 'accounts.edit', 'accounts.billing'] as Permission[]
  };

  const getRolePermissions = (role: Role): Permission[] => {
    return roleHierarchy.find(r => r.role === role)?.permissions || [];
  };

  const handleRoleChange = (newRole: Role) => {
    setSelectedRole(newRole);
    if (selectedUserId && onRoleChange) {
      onRoleChange(selectedUserId, newRole);
    }
  };

  const canEditPermissions = hasPermission('system.settings') && 
    (selectedUserRole ? canManageUser(selectedUserRole) : true);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Role Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Current Role</label>
              <Select 
                value={selectedRole} 
                onValueChange={handleRoleChange}
                disabled={!canEditPermissions}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableRoles().map(role => (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        {role.replace('_', ' ').toUpperCase()}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roleHierarchy.map(role => (
                <div key={role.role} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{role.role.replace('_', ' ').toUpperCase()}</h4>
                    <Badge variant="outline">Level {role.hierarchy_level}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {role.permissions.length} permissions
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map(permission => (
                      <Badge key={permission} variant="secondary" className="text-xs">
                        {permission.split('.')[0]}
                      </Badge>
                    ))}
                    {role.permissions.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{role.permissions.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permission Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(groupedPermissions).map(([category, permissions]) => (
              <div key={category}>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {category}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {permissions.map(permission => {
                    const hasThisPermission = getRolePermissions(selectedRole).includes(permission);
                    return (
                      <div key={permission} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{permission}</span>
                        <Switch 
                          checked={hasThisPermission}
                          disabled={true} // Permissions are role-based, not individually toggleable
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
