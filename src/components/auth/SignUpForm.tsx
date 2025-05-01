
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Check, Mail } from 'lucide-react';
import { submitFormData } from '@/components/form/review/utils/submissionService';

interface SignUpFormProps {
  onSuccess?: () => void;
  redirectAfterAuth?: boolean;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onSuccess,
  redirectAfterAuth = false
}) => {
  const { signUp, setProcessingSubmission } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);

  const submitFormIfPending = async (userId: string, userEmail: string) => {
    // Check if there's pending form data in session storage
    const pendingFormDataStr = sessionStorage.getItem('pendingFormData');
    if (!pendingFormDataStr) return;

    const pendingFormData = JSON.parse(pendingFormDataStr);
    
    // Ensure the contact info includes the user's details
    pendingFormData.contactInfo = {
      fullName: fullName,
      email: userEmail
    };
    
    // Save the updated data back to session storage
    sessionStorage.setItem('pendingFormData', JSON.stringify(pendingFormData));
    
    // Don't submit the form here - redirect to verify email instead
    console.log("Form data prepared for submission after email verification");
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
    
    // Prevent double submissions
    if (isSubmitting) {
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
        
        // Save email in session storage for the verification page
        sessionStorage.setItem('pendingUserEmail', email);
        
        // Store the userId in sessionStorage for use after email verification
        if (data?.user?.id) {
          sessionStorage.setItem('pendingUserId', data.user.id);
          
          // Set processing flag to prevent duplicate submissions
          setProcessingSubmission(true);
          
          // Prepare form data for submission after email verification
          await submitFormIfPending(data.user.id, email);
        }
        
        // Only call onSuccess if redirectAfterAuth is false
        if (onSuccess && !redirectAfterAuth) {
          // Small delay to show the confirmation message
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
        
        if (redirectAfterAuth) {
          // Redirect to the verify email page
          navigate('/verify-email');
        }
      }
    } catch (error) {
      console.error('Error signing up:', error);
      toast.error('An error occurred while creating your account');
    } finally {
      setIsSubmitting(false);
    }
  };

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
