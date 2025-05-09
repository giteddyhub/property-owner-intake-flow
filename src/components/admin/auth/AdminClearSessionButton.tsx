
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const AdminClearSessionButton: React.FC = () => {
  const navigate = useNavigate();

  const handleClearSessions = () => {
    try {
      // Clear all localStorage data related to admin sessions
      localStorage.removeItem('admin_session');
      
      // Inform the user
      toast.success('Session data cleared', {
        description: 'All admin session data has been cleared'
      });
      
      // Redirect to login
      setTimeout(() => {
        navigate('/admin/login');
      }, 1000);
    } catch (error) {
      console.error('Error clearing session data:', error);
      toast.error('Error clearing session data');
    }
  };
  
  return (
    <Button 
      variant="destructive" 
      size="sm"
      onClick={handleClearSessions}
      className="mt-4"
    >
      <Trash2 className="h-4 w-4 mr-2" />
      Clear Session Data
    </Button>
  );
};
