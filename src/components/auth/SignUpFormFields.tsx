
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SignUpFormFieldsProps {
  fullName: string;
  email: string;
  password: string;
  onFullNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  disabled: boolean;
}

export const SignUpFormFields: React.FC<SignUpFormFieldsProps> = ({
  fullName,
  email,
  password,
  onFullNameChange,
  onEmailChange,
  onPasswordChange,
  disabled
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input 
          id="fullName" 
          value={fullName}
          onChange={(e) => onFullNameChange(e.target.value)}
          placeholder="John Doe"
          disabled={disabled}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="your@email.com"
          disabled={disabled}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input 
          id="password" 
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          disabled={disabled}
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
