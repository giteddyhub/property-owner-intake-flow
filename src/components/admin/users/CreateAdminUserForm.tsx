
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertTriangle } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateAdminUserFormProps {
  onSuccess: (userData: any) => void;
  onCancel: () => void;
}

export const CreateAdminUserForm: React.FC<CreateAdminUserFormProps> = ({ 
  onSuccess,
  onCancel 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    
    try {
      // Call our edge function for creating admin user
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: {
          email,
          password,
          full_name: fullName
        }
      });
      
      if (error) throw new Error(error.message);
      if (!data) throw new Error('Failed to create admin user');
      
      // Success
      toast.success(`Admin user ${fullName} created successfully`);
      
      // Pass the new user data back to the parent component
      onSuccess(data);
      
      // Reset form
      setEmail('');
      setPassword('');
      setFullName('');
    } catch (error: any) {
      console.error('Error creating admin user:', error);
      setFormError(error.message || 'Failed to create admin user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {formError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
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
            required
            minLength={8}
          />
          <p className="text-xs text-muted-foreground">
            Password must be at least 8 characters long
          </p>
        </div>
      </div>
      
      <DialogFooter className="mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Admin User'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};
