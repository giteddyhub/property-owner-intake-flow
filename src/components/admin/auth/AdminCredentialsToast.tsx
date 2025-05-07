
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface AdminCredentialsToastProps {
  email: string;
  password: string;
}

export const showAdminCredentialsToast = ({ email, password }: AdminCredentialsToastProps) => {
  // First show a success toast
  toast.success('Admin account created successfully!', {
    duration: 10000,
  });
  
  // Then show the credentials toast with longer duration
  toast(
    <div className="space-y-2">
      <div className="font-bold">Admin Credentials (Copy these now!)</div>
      <div><strong>Email:</strong> {email}</div>
      <div><strong>Password:</strong> {password}</div>
      <div className="text-xs text-red-500 mt-2">
        This information will not be shown again!
      </div>
    </div>,
    {
      duration: 30000, // Show for 30 seconds
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
    }
  );
};
