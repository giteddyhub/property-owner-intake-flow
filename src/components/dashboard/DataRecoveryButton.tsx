
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
    if (!user?.email || !user?.id) {
      toast.error("You must be logged in to recover data");
      return;
    }
    
    setIsRecovering(true);
    
    try {
      const result = await associateOrphanedData(user.id, user.email);
      
      if (result.success) {
        toast.success(`Successfully recovered your data!`);
        onDataRecovered();
      } else {
        toast.info("No orphaned data was found associated with your email");
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
