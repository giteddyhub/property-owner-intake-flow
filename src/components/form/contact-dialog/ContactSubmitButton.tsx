
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface ContactSubmitButtonProps {
  onClick: () => void;
  isSubmitting: boolean;
  user: User | null;
}

const ContactSubmitButton: React.FC<ContactSubmitButtonProps> = ({ 
  onClick, 
  isSubmitting, 
  user 
}) => {
  return (
    <div className="pt-4">
      <Button
        onClick={onClick}
        disabled={isSubmitting}
        className="w-full bg-form-300 hover:bg-form-400"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : !user ? (
          'Continue to Sign In'
        ) : (
          'Submit'
        )}
      </Button>
    </div>
  );
};

export default ContactSubmitButton;
