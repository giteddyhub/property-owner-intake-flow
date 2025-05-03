
import React from 'react';
import { Owner, Property, OwnerPropertyAssignment } from '@/components/dashboard/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface AssignmentDetailsProps {
  assignment: OwnerPropertyAssignment;
  owner?: Owner;
  property?: Property;
}

export const AssignmentDetails: React.FC<AssignmentDetailsProps> = ({ 
  assignment,
  owner,
  property
}) => {
  return (
    <div className="space-y-4">
      <div className="border-b pb-2">
        <h3 className="text-lg font-medium">Ownership Details</h3>
        <span className="text-sm text-muted-foreground">
          Ownership: {assignment.ownershipPercentage}%
        </span>
      </div>

      {owner && (
        <div className="space-y-1">
          <p className="text-sm font-medium">Owner</p>
          <div className="bg-muted p-2 rounded-md">
            <p className="font-medium">{owner.firstName} {owner.lastName}</p>
            <p className="text-sm text-muted-foreground">Tax Code: {owner.italianTaxCode}</p>
          </div>
        </div>
      )}
      
      {property && (
        <div className="space-y-1">
          <p className="text-sm font-medium">Property</p>
          <div className="bg-muted p-2 rounded-md">
            <p className="font-medium">{property.label}</p>
            <p className="text-sm text-muted-foreground">
              {property.address.street}, {property.address.comune}
            </p>
          </div>
        </div>
      )}

      <div className="border-t pt-2">
        <p className="text-sm font-medium">Residency Status</p>
        {assignment.residentAtProperty ? (
          <div className="mt-1">
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Resident at Property
            </Badge>
            
            {assignment.residentDateRange?.from && (
              <div className="mt-2 text-sm">
                <p className="text-muted-foreground">Residence Period:</p>
                <p>
                  From: {format(new Date(assignment.residentDateRange.from), 'MMM d, yyyy')}
                  {assignment.residentDateRange.to && 
                    ` to ${format(new Date(assignment.residentDateRange.to), 'MMM d, yyyy')}`
                  }
                </p>
              </div>
            )}
          </div>
        ) : (
          <Badge variant="outline" className="mt-1">Non-Resident at Property</Badge>
        )}
      </div>

      {assignment.taxCredits !== undefined && assignment.taxCredits !== null && (
        <div className="border-t pt-2">
          <p className="text-sm font-medium">Tax Credits</p>
          <p className="text-sm mt-1">
            €{assignment.taxCredits.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};
