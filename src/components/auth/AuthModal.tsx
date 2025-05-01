
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { supabase } from '@/integrations/supabase/client';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'sign-in' | 'sign-up';
  title?: string;
  description?: string;
  onSuccess?: () => void;
  redirectAfterAuth?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  open,
  onOpenChange,
  defaultTab = 'sign-in',
  title = 'Create an Account or Sign In',
  description = 'Create an account to save your information and continue with your submission.',
  onSuccess,
  redirectAfterAuth = false
}) => {
  const [activeTab, setActiveTab] = useState<'sign-in' | 'sign-up'>(defaultTab);
  const [authSuccessful, setAuthSuccessful] = useState(false);
  
  // Use effect to detect auth state changes
  useEffect(() => {
    if (!open) {
      // Reset state when modal closes
      setAuthSuccessful(false);
      return;
    }
    
    const subscription = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change in modal:", event);
      
      if (event === 'SIGNED_IN' && session?.user && onSuccess) {
        console.log("User signed in, calling onSuccess callback");
        setAuthSuccessful(true);
        // Using short timeout to let React render update first
        setTimeout(() => {
          onSuccess();
        }, 300);
      }
    });
    
    return () => {
      subscription.data.subscription.unsubscribe();
    };
  }, [open, onSuccess]);
  
  const handleSuccessCallback = () => {
    if (!authSuccessful && onSuccess) {
      console.log("Success callback from form");
      onSuccess();
    }
  };

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
          <Tabs
            defaultValue={activeTab}
            onValueChange={(value) => setActiveTab(value as 'sign-in' | 'sign-up')}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="sign-in">Sign In</TabsTrigger>
              <TabsTrigger value="sign-up">Create Account</TabsTrigger>
            </TabsList>
            <TabsContent value="sign-in">
              <SignInForm onSuccess={handleSuccessCallback} redirectAfterAuth={false} />
            </TabsContent>
            <TabsContent value="sign-up">
              <SignUpForm onSuccess={handleSuccessCallback} redirectAfterAuth={false} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
