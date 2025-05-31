
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Settings, ListChecks, Shield, LayoutDashboard } from 'lucide-react';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';
import { usePermissionSystem, Permission } from '@/hooks/admin/usePermissionSystem';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { hasPermission } = usePermissionSystem();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/admin',
      permission: null
    },
    {
      icon: Home,
      label: 'Accounts',
      href: '/admin/accounts',
      permission: 'accounts.view' as Permission
    },
    {
      icon: ListChecks,
      label: 'Submissions',
      href: '/admin/submissions',
      permission: 'submissions.view' as Permission
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/admin/settings',
      permission: 'system.settings' as Permission
    },
    {
      icon: Shield,
      label: 'Security',
      href: '/admin/security',
      permission: 'system.logs' as Permission
    }
  ];

  return (
    <Sidebar collapsible="icon" className="w-64">
      <SidebarHeader className="p-4">
        <Link to="/admin" className="flex items-center space-x-2">
          <Shield className="h-6 w-6" />
          <span className="font-semibold text-lg">Admin Panel</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <React.Fragment key={item.label}>
                  {(!item.permission || hasPermission(item.permission)) && (
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location.pathname === item.href}
                        className="w-full"
                      >
                        <Link to={item.href} className="flex items-center space-x-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </React.Fragment>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
