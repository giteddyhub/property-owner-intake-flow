
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
}

export const DataTables: React.FC<DataTablesProps> = ({ 
  properties, 
  owners, 
  assignments,
  activeFilter
}) => {
  // Render the appropriate table based on the activeFilter
  return (
    <div className="w-full">
      {activeFilter === 'properties' && (
        <PropertiesTable properties={properties} />
      )}
      {activeFilter === 'owners' && (
        <OwnersTable owners={owners} />
      )}
      {activeFilter === 'assignments' && (
        <AssignmentsTable assignments={assignments} owners={owners} properties={properties} />
      )}
    </div>
  );
};
