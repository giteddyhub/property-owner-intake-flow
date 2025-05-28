
import { useState, useCallback, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';

export type Permission = 
  | 'users.view' | 'users.edit' | 'users.delete' | 'users.create'
  | 'analytics.view' | 'analytics.export'
  | 'system.settings' | 'system.backup' | 'system.logs'
  | 'submissions.view' | 'submissions.edit' | 'submissions.delete'
  | 'accounts.view' | 'accounts.edit' | 'accounts.billing';

export type Role = 'super_admin' | 'admin' | 'moderator' | 'viewer';

export interface RolePermissions {
  role: Role;
  permissions: Permission[];
  hierarchy_level: number;
}

const ROLE_HIERARCHY: RolePermissions[] = [
  {
    role: 'super_admin',
    hierarchy_level: 0,
    permissions: [
      'users.view', 'users.edit', 'users.delete', 'users.create',
      'analytics.view', 'analytics.export',
      'system.settings', 'system.backup', 'system.logs',
      'submissions.view', 'submissions.edit', 'submissions.delete',
      'accounts.view', 'accounts.edit', 'accounts.billing'
    ]
  },
  {
    role: 'admin',
    hierarchy_level: 1,
    permissions: [
      'users.view', 'users.edit', 'users.create',
      'analytics.view', 'analytics.export',
      'submissions.view', 'submissions.edit',
      'accounts.view', 'accounts.edit'
    ]
  },
  {
    role: 'moderator',
    hierarchy_level: 2,
    permissions: [
      'users.view', 'users.edit',
      'analytics.view',
      'submissions.view', 'submissions.edit',
      'accounts.view'
    ]
  },
  {
    role: 'viewer',
    hierarchy_level: 3,
    permissions: [
      'users.view',
      'analytics.view',
      'submissions.view',
      'accounts.view'
    ]
  }
];

export const usePermissionSystem = () => {
  const { admin } = useAdminAuth();
  const [userRole, setUserRole] = useState<Role>('viewer');
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    if (admin) {
      // Determine user role based on admin properties
      const role: Role = admin.is_super_admin ? 'super_admin' : 'admin';
      setUserRole(role);
      
      // Get permissions for role
      const roleConfig = ROLE_HIERARCHY.find(r => r.role === role);
      setUserPermissions(roleConfig?.permissions || []);
    }
  }, [admin]);

  const hasPermission = useCallback((permission: Permission): boolean => {
    return userPermissions.includes(permission);
  }, [userPermissions]);

  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    return permissions.some(permission => userPermissions.includes(permission));
  }, [userPermissions]);

  const hasAllPermissions = useCallback((permissions: Permission[]): boolean => {
    return permissions.every(permission => userPermissions.includes(permission));
  }, [userPermissions]);

  const canManageUser = useCallback((targetUserRole: Role): boolean => {
    const currentLevel = ROLE_HIERARCHY.find(r => r.role === userRole)?.hierarchy_level ?? 999;
    const targetLevel = ROLE_HIERARCHY.find(r => r.role === targetUserRole)?.hierarchy_level ?? 0;
    
    // Can only manage users at same or lower hierarchy level
    return currentLevel <= targetLevel;
  }, [userRole]);

  const getAvailableRoles = useCallback((): Role[] => {
    const currentLevel = ROLE_HIERARCHY.find(r => r.role === userRole)?.hierarchy_level ?? 999;
    
    return ROLE_HIERARCHY
      .filter(role => role.hierarchy_level >= currentLevel)
      .map(role => role.role);
  }, [userRole]);

  return {
    userRole,
    userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canManageUser,
    getAvailableRoles,
    roleHierarchy: ROLE_HIERARCHY
  };
};
