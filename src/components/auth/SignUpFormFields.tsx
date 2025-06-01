
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SignUpFormFieldsProps {
  formState: {
    fullName: string;
    email: string;
    password: string;
    isSubmitting: boolean;
  };
  updateField: (field: 'fullName' | 'email' | 'password', value: string) => void;
}

export const SignUpFormFields: React.FC<SignUpFormFieldsProps> = ({
  formState,
  updateField
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input 
          id="fullName" 
          value={formState.fullName}
          onChange={(e) => updateField('fullName', e.target.value)}
          placeholder="John Doe"
          disabled={formState.isSubmitting}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          value={formState.email}
          onChange={(e) => updateField('email', e.target.value)}
          placeholder="your@email.com"
          disabled={formState.isSubmitting}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input 
          id="password" 
          type="password"
          value={formState.password}
          onChange={(e) => updateField('password', e.target.value)}
          disabled={formState.isSubmitting}
          required
          minLength={8}
        />
        <p className="text-xs text-muted-foreground">
          Must be at least 8 characters long
        </p>
      </div>
    </>
  );
};
