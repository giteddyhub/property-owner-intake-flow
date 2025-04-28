
import React from 'react';
import { Owner } from '@/components/dashboard/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface OwnerDetailsProps {
  owner: Owner;
}

export const OwnerDetails: React.FC<OwnerDetailsProps> = ({ owner }) => {
  return (
    <div className="space-y-4">
      <div className="border-b pb-2">
        <h3 className="text-lg font-medium">{owner.firstName} {owner.lastName}</h3>
        <span className="text-sm text-muted-foreground">
          Tax Code: {owner.italianTaxCode}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <p className="text-sm font-medium">Citizenship</p>
          <p className="text-sm">{owner.citizenship}</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium">Residency Status</p>
          <Badge variant={owner.isResidentInItaly ? "default" : "outline"}>
            {owner.isResidentInItaly ? "Italian Resident" : "Non-Resident"}
          </Badge>
        </div>
      </div>
      
      {owner.dateOfBirth && (
        <div className="space-y-1">
          <p className="text-sm font-medium">Date of Birth</p>
          <p className="text-sm">{format(owner.dateOfBirth, 'MMMM d, yyyy')}</p>
        </div>
      )}

      <div className="border-t pt-2">
        <p className="text-sm font-medium">Address</p>
        <p className="text-sm mt-1">
          {owner.address.street}<br />
          {owner.address.city}, {owner.address.zip}<br />
          {owner.address.country}
        </p>
      </div>

      {owner.isResidentInItaly && owner.italianResidenceDetails && (
        <div className="border-t pt-2">
          <p className="text-sm font-medium">Italian Residence</p>
          <p className="text-sm mt-1">
            {owner.italianResidenceDetails.street}<br />
            {owner.italianResidenceDetails.city}, {owner.italianResidenceDetails.zip}
          </p>
        </div>
      )}

      <div className="border-t pt-2">
        <p className="text-sm font-medium">Personal Details</p>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div>
            <p className="text-sm text-muted-foreground">Marital Status</p>
            <p className="text-sm">{owner.maritalStatus}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Birth Country</p>
            <p className="text-sm">{owner.countryOfBirth || 'Not specified'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
