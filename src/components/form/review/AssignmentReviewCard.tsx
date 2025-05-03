
import React from 'react';
import { format } from 'date-fns';
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import { hasRentalStatus } from './PropertyReviewCard';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface AssignmentReviewCardProps {
  property: Property;
  propertyAssignments: OwnerPropertyAssignment[];
  totalPercentage: number;
  getOwnerById: (ownerId: string) => Owner | undefined;
}

const AssignmentReviewCard: React.FC<AssignmentReviewCardProps> = ({ 
  property, 
  propertyAssignments, 
  totalPercentage, 
  getOwnerById 
}) => {
  return (
    <Card key={property.id} className="border border-gray-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            {property.label || `Property in ${property.address.comune}`}
          </CardTitle>
          <Badge 
            className={cn(
              "ml-2",
              totalPercentage === 100 
                ? "bg-green-100 text-green-800 hover:bg-green-100" 
                : totalPercentage > 100
                  ? "bg-red-100 text-red-800 hover:bg-red-100"
                  : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
            )}
            variant="outline"
          >
            {totalPercentage}% Assigned
          </Badge>
        </div>
        <CardDescription>
          {property.address.street}, {property.address.comune}, {property.address.province}
          {hasRentalStatus(property) && property.rentalIncome !== undefined && (
            <span className="font-medium ml-2">
              • Rental Income: €{property.rentalIncome.toLocaleString()}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Owner</TableHead>
              <TableHead className="text-center">Ownership %</TableHead>
              <TableHead className="text-center">Resident</TableHead>
              <TableHead>Residence Period</TableHead>
              <TableHead className="text-right">Tax Credits</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {propertyAssignments.map((assignment) => {
              const owner = getOwnerById(assignment.ownerId);
              if (!owner) return null;
              
              return (
                <TableRow key={`${property.id}-${owner.id}`}>
                  <TableCell className="font-medium">
                    {owner.firstName} {owner.lastName}
                  </TableCell>
                  <TableCell className="text-center">
                    {assignment.ownershipPercentage}%
                  </TableCell>
                  <TableCell className="text-center">
                    {assignment.residentAtProperty ? (
                      <Check className="h-4 w-4 text-green-600 mx-auto" />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    {assignment.residentAtProperty && assignment.residentDateRange ? (
                      assignment.residentDateRange.from ? (
                        assignment.residentDateRange.to ? (
                          `${format(new Date(assignment.residentDateRange.from), 'PP')} - ${format(new Date(assignment.residentDateRange.to), 'PP')}`
                        ) : (
                          `From ${format(new Date(assignment.residentDateRange.from), 'PP')}`
                        )
                      ) : (
                        'Full Year'
                      )
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {assignment.taxCredits !== undefined && assignment.taxCredits !== null
                      ? `€${assignment.taxCredits.toLocaleString()}` 
                      : '—'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AssignmentReviewCard;
