
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Owner, 
  Property, 
  OwnerPropertyAssignment 
} from '@/components/dashboard/types';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsSummaryCards } from '@/components/dashboard/StatsSummaryCards';
import { DataFilterTabs } from '@/components/dashboard/DataFilterTabs';
import { DataTables } from '@/components/dashboard/DataTables';
import { ActionsToolbar } from '@/components/dashboard/ActionsToolbar';
import { useAuth } from '@/contexts/AuthContext';
import { DataRecoveryButton } from './DataRecoveryButton';

interface DashboardLayoutProps {
  owners: Owner[];
  properties: Property[];
  assignments: OwnerPropertyAssignment[];
  onSignOut: () => Promise<void>;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  onRefresh: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  owners,
  properties,
  assignments,
  onSignOut,
  activeFilter,
  setActiveFilter,
  onRefresh
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get user's name from user metadata
  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    return 'there';
  };

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader onSignOut={onSignOut} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {getUserName()}!</h1>
          <ActionsToolbar />
        </div>

        <StatsSummaryCards 
          ownersCount={owners.length} 
          propertiesCount={properties.length} 
          assignmentsCount={assignments.length}
          userId={user?.id || ''}
        />

        <div className="bg-white rounded-xl mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Overview</h2>
            <div className="flex items-center gap-2">
              {(owners.length === 0 && properties.length === 0) && (
                <DataRecoveryButton onDataRecovered={onRefresh} />
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <DataFilterTabs activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            <DataTables 
              properties={properties} 
              owners={owners} 
              assignments={assignments} 
              activeFilter={activeFilter}
              onRefresh={onRefresh}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
