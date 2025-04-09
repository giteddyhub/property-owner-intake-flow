
import React from 'react';
import { useFormContext } from '@/contexts/FormContext';
import { Button } from '@/components/ui/button';
import FormNavigation from '@/components/form/FormNavigation';
import { format } from 'date-fns';
import { Check, Download, Edit } from 'lucide-react';
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ActivityType, OccupancyStatus, Owner, Property } from '@/types/form';

const ReviewStep: React.FC = () => {
  const { state, goToStep } = useFormContext();
  const { owners, properties, assignments } = state;
  
  // Get assignments for a specific property
  const getPropertyAssignments = (propertyId: string) => {
    return assignments.filter(assignment => assignment.propertyId === propertyId);
  };
  
  // Get owner by ID
  const getOwnerById = (ownerId: string) => {
    return owners.find(owner => owner.id === ownerId);
  };
  
  // Get total ownership percentage for a property
  const getTotalPercentage = (propertyId: string) => {
    return getPropertyAssignments(propertyId)
      .reduce((sum, assignment) => sum + assignment.ownershipPercentage, 0);
  };
  
  // Format property activity
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
  
  // Format occupancy status
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
  
  const handleSubmit = () => {
    // Here we would normally send the data to the backend
    toast.success('Form submitted successfully!', {
      description: 'Thank you for completing the property owner intake process.',
      duration: 5000,
    });
    
    // Display confirmation message
    setTimeout(() => {
      toast("Your submission has been received", {
        description: "A confirmation email has been sent with a summary of your submission.",
        action: {
          label: "Download Summary",
          onClick: () => handleDownloadSummary(),
        },
      });
    }, 1000);
  };
  
  const handleDownloadSummary = () => {
    // Create a JSON string of the form data
    const formData = {
      owners,
      properties,
      assignments,
      submittedAt: new Date().toISOString()
    };
    
    // Convert to JSON string
    const jsonString = JSON.stringify(formData, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'property-owner-submission.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Summary downloaded successfully');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-form-400">Review & Submit</h2>
      
      <p className="mb-6 text-gray-600">
        Please review all the information below before submitting. You can go back to make changes if needed.
      </p>
      
      {/* Owners Summary */}
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
                  <p className="mb-1">
                    <span className="font-medium">Residency Details:</span> {owner.italianResidenceDetails.comuneName}, 
                    {owner.italianResidenceDetails.fullYear 
                      ? ' Full Year' 
                      : owner.italianResidenceDetails.startDate 
                        ? ` From ${format(new Date(owner.italianResidenceDetails.startDate), 'PPP')}` 
                        : ' Partial Year'}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Properties Summary */}
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
                      <p className="font-medium">Occupancy Status</p>
                      <p>{formatOccupancyStatus(property.occupancyStatus)} ({property.monthsOccupied} months)</p>
                    </div>
                    <div>
                      <p className="font-medium">Remodeling in 2024</p>
                      <p>{property.remodeling ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      
      {/* Assignments Summary */}
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
      
      {/* Submit Button */}
      <div className="flex justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={() => goToStep(3)}
          className="flex items-center gap-2"
        >
          Back
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleDownloadSummary}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Summary
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-form-300 hover:bg-form-400 text-white"
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
