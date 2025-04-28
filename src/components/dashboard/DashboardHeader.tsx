
import React from 'react';
import { Search, Settings } from 'lucide-react';
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
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
            <span className="text-white font-semibold">UI</span>
          </div>
          <span className="font-semibold text-gray-900">Property Dashboard</span>
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-gray-500 hover:text-gray-900">
            <Search className="h-5 w-5" />
          </button>
          <button className="text-gray-500 hover:text-gray-900">
            <Settings className="h-5 w-5" />
          </button>
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
