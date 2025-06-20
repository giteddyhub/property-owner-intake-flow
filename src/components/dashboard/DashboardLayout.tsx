
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
import { DataTableToolbar } from '@/components/dashboard/DataTableToolbar';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useDashboardActions } from '@/components/dashboard/hooks/useDashboardActions';
import { useTableSearch } from '@/hooks/useTableSearch';
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
  isAutoRefreshing: boolean;
  onToggleAutoRefresh: () => void;
  isRefreshing: boolean;
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
  userId,
  isAutoRefreshing,
  onToggleAutoRefresh,
  isRefreshing
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
  
  // Set up search functionality based on active filter
  const getSearchConfig = () => {
    switch (activeFilter) {
      case 'owners':
        return {
          data: owners,
          searchFields: ['first_name', 'last_name', 'italian_tax_code', 'address_city'] as (keyof Owner)[],
          placeholder: 'Search owners...',
          filename: 'owners'
        };
      case 'properties':
        return {
          data: properties,
          searchFields: ['label', 'address_street', 'address_comune', 'property_type'] as (keyof Property)[],
          placeholder: 'Search properties...',
          filename: 'properties'
        };
      case 'assignments':
        return {
          data: assignments,
          searchFields: [] as (keyof OwnerPropertyAssignment)[],
          placeholder: 'Search assignments...',
          filename: 'assignments'
        };
      default:
        return {
          data: properties,
          searchFields: ['label', 'address_street', 'address_comune'] as (keyof Property)[],
          placeholder: 'Search...',
          filename: 'data'
        };
    }
  };

  const searchConfig = getSearchConfig();
  const { 
    searchTerm, 
    setSearchTerm, 
    filteredAndSortedData,
    sortField,
    sortDirection,
    handleSort
  } = useTableSearch(searchConfig);
  
  // Get user's name from user metadata
  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    return 'there';
  };

  const handleDrawerSuccess = () => {
    onRefresh();
    closeDrawer();
  };

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader onSignOut={onSignOut} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {getUserName()}!</h1>
          <ActionsToolbar />
        </div>

        <WelcomeSection
          userName={getUserName()}
          hasOwners={owners.length > 0}
          hasProperties={properties.length > 0}
          hasAssignments={assignments.length > 0}
          onAddOwner={() => openOwnerDrawer()}
          onAddProperty={() => openPropertyDrawer()}
          onAddAssignment={() => openAssignmentDrawer()}
        />

        <StatsSummaryCards 
          ownersCount={owners.length} 
          propertiesCount={properties.length} 
          totalRevenue={totalRevenue}
          userId={userId}
        />

        <div className="bg-white rounded-xl mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Overview</h2>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <DataFilterTabs activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            
            <DataTableToolbar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder={searchConfig.placeholder}
              onRefresh={onRefresh}
              isAutoRefreshing={isAutoRefreshing}
              onToggleAutoRefresh={onToggleAutoRefresh}
              exportData={filteredAndSortedData}
              exportFilename={searchConfig.filename}
              isRefreshing={isRefreshing}
            />
            
            <DataTables 
              properties={activeFilter === 'properties' ? filteredAndSortedData as Property[] : properties}
              owners={activeFilter === 'owners' ? filteredAndSortedData as Owner[] : owners}
              assignments={activeFilter === 'assignments' ? filteredAndSortedData as OwnerPropertyAssignment[] : assignments}
              activeFilter={activeFilter}
              onRefresh={onRefresh}
              userId={userId}
              onOpenOwnerDrawer={openOwnerDrawer}
              onOpenPropertyDrawer={openPropertyDrawer}
              onOpenAssignmentDrawer={openAssignmentDrawer}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
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
