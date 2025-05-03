
import React from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { UserDropdownMenu } from '@/components/dashboard/UserDropdownMenu';

interface DashboardHeaderProps {
  onSignOut: () => Promise<void>;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onSignOut }) => {
  const { user } = useAuth();

  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/48bc5456-f226-4712-9539-95497e28024c.png" 
            alt="ItalianTaxes.com Logo" 
            className="h-10 w-auto object-contain"
          />
          <span className="font-semibold text-xl text-gray-900">ItalianTaxes.com</span>
        </div>

        <div className="flex items-center">
          <div className="relative">
            <UserDropdownMenu onSignOut={onSignOut} />
          </div>
        </div>
      </div>
    </header>
  );
};
