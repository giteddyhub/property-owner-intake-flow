
import React from 'react';
import { OwnerPropertyAssignment, Owner, Property } from '@/components/dashboard/types';
import { AdminDataTable } from '@/components/admin/tables/AdminDataTable';
import { Badge } from '@/components/ui/badge';

interface AssignmentsTableProps {
  assignments: OwnerPropertyAssignment[];
  owners: Owner[];
  properties: Property[];
  onRefresh: () => void;
  userId: string;
  onShowUserOverview?: (userId: string, context?: { type: 'property' | 'owner' | 'assignment'; id: string }) => void;
}

export const AssignmentsTable: React.FC<AssignmentsTableProps> = ({ 
  assignments, 
  owners, 
  properties,
  onRefresh,
  userId,
  onShowUserOverview 
}) => {
  // Enrich assignments with owner and property data
  const enrichedAssignments = assignments.map(assignment => {
    const owner = owners.find(o => o.id === assignment.ownerId);
    const property = properties.find(p => p.id === assignment.propertyId);
    
    return {
      ...assignment,
      ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown Owner',
      propertyLabel: property?.label || 'Unknown Property'
    };
  });

  const columns = [
    {
      key: 'propertyLabel',
      header: 'Property',
      className: 'font-medium'
    },
    {
      key: 'ownerName',
      header: 'Owner',
      className: 'font-medium'
    },
    {
      key: 'ownershipPercentage',
      header: 'Ownership %',
      render: (percentage: number) => `${percentage}%`
    },
    {
      key: 'residentAtProperty',
      header: 'Resident',
      render: (resident: boolean) => (
        <Badge variant={resident ? "default" : "secondary"}>
          {resident ? 'Yes' : 'No'}
        </Badge>
      )
    },
    {
      key: 'taxCredits',
      header: 'Tax Credits',
      render: (credits: number) => credits ? `€${credits.toLocaleString()}` : '-'
    }
  ];

  return (
    <AdminDataTable
      data={enrichedAssignments}
      columns={columns}
      onShowUserOverview={onShowUserOverview}
      contextType="assignment"
    />
  );
};
