
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

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
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">User Accounts</h2>
        <p className="text-muted-foreground">View and manage all user accounts in the system.</p>
      </div>
      
      <div className="w-full md:w-auto">
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
      </div>
    </div>
  );
};
