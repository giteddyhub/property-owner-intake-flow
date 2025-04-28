
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardHeaderProps {
  onSignOut: () => Promise<void>;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onSignOut }) => {
  const { user } = useAuth();

  const getUserInitials = () => {
    if (!user || !user.user_metadata || !user.user_metadata.full_name) return 'U';
    const fullName = user.user_metadata.full_name;
    const nameParts = fullName.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`;
    }
    return nameParts[0][0] || 'U';
  };

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
            <Avatar className="h-8 w-8 cursor-pointer" onClick={onSignOut}>
              <AvatarFallback className="bg-blue-100 text-blue-800">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
};
