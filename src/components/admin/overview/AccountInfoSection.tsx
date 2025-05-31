
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { AccountData } from '@/types/admin';

interface AccountInfoSectionProps {
  account: AccountData;
}

export const AccountInfoSection: React.FC<AccountInfoSectionProps> = ({ account }) => {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-3">Account Information</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-muted-foreground">Name:</span>
          <p>{account.full_name || 'No Name'}</p>
        </div>
        <div>
          <span className="font-medium text-muted-foreground">Email:</span>
          <p>{account.email}</p>
        </div>
        <div>
          <span className="font-medium text-muted-foreground">Created:</span>
          <p>{format(new Date(account.created_at), 'MMM dd, yyyy')}</p>
        </div>
        <div>
          <span className="font-medium text-muted-foreground">Status:</span>
          <Badge variant={account.is_admin ? "default" : "secondary"}>
            {account.is_admin ? 'Admin' : 'User'}
          </Badge>
        </div>
      </div>
    </div>
  );
};
