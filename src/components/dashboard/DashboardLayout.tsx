
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
import { AlertCircle } from 'lucide-react';

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
  
  // Check if there's any data
  const hasNoData = owners.length === 0 && properties.length === 0;
  
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
              {hasNoData && (
                <DataRecoveryButton onDataRecovered={onRefresh} />
              )}
            </div>
          </div>

          {hasNoData ? (
            <div className="bg-gray-50 rounded-xl p-8 mb-4 text-center">
              <div className="max-w-md mx-auto">
                <div className="flex justify-center mb-4">
                  <AlertCircle className="h-12 w-12 text-amber-500" />
                </div>
                <h3 className="text-xl font-medium mb-2">No Data Found</h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any properties, owners, or assignments associated with your account.
                  If you previously filled out our form, you can use the button below to recover your data.
                </p>
                <div className="flex justify-center">
                  <DataRecoveryButton onDataRecovered={onRefresh} prominent={true} />
                </div>
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </main>
    </div>
  );
};
