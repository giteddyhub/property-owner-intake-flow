
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

export const AdminUserDropdownMenu: React.FC = () => {
  const { admin, adminLogout } = useAdminAuth();
  const navigate = useNavigate();
  
  const getAdminInitials = () => {
    if (!admin || !admin.full_name) return 'A';
    const nameParts = admin.full_name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`;
    }
    return nameParts[0][0] || 'A';
  };

  const getAdminName = () => {
    return admin?.full_name || 'Admin';
  };

  const getAdminEmail = () => {
    return admin?.email || 'No email available';
  };
  
  const handleAccountSettings = () => {
    navigate('/admin/settings');
  };

  const handleSignOut = async () => {
    try {
      await adminLogout();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback className="bg-blue-100 text-blue-800">
            {getAdminInitials()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="p-2">
          <p className="text-sm font-medium">{getAdminName()}</p>
          <p className="text-xs text-muted-foreground truncate">{getAdminEmail()}</p>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleAccountSettings}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Admin Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
