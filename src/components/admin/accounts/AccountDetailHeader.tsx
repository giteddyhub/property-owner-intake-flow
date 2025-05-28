
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface AccountDetailHeaderProps {
  accountName: string;
  onBack: () => void;
}

export const AccountDetailHeader: React.FC<AccountDetailHeaderProps> = ({
  accountName,
  onBack
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <Button variant="outline" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Accounts
      </Button>
    </div>
  );
};
