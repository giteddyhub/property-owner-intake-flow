
import React from 'react';
import { Button } from '@/components/ui/button';
import { AdminUserDropdownMenu } from './AdminUserDropdownMenu';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AdminSidebar } from './AdminSidebar';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';
import { ThemeToggle } from './theme/ThemeToggle';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface AdminHeaderProps {
  pageTitle: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ pageTitle }) => {
  const { admin } = useAdminAuth();
  
  return (
    <header className="border-b border-border px-6 py-3 bg-background z-10 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="lg:hidden" />
        <h1 className="text-xl font-semibold">{pageTitle}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <span className="text-sm text-muted-foreground hidden sm:inline-block mr-2">
          {admin?.email}
        </span>
        <AdminUserDropdownMenu />
      </div>
    </header>
  );
};
