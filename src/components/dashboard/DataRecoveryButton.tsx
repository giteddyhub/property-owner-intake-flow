
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { associateOrphanedData } from '@/hooks/dashboard/mappers/assignmentMapper';

interface DataRecoveryButtonProps {
  onDataRecovered: () => void;
}

export const DataRecoveryButton: React.FC<DataRecoveryButtonProps> = ({ 
  onDataRecovered 
}) => {
  const [isRecovering, setIsRecovering] = useState(false);
  const { user } = useAuth();
  
  const handleRecoveryAttempt = async () => {
    if (!user?.email) {
      toast.error("You must be logged in with a valid email to recover data");
      return;
    }
    
    const userId = user?.id || sessionStorage.getItem('pendingUserId') || localStorage.getItem('pendingUserId');
    
    if (!userId) {
      toast.error("Unable to determine your user ID. Please try logging out and back in.");
      return;
    }
    
    setIsRecovering(true);
    
    try {
      console.log(`Attempting to recover data for user ${userId} with email ${user.email}`);
      
      // Try a more aggressive data recovery approach
      const result = await associateOrphanedData(userId, user.email);
      
      if (result.success) {
        toast.success(`Successfully recovered your data!`);
        onDataRecovered();
      } else {
        // Try a second approach - check against email only
        console.log("First recovery attempt failed, trying email-only approach");
        const emailOnlyResult = await associateOrphanedData(userId, user.email, true);
        
        if (emailOnlyResult.success) {
          toast.success(`Successfully recovered your data through email matching!`);
          onDataRecovered();
        } else {
          toast.info("No orphaned data was found associated with your account");
        }
      }
    } catch (error) {
      console.error("Error recovering data:", error);
      toast.error("Failed to recover data. Please try again later.");
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <Button
      onClick={handleRecoveryAttempt}
      disabled={isRecovering || !user?.email}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      {isRecovering ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Recovering...
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4" />
          Find Missing Data
        </>
      )}
    </Button>
  );
};

export default DataRecoveryButton;
