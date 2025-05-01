
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Check, Mail } from 'lucide-react';
import { submitFormData } from '@/components/form/review/submitUtils';

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

  const submitPendingFormData = async (userId: string) => {
    try {
      // Check if there's pending form data in session storage
      const pendingFormDataStr = sessionStorage.getItem('pendingFormData');
      if (pendingFormDataStr) {
        const pendingFormData = JSON.parse(pendingFormDataStr);
        console.log("Found pending form data, submitting with new user ID:", userId);
        
        // Validate form data before submission
        if (!pendingFormData.owners || !pendingFormData.properties) {
          console.warn("Pending form data is incomplete, skipping submission", pendingFormData);
          return;
        }
        
        // Submit the form data with the new user ID
        await submitFormData(
          pendingFormData.owners,
          pendingFormData.properties,
          pendingFormData.assignments,
          pendingFormData.contactInfo,
          userId
        );
        
        // Clear the pending form data from session storage
        sessionStorage.removeItem('pendingFormData');
        console.log("Successfully submitted pending form data for user:", userId);
        
        // Set a flag to redirect to the dashboard instead of the form
        sessionStorage.setItem('redirectToDashboard', 'true');
      }
    } catch (error) {
      console.error("Error submitting pending form data:", error);
    }
  };

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
      const { error, data } = await signUp(email, password, fullName);
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Account created successfully!');
        setIsSignedUp(true);
        
        // Check if we have pending form data to submit with the new user ID
        if (data?.user?.id) {
          // Store the userId in sessionStorage for use after email verification
          sessionStorage.setItem('pendingUserId', data.user.id);
          
          // Submit any pending form data with the new user ID
          await submitPendingFormData(data.user.id);
        }
        
        // Only call onSuccess if redirectAfterAuth is false
        if (onSuccess && !redirectAfterAuth) {
          // Small delay to show the confirmation message
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
        
        if (redirectAfterAuth) {
          // Check if we need to redirect to dashboard
          const shouldRedirectToDashboard = sessionStorage.getItem('redirectToDashboard') === 'true';
          if (shouldRedirectToDashboard) {
            // Clear the redirect flag
            sessionStorage.removeItem('redirectToDashboard');
            // Delay redirect to ensure auth state is updated
            setTimeout(() => {
              // Redirect to dashboard
              navigate('/dashboard');
            }, 1500);
          } else {
            navigate('/');
          }
        }
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
          <p className="mb-3">Please check your email to verify your account.</p>
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <Mail className="h-4 w-4" />
            <span>{email}</span>
          </div>
        </div>
        {!redirectAfterAuth && onSuccess && (
          <Button
            onClick={onSuccess}
            className="mt-4 w-full bg-form-400 hover:bg-form-500"
          >
            Continue with Submission
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
