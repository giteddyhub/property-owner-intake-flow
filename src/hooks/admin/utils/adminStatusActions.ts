
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const toggleUserAdminStatus = async (
  userId: string, 
  currentAdminStatus: boolean, 
  userName: string
): Promise<boolean> => {
  try {
    console.log(`Attempting to ${currentAdminStatus ? 'remove' : 'grant'} admin status for user ${userId} (${userName})`);
    
    if (currentAdminStatus) {
      // Remove admin privileges
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', userId);
        
      if (error) {
        console.error('Error removing admin status:', error);
        throw error;
      }
      
      toast({
        title: "Admin Status Removed",
        description: `Admin privileges removed from ${userName}`,
      });
      
      console.log(`Successfully removed admin status from ${userName}`);
    } else {
      // Grant admin privileges
      const { error } = await supabase
        .from('admin_users')
        .insert([{ id: userId }]);
        
      if (error) {
        console.error('Error granting admin status:', error);
        throw error;
      }
      
      toast({
        title: "Admin Status Granted",
        description: `Admin privileges granted to ${userName}`,
      });
      
      console.log(`Successfully granted admin status to ${userName}`);
    }
    
    return true;
  } catch (error: any) {
    console.error('Error toggling admin status:', error);
    
    toast({
      title: "Operation Failed",
      description: `Failed to update admin status: ${error.message}`,
      type: "error"
    });
    
    return false;
  }
};
