
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SignUpSubmitButtonProps {
  isSubmitting: boolean;
}

export const SignUpSubmitButton: React.FC<SignUpSubmitButtonProps> = ({
  isSubmitting
}) => {
  return (
    <Button
      type="submit"
      className="w-full bg-form-400 hover:bg-form-500"
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating account...
        </>
      ) : (
        'Create account'
      )}
    </Button>
  );
};
