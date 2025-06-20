
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { User, LogOut, Settings, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

export const AccountMenu = () => {
  const { user, signOut, isAdmin, checkAdminStatus } = useAuth();
  const navigate = useNavigate();
  
  // Check admin status when component mounts
  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user, checkAdminStatus]);
  
  const handleSignOut = async () => {
    try {
      console.log('AccountMenu: Starting sign out process');
      await signOut();
      toast.success('Signed out successfully');
      
      // Navigate using React Router instead of window.location
      navigate('/', { replace: true });
      
    } catch (error) {
      console.error('AccountMenu: Error signing out:', error);
      // Don't show error for session-related issues as they're handled in signOut
      if (!error?.message?.includes('Session not found') && 
          !error?.message?.includes('session_not_found')) {
        toast.error('Failed to sign out completely. Please try again.');
      }
      
      // Still navigate to home even if there was an error
      navigate('/', { replace: true });
    }
  };

  // If user is not logged in, return null
  if (!user) {
    return null;
  }
  
  const initials = user.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>{user.email}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard">
            <Settings className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin">
              <ShieldCheck className="mr-2 h-4 w-4" />
              <span>Admin Panel</span>
            </Link>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
