
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { SignInForm } from './SignInForm';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onSuccess?: () => void;
  defaultTab?: string; // Add this new prop
}

export const AuthModal: React.FC<AuthModalProps> = ({
  open,
  onOpenChange,
  title = 'Sign In',
  description = 'Sign in to access your Italian tax services.',
  onSuccess,
  defaultTab = 'sign-in', // Set a default value
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <SignInForm onSuccess={onSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
