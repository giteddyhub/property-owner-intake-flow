
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import { AdminClearSessionButton } from './AdminClearSessionButton';

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
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    if (!email || !password) {
      setAuthError('Please enter both email and password');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('[AdminLoginForm] Attempting login for:', email);
      
      // Sign in admin
      const success = await adminLogin(email, password);
      
      if (success) {
        toast.success('Successfully signed in as administrator', {
          description: `Welcome back, ${email}`
        });
        navigate('/admin');
      } else {
        setAuthError('Invalid email or password. Please check your credentials and try again.');
        setShowHelp(true);
      }
    } catch (error: any) {
      console.error('[AdminLoginForm] Login error:', error);
      setAuthError(error.message || 'An error occurred during sign in');
      setShowHelp(true);
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
      
      {/* Show helpful info about the default admin account */}
      {!authError && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Admin Login</AlertTitle>
          <AlertDescription className="text-blue-700">
            Use your administrator credentials to access the admin panel.
          </AlertDescription>
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
      
      {showHelp && (
        <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-100">
          <h4 className="font-medium text-blue-700 mb-2">Having trouble signing in?</h4>
          <p className="text-sm text-blue-600 mb-3">
            If you're experiencing login issues, try clearing your session data and trying again.
          </p>
          <AdminClearSessionButton />
        </div>
      )}
    </form>
  );
};
