
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
import { WelcomeSection } from '@/components/dashboard/WelcomeSection';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useDashboardActions } from '@/components/dashboard/hooks/useDashboardActions';
import OwnerDrawer from '@/components/dashboard/drawers/OwnerDrawer';
import PropertyDrawer from '@/components/dashboard/drawers/PropertyDrawer';
import AssignmentDrawer from '@/components/dashboard/drawers/AssignmentDrawer';

interface DashboardLayoutProps {
  owners: Owner[];
  properties: Property[];
  assignments: OwnerPropertyAssignment[];
  totalRevenue: number;
  onSignOut: () => Promise<void>;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  onRefresh: () => void;
  userId: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  owners,
  properties,
  assignments,
  totalRevenue,
  onSignOut,
  activeFilter,
  setActiveFilter,
  onRefresh,
  userId
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    activeDrawer,
    selectedItem,
    openOwnerDrawer,
    openPropertyDrawer,
    openAssignmentDrawer,
    closeDrawer
  } = useDashboardActions();
  
  // Get user's name from user metadata
  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    return 'there';
  };

  // Check if initial setup is complete (same logic as WelcomeSection)
  const hasOwners = owners.length > 0;
  const hasProperties = properties.length > 0;
  const hasAssignments = assignments.length > 0;
  const isSetupComplete = hasOwners && hasProperties && hasAssignments;

  const handleDrawerSuccess = () => {
    onRefresh();
    closeDrawer();
  };

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader onSignOut={onSignOut} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Hello, {getUserName()}!</h1>
          <ActionsToolbar />
        </div>

        <WelcomeSection
          userName={getUserName()}
          hasOwners={hasOwners}
          hasProperties={hasProperties}
          hasAssignments={hasAssignments}
          onAddOwner={() => openOwnerDrawer()}
          onAddProperty={() => openPropertyDrawer()}
          onAddAssignment={() => openAssignmentDrawer()}
        />

        {/* Only show stats cards after initial setup is complete */}
        {isSetupComplete && (
          <StatsSummaryCards 
            ownersCount={owners.length} 
            propertiesCount={properties.length} 
            totalRevenue={totalRevenue}
            userId={userId}
          />
        )}

        <div className="bg-white rounded-xl mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Overview</h2>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <DataFilterTabs activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            <DataTables 
              properties={properties} 
              owners={owners} 
              assignments={assignments} 
              activeFilter={activeFilter}
              onRefresh={onRefresh}
              userId={userId}
              onOpenOwnerDrawer={openOwnerDrawer}
              onOpenPropertyDrawer={openPropertyDrawer}
              onOpenAssignmentDrawer={openAssignmentDrawer}
            />
          </div>
        </div>

        {/* Drawers */}
        <OwnerDrawer
          isOpen={activeDrawer === 'owner'}
          onClose={closeDrawer}
          owner={selectedItem}
          onSuccess={handleDrawerSuccess}
        />

        <PropertyDrawer
          isOpen={activeDrawer === 'property'}
          onClose={closeDrawer}
          property={selectedItem}
          onSuccess={handleDrawerSuccess}
        />

        <AssignmentDrawer
          isOpen={activeDrawer === 'assignment'}
          onClose={closeDrawer}
          assignment={selectedItem}
          properties={properties}
          owners={owners}
          onSuccess={handleDrawerSuccess}
          userId={userId}
        />
      </main>
    </div>
  );
};
