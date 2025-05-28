import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Users, Settings, ListChecks, Shield, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';
import { usePermissionSystem, Permission } from '@/hooks/admin/usePermissionSystem';

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
      icon: Users,
      label: 'Users',
      href: '/admin/users',
      permission: 'users.view' as Permission
    },
    {
      icon: ListChecks,
      label: 'Submissions',
      href: '/admin/submissions',
      permission: 'submissions.view' as Permission
    },
    {
      icon: Home,
      label: 'Accounts',
      href: '/admin/accounts',
      permission: 'accounts.view' as Permission
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
    <div className="flex flex-col h-full bg-secondary border-r">
      <div className="px-4 py-6">
        <Link to="/admin">
          <Button variant="ghost" className="lg:hidden">
            Admin Panel
          </Button>
        </Link>
      </div>
      <div className="space-y-1">
        {menuItems.map((item) => (
          <React.Fragment key={item.label}>
            {(!item.permission || hasPermission(item.permission)) && (
              <Link to={item.href}>
                <Button variant="ghost" className={cn(
                  "justify-start rounded-none w-full hover:bg-accent hover:text-accent-foreground",
                  location.pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
