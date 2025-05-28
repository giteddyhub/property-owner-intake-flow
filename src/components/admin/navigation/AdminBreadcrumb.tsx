
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
import { Home, Users, Clipboard, Settings, BarChart3, ListChecks, Shield } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export const AdminBreadcrumb: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    // Always start with Dashboard
    const breadcrumbs: BreadcrumbItem[] = [];
    
    // Handle specific routes
    if (path === '/admin') {
      return [{ label: 'Dashboard', icon: <Home className="h-4 w-4" /> }];
    }
    
    // Add Dashboard as first item for all non-dashboard pages
    breadcrumbs.push({ 
      label: 'Dashboard', 
      href: '/admin', 
      icon: <Home className="h-4 w-4" /> 
    });
    
    if (path.startsWith('/admin/users')) {
      breadcrumbs.push({ 
        label: 'Users', 
        icon: <Users className="h-4 w-4" />,
        ...(path === '/admin/users' ? {} : { href: '/admin/users' })
      });
    } else if (path.startsWith('/admin/accounts')) {
      breadcrumbs.push({ 
        label: 'Accounts', 
        icon: <Clipboard className="h-4 w-4" />,
        ...(path === '/admin/accounts' ? {} : { href: '/admin/accounts' })
      });
      
      // Handle account detail page
      const accountMatch = path.match(/^\/admin\/accounts\/([^\/]+)$/);
      if (accountMatch) {
        const accountId = accountMatch[1];
        breadcrumbs.push({
          label: `Account ${accountId.substring(0, 8)}...`,
          icon: <BarChart3 className="h-4 w-4" />
        });
      }
    } else if (path.startsWith('/admin/submissions')) {
      breadcrumbs.push({ 
        label: 'Submissions', 
        icon: <ListChecks className="h-4 w-4" />,
        ...(path === '/admin/submissions' ? {} : { href: '/admin/submissions' })
      });
      
      // Handle submission detail page
      const submissionMatch = path.match(/^\/admin\/submissions\/([^\/]+)$/);
      if (submissionMatch) {
        const submissionId = submissionMatch[1];
        breadcrumbs.push({
          label: `Submission ${submissionId.substring(0, 8)}...`,
          icon: <BarChart3 className="h-4 w-4" />
        });
      }
    } else if (path.startsWith('/admin/settings')) {
      breadcrumbs.push({ 
        label: 'Settings', 
        icon: <Settings className="h-4 w-4" /> 
      });
    } else if (path.startsWith('/admin/security')) {
      breadcrumbs.push({ 
        label: 'Security', 
        icon: <Shield className="h-4 w-4" /> 
      });
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={`${item.label}-${index}`}>
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
