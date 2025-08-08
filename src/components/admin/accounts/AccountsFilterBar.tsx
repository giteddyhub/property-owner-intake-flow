
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { showAdminCredentialsToast } from '@/components/admin/auth/AdminCredentialsToast';

interface AccountsFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  fetchAccounts: () => Promise<void>;
  loading: boolean;
}

export const AccountsFilterBar: React.FC<AccountsFilterBarProps> = ({ 
  searchQuery, 
  setSearchQuery 
}) => {
  const [rotating, setRotating] = useState(false);

  const handleRotate = async () => {
    try {
      setRotating(true);
      const raw = localStorage.getItem('admin_session');
      const stored = raw ? JSON.parse(raw) : null;
      const adminToken = stored?.session?.token;
      if (!adminToken) {
        toast.error('Admin session not found. Please log in again.');
        return;
      }

      const targetEmail = 'david@italiantaxes.com';
      const { data, error } = await supabase.functions.invoke('rotate-admin-password', {
        body: { admin_token: adminToken, target_email: targetEmail },
      });

      if (error) {
        console.error('Password rotation failed:', error);
        toast.error(error.message || 'Failed to rotate password');
        return;
      }

      if (data?.new_password) {
        toast.success('Password rotated successfully. Showing new password...');
        showAdminCredentialsToast({ email: targetEmail, password: data.new_password });
      } else {
        toast.error('Rotation succeeded but no password returned.');
      }
    } catch (e: any) {
      console.error('Unexpected error rotating password:', e);
      toast.error(e?.message || 'Unexpected error');
    } finally {
      setRotating(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">User Accounts</h2>
        <p className="text-muted-foreground">View and manage all user accounts in the system.</p>
      </div>
      
      <div className="flex gap-3 items-center w-full md:w-auto">
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
          />
        </div>
        <Button variant="destructive" onClick={handleRotate} disabled={rotating}>
          <KeyRound className="h-4 w-4 mr-2" />
          {rotating ? 'Rotating…' : "Rotate David's Password"}
        </Button>
      </div>
    </div>
  );
};
