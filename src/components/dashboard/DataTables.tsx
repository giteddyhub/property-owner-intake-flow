
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
}

export const DataTables: React.FC<DataTablesProps> = ({ 
  properties, 
  owners, 
  assignments 
}) => {
  return (
    <Tabs defaultValue="properties" className="w-full">
      <TabsList className="border-b border-gray-100 w-full justify-start mb-6 bg-transparent">
        <TabsTrigger value="properties" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none bg-transparent px-4 py-2">
          Properties
        </TabsTrigger>
        <TabsTrigger value="owners" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none bg-transparent px-4 py-2">
          Owners
        </TabsTrigger>
        <TabsTrigger value="assignments" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none bg-transparent px-4 py-2">
          Assignments
        </TabsTrigger>
      </TabsList>
      
      <PropertiesTable properties={properties} />
      <OwnersTable owners={owners} />
      <AssignmentsTable assignments={assignments} owners={owners} properties={properties} />
    </Tabs>
  );
};
