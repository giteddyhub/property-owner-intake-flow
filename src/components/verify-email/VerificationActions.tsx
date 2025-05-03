
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface VerificationActionsProps {
  verificationStatus: 'pending' | 'verified' | 'failed';
}

const VerificationActions: React.FC<VerificationActionsProps> = ({
  verificationStatus
}) => {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleResendVerification = async () => {
    try {
      const email = sessionStorage.getItem('pendingUserEmail');
      if (!email) {
        toast.error("No email found to resend verification");
        return;
      }
      
      await supabase.auth.resend({
        type: 'signup',
        email
      });
      
      toast.success("Verification email resent, please check your inbox");
    } catch (error) {
      console.error("[VerificationActions] Error resending verification:", error);
      toast.error("Failed to resend verification email");
    }
  };

  return (
    <div className="flex flex-col space-y-2 mt-6">
      <Button onClick={handleBackToLogin} className="w-full">
        Return to Login
      </Button>
      
      {verificationStatus === 'pending' && (
        <Button variant="outline" onClick={handleResendVerification} className="w-full mt-2">
          Resend Verification Email
        </Button>
      )}
    </div>
  );
};

export default VerificationActions;
