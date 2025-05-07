
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const AccountNotFound: React.FC<{
  onBack: () => void;
}> = ({ onBack }) => {
  return (
    <div className="p-6">
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Account Not Found</h2>
        <p className="text-muted-foreground mb-6">The requested account could not be found.</p>
        <Button onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Accounts
        </Button>
      </div>
    </div>
  );
};
