
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
  userId: string; // Added userId prop
}

export const DataTables: React.FC<DataTablesProps> = ({ 
  properties, 
  owners, 
  assignments,
  activeFilter,
  onRefresh,
  userId // Accept userId prop
}) => {
  console.log("Assignments data in DataTables:", assignments);
  
  // Render the appropriate table based on the activeFilter
  return (
    <div className="w-full">
      {activeFilter === 'properties' && (
        <PropertiesTable properties={properties} onRefresh={onRefresh} />
      )}
      {activeFilter === 'owners' && (
        <OwnersTable owners={owners} onRefresh={onRefresh} />
      )}
      {activeFilter === 'assignments' && (
        <AssignmentsTable 
          assignments={assignments} 
          owners={owners} 
          properties={properties}
          onRefresh={onRefresh} 
          userId={userId} // Pass userId
        />
      )}
    </div>
  );
};
