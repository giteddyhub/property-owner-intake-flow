
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home, Users, Clipboard, Settings, BarChart3 } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

const breadcrumbConfig: Record<string, BreadcrumbItem[]> = {
  '/admin': [
    { label: 'Dashboard', icon: <Home className="h-4 w-4" /> }
  ],
  '/admin/users': [
    { label: 'Dashboard', href: '/admin', icon: <Home className="h-4 w-4" /> },
    { label: 'Users', icon: <Users className="h-4 w-4" /> }
  ],
  '/admin/accounts': [
    { label: 'Dashboard', href: '/admin', icon: <Home className="h-4 w-4" /> },
    { label: 'Accounts', icon: <Clipboard className="h-4 w-4" /> }
  ],
  '/admin/settings': [
    { label: 'Dashboard', href: '/admin', icon: <Home className="h-4 w-4" /> },
    { label: 'Settings', icon: <Settings className="h-4 w-4" /> }
  ]
};

export const AdminBreadcrumb: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  
  // Handle dynamic routes like /admin/accounts/:id
  const matchingPath = Object.keys(breadcrumbConfig).find(route => {
    if (route === path) return true;
    if (route.includes(':')) {
      const routePattern = route.replace(/:[^/]+/g, '[^/]+');
      return new RegExp(`^${routePattern}$`).test(path);
    }
    return path.startsWith(route) && route !== '/admin';
  });

  const breadcrumbs = breadcrumbConfig[matchingPath || '/admin'] || breadcrumbConfig['/admin'];

  // Handle specific dynamic routes
  if (path.includes('/admin/accounts/') && path !== '/admin/accounts') {
    const accountId = path.split('/admin/accounts/')[1];
    const baseBreadcrumbs = breadcrumbConfig['/admin/accounts'] || [];
    breadcrumbs.push({
      label: `Account ${accountId.substring(0, 8)}...`,
      icon: <BarChart3 className="h-4 w-4" />
    });
  }

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {index === breadcrumbs.length - 1 ? (
                <BreadcrumbPage className="flex items-center gap-2">
                  {item.icon}
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={item.href || '#'} className="flex items-center gap-2 hover:text-foreground">
                    {item.icon}
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
