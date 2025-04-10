
import React from 'react';
import { useFormContext } from '@/contexts/FormContext';
import { Button } from '@/components/ui/button';
import FormNavigation from '@/components/form/FormNavigation';
import { format } from 'date-fns';
import { Check, Edit } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ActivityType, OccupancyStatus, Owner, Property } from '@/types/form';

const ReviewStep: React.FC = () => {
  const { state, goToStep, nextStep } = useFormContext();
  const { owners, properties, assignments } = state;
  
  const getPropertyAssignments = (propertyId: string) => {
    return assignments.filter(assignment => assignment.propertyId === propertyId);
  };
  
  const getOwnerById = (ownerId: string) => {
    return owners.find(owner => owner.id === ownerId);
  };
  
  const getTotalPercentage = (propertyId: string) => {
    return getPropertyAssignments(propertyId)
      .reduce((sum, assignment) => sum + assignment.ownershipPercentage, 0);
  };
  
  const formatActivity = (activity: ActivityType) => {
    switch (activity) {
      case 'purchased':
        return 'Purchased in 2024';
      case 'sold':
        return 'Sold in 2024';
      case 'both':
        return 'Purchased & Sold in 2024';
      case 'neither':
        return 'Owned all year';
      default:
        return activity;
    }
  };
  
  const formatOccupancyStatus = (status: OccupancyStatus) => {
    switch (status) {
      case 'PERSONAL_USE':
        return 'Personal Use';
      case 'LONG_TERM_RENT':
        return 'Long-term Rental';
      case 'SHORT_TERM_RENT':
        return 'Short-term Rental';
      default:
        return status;
    }
  };
  
  const formatOccupancyStatuses = (statuses: OccupancyStatus[]) => {
    const statusMap = {
      PERSONAL_USE: 'Personal Use',
      LONG_TERM_RENT: 'Long-term Rental',
      SHORT_TERM_RENT: 'Short-term Rental'
    };
    
    return statuses.map(status => statusMap[status]).join(', ');
  };

  const hasRentalStatus = (property: Property) => {
    return property.occupancyStatuses.some(
      status => status === 'LONG_TERM_RENT' || status === 'SHORT_TERM_RENT'
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-form-400">Review & Verify</h2>
      
      <p className="mb-6 text-gray-600">
        Please review all the information below before proceeding to submit. You can go back to make changes if needed.
      </p>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Owners</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => goToStep(1)}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {owners.map((owner, index) => (
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
          ))}
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Properties</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => goToStep(2)}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>
        
        <Accordion type="multiple" className="w-full space-y-4">
          {properties.map((property) => (
            <AccordionItem 
              key={property.id} 
              value={property.id}
              className="border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 bg-gray-50 hover:bg-gray-100">
                <div className="flex items-start w-full text-left">
                  <div>
                    <h3 className="font-medium">
                      {property.label || `Property in ${property.address.comune}`}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {property.address.street}, {property.address.comune}, {property.address.province}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 py-3 bg-white">
                <div className="text-sm">
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <p className="font-medium">Property Type</p>
                      <p>{property.propertyType.charAt(0) + property.propertyType.slice(1).toLowerCase()}</p>
                    </div>
                    <div>
                      <p className="font-medium">Activity in 2024</p>
                      <p>{formatActivity(property.activity2024)}</p>
                    </div>
                  </div>
                  
                  {(property.activity2024 === 'purchased' || property.activity2024 === 'both') && (
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <p className="font-medium">Purchase Date</p>
                        <p>{property.purchaseDate ? format(new Date(property.purchaseDate), 'PPP') : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="font-medium">Purchase Price</p>
                        <p>€{property.purchasePrice ? property.purchasePrice.toLocaleString() : 'N/A'}</p>
                      </div>
                    </div>
                  )}
                  
                  {(property.activity2024 === 'sold' || property.activity2024 === 'both') && (
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <p className="font-medium">Sale Date</p>
                        <p>{property.saleDate ? format(new Date(property.saleDate), 'PPP') : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="font-medium">Sale Price</p>
                        <p>€{property.salePrice ? property.salePrice.toLocaleString() : 'N/A'}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <p className="font-medium">Rental Status</p>
                      <p>{
                        Array.isArray(property.occupancyStatuses) 
                          ? formatOccupancyStatuses(property.occupancyStatuses) 
                          : 'Not specified'
                      } ({property.monthsOccupied} months)</p>
                    </div>
                    <div>
                      <p className="font-medium">Remodeling in 2024</p>
                      <p>{property.remodeling ? 'Yes' : 'No'}</p>
                    </div>
                  </div>

                  {hasRentalStatus(property) && property.rentalIncome !== undefined && (
                    <div className="border-t pt-2 mt-2">
                      <p className="font-medium">Rental Income for 2024</p>
                      <p className="text-lg font-semibold text-form-400">
                        €{property.rentalIncome.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Owner-Property Assignments</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => goToStep(3)}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>
        
        <div className="space-y-4">
          {properties.map((property) => {
            const propertyAssignments = getPropertyAssignments(property.id);
            const totalPercentage = getTotalPercentage(property.id);
            
            if (propertyAssignments.length === 0) {
              return null;
            }
            
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
                              {assignment.taxCredits !== undefined 
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
          })}
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={() => goToStep(3)}
          className="flex items-center gap-2"
        >
          Back
        </Button>
        
        <Button 
          onClick={() => nextStep()}
          className="bg-form-300 hover:bg-form-400 text-white"
        >
          Continue to Submit
        </Button>
      </div>
    </div>
  );
};

export default ReviewStep;
