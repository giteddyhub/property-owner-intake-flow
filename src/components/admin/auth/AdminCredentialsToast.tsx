
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

  // Proactively copy the password to clipboard without rendering it
  try {
    void navigator.clipboard.writeText(password);
  } catch (e) {
    console.warn('Clipboard copy failed; password will remain hidden.');
  }
  
  // Then show a credentials toast WITHOUT revealing the password
  toast(
    <div className="space-y-2">
      <div className="font-bold">Admin Credentials</div>
      <div><strong>Email:</strong> {email}</div>
      <div className="text-xs text-red-500 mt-2">
        For security, the password is hidden. It has been copied to your clipboard.
      </div>
    </div>,
    {
      duration: 30000, // Show for 30 seconds
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
    }
  );
};
