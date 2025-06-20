
import React from 'react';
import { 
  Owner, 
  Property, 
  OwnerPropertyAssignment
} from '@/components/dashboard/types';
import { PropertiesTable } from './tables/PropertiesTable';
import { OwnersTable } from './tables/OwnersTable';
import { AssignmentsTable } from './tables/AssignmentsTable';

interface DataTablesProps {
  properties: Property[];
  owners: Owner[];
  assignments: OwnerPropertyAssignment[];
  activeFilter: string;
  onRefresh: () => void;
  userId: string;
  onShowUserOverview?: (userId: string, context?: { type: 'property' | 'owner' | 'assignment'; id: string }) => void;
  onOpenOwnerDrawer: (owner?: Owner) => void;
  onOpenPropertyDrawer: (property?: Property) => void;
  onOpenAssignmentDrawer: (assignment?: OwnerPropertyAssignment) => void;
}

export const DataTables: React.FC<DataTablesProps> = ({ 
  properties, 
  owners, 
  assignments,
  activeFilter,
  onRefresh,
  userId,
  onShowUserOverview,
  onOpenOwnerDrawer,
  onOpenPropertyDrawer,
  onOpenAssignmentDrawer
}) => {
  console.log("Assignments data in DataTables:", assignments);
  
  // Render the appropriate table based on the activeFilter
  return (
    <div className="w-full">
      {activeFilter === 'properties' && (
        <PropertiesTable 
          properties={properties} 
          onRefresh={onRefresh}
          onShowUserOverview={onShowUserOverview}
          onOpenDrawer={onOpenPropertyDrawer}
        />
      )}
      {activeFilter === 'owners' && (
        <OwnersTable 
          owners={owners} 
          onRefresh={onRefresh}
          onShowUserOverview={onShowUserOverview}
          onOpenDrawer={onOpenOwnerDrawer}
        />
      )}
      {activeFilter === 'assignments' && (
        <AssignmentsTable 
          assignments={assignments} 
          owners={owners} 
          properties={properties}
          onRefresh={onRefresh} 
          userId={userId}
          onShowUserOverview={onShowUserOverview}
          onOpenDrawer={onOpenAssignmentDrawer}
        />
      )}
    </div>
  );
};
