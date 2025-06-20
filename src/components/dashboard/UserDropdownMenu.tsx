
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
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

interface UserDropdownMenuProps {
  onSignOut?: () => Promise<void>;
  isAdmin?: boolean;
}

export const UserDropdownMenu: React.FC<UserDropdownMenuProps> = ({ onSignOut, isAdmin = false }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const getUserInitials = () => {
    if (!user || !user.user_metadata || !user.user_metadata.full_name) return 'U';
    const fullName = user.user_metadata.full_name;
    const nameParts = fullName.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`;
    }
    return nameParts[0][0] || 'U';
  };

  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    return 'User';
  };

  const getUserEmail = () => {
    return user?.email || 'No email available';
  };
  
  const handleAccountSettings = () => {
    navigate('/settings');
  };

  const handleSignOut = async () => {
    try {
      console.log('UserDropdownMenu: Starting sign out process');
      
      // Use the provided onSignOut function or fall back to the context's signOut
      if (onSignOut) {
        await onSignOut();
      } else {
        await signOut();
      }
      
      // Only show success message and navigate if we reach this point
      toast.success('Signed out successfully');
      navigate('/', { replace: true });
      
    } catch (error: any) {
      console.error('UserDropdownMenu: Error signing out:', error);
      
      // For any errors, still navigate but show a generic message
      toast.info('You have been signed out');
      navigate('/', { replace: true });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback className="bg-blue-100 text-blue-800">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="p-2">
          <p className="text-sm font-medium">{getUserName()}</p>
          <p className="text-xs text-muted-foreground truncate">{getUserEmail()}</p>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleAccountSettings}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Account Settings</span>
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
