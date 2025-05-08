
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';
import { useNavigate } from 'react-router-dom';

interface AdminLoginFormProps {
  initialEmail?: string;
}

export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ initialEmail = '' }) => {
  const { adminLogin } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    if (!email || !password) {
      setAuthError('Please enter both email and password');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Sign in admin
      const success = await adminLogin(email, password);
      
      if (success) {
        toast.success('Signed in as administrator');
        navigate('/admin');
      } else {
        setAuthError('Invalid credentials or account not found');
      }
    } catch (error: any) {
      setAuthError(error.message || 'An error occurred during sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {authError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
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
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign in as Administrator'
        )}
      </Button>
    </form>
  );
};
