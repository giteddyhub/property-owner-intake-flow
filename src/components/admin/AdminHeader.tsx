
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserDropdownMenu } from '@/components/dashboard/UserDropdownMenu';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AdminSidebar } from './AdminSidebar';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';

interface AdminHeaderProps {
  pageTitle: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ pageTitle }) => {
  const { admin, adminLogout } = useAdminAuth();
  
  return (
    <header className="border-b border-border px-6 py-3 bg-background z-10 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] p-0">
              <AdminSidebar />
            </SheetContent>
          </Sheet>
        </div>
        
        <h1 className="text-xl font-semibold">{pageTitle}</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground hidden sm:inline-block mr-2">
          {admin?.email}
        </span>
        <UserDropdownMenu onSignOut={adminLogout} isAdmin={true} />
      </div>
    </header>
  );
};
