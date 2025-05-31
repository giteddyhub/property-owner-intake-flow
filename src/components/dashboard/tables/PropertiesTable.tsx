
import React from 'react';
import { Property } from '@/components/dashboard/types';
import { AdminDataTable } from '@/components/admin/tables/AdminDataTable';
import { Badge } from '@/components/ui/badge';

interface PropertiesTableProps {
  properties: Property[];
  onRefresh: () => void;
  onShowUserOverview?: (userId: string, context?: { type: 'property' | 'owner' | 'assignment'; id: string }) => void;
}

export const PropertiesTable: React.FC<PropertiesTableProps> = ({ 
  properties, 
  onRefresh,
  onShowUserOverview 
}) => {
  const columns = [
    {
      key: 'label',
      header: 'Property Label',
      className: 'font-medium'
    },
    {
      key: 'address',
      header: 'Address',
      render: (address: any) => `${address?.comune || ''}, ${address?.province || ''}`
    },
    {
      key: 'propertyType',
      header: 'Type',
      render: (type: string) => (
        <Badge variant="outline">{type}</Badge>
      )
    },
    {
      key: 'activity2024',
      header: 'Activity 2024',
      render: (activity: string) => (
        <Badge variant="secondary">{activity}</Badge>
      )
    }
  ];

  return (
    <AdminDataTable
      data={properties}
      columns={columns}
      onShowUserOverview={onShowUserOverview}
      contextType="property"
    />
  );
};
