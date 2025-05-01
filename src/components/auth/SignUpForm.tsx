
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail } from 'lucide-react';

interface SignUpFormProps {
  onSuccess?: () => void;
  redirectAfterAuth?: boolean;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onSuccess,
  redirectAfterAuth = false
}) => {
  const { signUp } = useAuth();
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
        toast.success('Account created successfully! Please check your email to verify your account.');
        setIsSignedUp(true);
        
        // Log data for debugging
        console.log("[SignUpForm] Sign up successful:", data?.user?.id);
        
        // Save email in session storage for the verification page
        sessionStorage.setItem('pendingUserEmail', email);
        
        // Store pendingUserId for use after email verification
        if (data?.user?.id) {
          const userId = data.user.id;
          sessionStorage.setItem('pendingUserId', userId);
          console.log("[SignUpForm] Stored pendingUserId:", userId);
          
          // Update pending form data for submission after email verification
          const pendingFormDataStr = sessionStorage.getItem('pendingFormData');
          if (pendingFormDataStr) {
            console.log("[SignUpForm] Found pendingFormData, preparing for submission after verification");
            try {
              // Flag for auto-submission upon verification
              sessionStorage.setItem('submitAfterVerification', 'true');
              
              // Store full name and email in the pending form data
              const pendingFormData = JSON.parse(pendingFormDataStr);
              if (!pendingFormData.contactInfo) {
                pendingFormData.contactInfo = {};
              }
              pendingFormData.contactInfo.fullName = fullName;
              pendingFormData.contactInfo.email = email;
              sessionStorage.setItem('pendingFormData', JSON.stringify(pendingFormData));
              
              // Set a flag to redirect to dashboard after email verification
              sessionStorage.setItem('redirectToDashboard', 'true');
              console.log("[SignUpForm] Set up auto-submission after verification");
            } catch (parseError) {
              console.error("[SignUpForm] Error parsing pending form data:", parseError);
              toast.error("There was an error processing your form data");
            }
          }
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
    } catch (error: any) {
      console.error('[SignUpForm] Error signing up:', error);
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
          disabled={isSubmitting || isSignedUp}
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
          disabled={isSubmitting || isSignedUp}
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
          disabled={isSubmitting || isSignedUp}
          required
          minLength={8}
        />
        <p className="text-xs text-muted-foreground">
          Must be at least 8 characters long
        </p>
      </div>
      
      {isSignedUp ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Mail className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Verification email sent</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Please check your email and click the verification link to complete your registration.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
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
      )}
    </form>
  );
};
