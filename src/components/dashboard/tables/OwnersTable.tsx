
import React from 'react';
import { Owner } from '@/components/dashboard/types';
import { AdminDataTable } from '@/components/admin/tables/AdminDataTable';
import { Badge } from '@/components/ui/badge';

interface OwnersTableProps {
  owners: Owner[];
  onRefresh: () => void;
  onShowUserOverview?: (userId: string, context?: { type: 'property' | 'owner' | 'assignment'; id: string }) => void;
}

export const OwnersTable: React.FC<OwnersTableProps> = ({ 
  owners, 
  onRefresh,
  onShowUserOverview 
}) => {
  const columns = [
    {
      key: 'firstName',
      header: 'First Name',
      className: 'font-medium'
    },
    {
      key: 'lastName',
      header: 'Last Name',
      className: 'font-medium'
    },
    {
      key: 'italianTaxCode',
      header: 'Tax Code'
    },
    {
      key: 'citizenship',
      header: 'Citizenship'
    },
    {
      key: 'isResidentInItaly',
      header: 'IT Resident',
      render: (resident: boolean) => (
        <Badge variant={resident ? "default" : "secondary"}>
          {resident ? 'Yes' : 'No'}
        </Badge>
      )
    }
  ];

  return (
    <AdminDataTable
      data={owners}
      columns={columns}
      onShowUserOverview={onShowUserOverview}
      contextType="owner"
    />
  );
};
