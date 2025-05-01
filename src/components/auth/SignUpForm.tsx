
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Check, Mail } from 'lucide-react';

interface SignUpFormProps {
  onSuccess?: () => void;
  redirectAfterAuth?: boolean;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onSuccess,
  redirectAfterAuth = false
}) => {
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Starting signup process...");
      const { error, data } = await signUp(email, password, fullName);
      
      if (error) {
        console.error("Signup error:", error);
        toast.error(error.message);
      } else {
        console.log("Signup successful, user data:", data?.user);
        toast.success('Account created successfully!');
        
        // Store the userId in both sessionStorage and localStorage for persistence
        if (data?.user?.id) {
          console.log("Setting user ID in storage:", data.user.id);
          sessionStorage.setItem('pendingUserId', data.user.id);
          localStorage.setItem('pendingUserId', data.user.id);
          
          // Store email for recovery purposes
          if (data.user.email) {
            sessionStorage.setItem('userEmail', data.user.email);
            localStorage.setItem('userEmail', data.user.email);
          }
          
          // Check if we have any form submission data that needs to be preserved
          const contactId = sessionStorage.getItem('contactId');
          if (contactId) {
            console.log("Found contactId in storage, attempting to update with user ID");
            // This is now handled in AuthContext.tsx
          }
        }
        
        setIsSignedUp(true);
      }
    } catch (error) {
      console.error('Error signing up:', error);
      toast.error('An error occurred while creating your account');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state after signing up
  if (isSignedUp) {
    return (
      <div className="flex flex-col items-center text-center space-y-4 py-4">
        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold">Account Created!</h3>
        <div className="text-sm text-gray-600 max-w-xs">
          <p className="mb-3">Your account has been created successfully. You can now continue with your submission.</p>
        </div>
        {onSuccess && (
          <Button
            onClick={onSuccess}
            className="mt-4 w-full bg-form-400 hover:bg-form-500"
          >
            Continue with Submission
          </Button>
        )}
        {redirectAfterAuth && !onSuccess && (
          <Button
            onClick={() => navigate('/dashboard')}
            className="mt-4 w-full bg-form-400 hover:bg-form-500"
          >
            Go to Dashboard
          </Button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input 
          id="fullName" 
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="John Doe"
          disabled={isSubmitting}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={isSubmitting}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input 
          id="password" 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
          required
          minLength={8}
        />
        <p className="text-xs text-muted-foreground">
          Must be at least 8 characters long
        </p>
      </div>
      
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
    </form>
  );
};
