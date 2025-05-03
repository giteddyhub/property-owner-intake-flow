
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Loader2 } from 'lucide-react';

interface SignInFormProps {
  onSuccess?: () => void;
  redirectAfterAuth?: boolean;
}

export const SignInForm: React.FC<SignInFormProps> = ({ 
  onSuccess
}) => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Signed in successfully');
        if (onSuccess) {
          onSuccess();
        }
        
        // Always redirect to dashboard after successful login
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error('An error occurred while signing in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <div className="flex justify-between items-center">
          <Label htmlFor="password">Password</Label>
          <a 
            href="#" 
            className="text-xs text-muted-foreground hover:text-primary"
            onClick={(e) => {
              e.preventDefault();
              toast.info('Please contact support to reset your password');
            }}
          >
            Forgot password?
          </a>
        </div>
        <Input 
          id="password" 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>
      
      <Button
        type="submit"
        className="w-full bg-form-400 hover:bg-form-500"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign in'
        )}
      </Button>
    </form>
  );
};
