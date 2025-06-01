
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User, FileText, Home, Users as UsersIcon } from 'lucide-react';
import { AccountData } from '@/types/admin';

interface AccountStatsCardsProps {
  accounts: AccountData[];
}

export const AccountStatsCards: React.FC<AccountStatsCardsProps> = ({ accounts }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Accounts</p>
              <p className="text-2xl font-bold">{accounts.length}</p>
            </div>
            <User className="h-8 w-8 text-muted-foreground opacity-70" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">User Sessions</p>
              <p className="text-2xl font-bold">{accounts.reduce((sum, account) => sum + account.submissions_count, 0)}</p>
            </div>
            <FileText className="h-8 w-8 text-muted-foreground opacity-70" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Properties</p>
              <p className="text-2xl font-bold">{accounts.reduce((sum, account) => sum + account.properties_count, 0)}</p>
            </div>
            <Home className="h-8 w-8 text-muted-foreground opacity-70" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Owners</p>
              <p className="text-2xl font-bold">{accounts.reduce((sum, account) => sum + account.owners_count, 0)}</p>
            </div>
            <UsersIcon className="h-8 w-8 text-muted-foreground opacity-70" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
