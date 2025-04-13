
import React from 'react';
import { format } from 'date-fns';
import { Owner } from '@/types/form';
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

interface OwnerReviewCardProps {
  owner: Owner;
}

const OwnerReviewCard: React.FC<OwnerReviewCardProps> = ({ owner }) => {
  return (
    <Card key={owner.id} className="border border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{owner.firstName} {owner.lastName}</CardTitle>
        <CardDescription>
          Born: {owner.dateOfBirth ? format(new Date(owner.dateOfBirth), 'PPP') : 'N/A'} • 
          Citizenship: {owner.citizenship}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm">
        <p className="mb-1">
          <span className="font-medium">Address:</span> {owner.address.street}, {owner.address.city}, {owner.address.zip}, {owner.address.country}
        </p>
        <p className="mb-1">
          <span className="font-medium">Marital Status:</span> {owner.maritalStatus.charAt(0) + owner.maritalStatus.slice(1).toLowerCase()}
        </p>
        {owner.italianTaxCode && (
          <p className="mb-1">
            <span className="font-medium">Italian Tax Code:</span> {owner.italianTaxCode}
          </p>
        )}
        <p className="mb-1">
          <span className="font-medium">Italian Resident:</span> {owner.isResidentInItaly ? 'Yes' : 'No'}
        </p>
        {owner.isResidentInItaly && owner.italianResidenceDetails && (
          <>
            <p className="mb-1">
              <span className="font-medium">Residency Details:</span> {owner.italianResidenceDetails.comuneName}
            </p>
            <p className="mb-1">
              <span className="font-medium">Italian Address:</span> {owner.italianResidenceDetails.street}, {owner.italianResidenceDetails.city}, {owner.italianResidenceDetails.zip}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default OwnerReviewCard;
