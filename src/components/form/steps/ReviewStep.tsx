
import React, { useState } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Check, Edit, Download } from 'lucide-react';
import { toast } from 'sonner';
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
import { supabase } from '@/integrations/supabase/client';
import ContactInfoDialog from '../ContactInfoDialog';

const ReviewStep: React.FC = () => {
  const { state, goToStep, prevStep } = useFormContext();
  const { owners, properties, assignments } = state;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  
  const handleSubmitButtonClick = () => {
    setShowContactDialog(true);
  };
  
  const handleSubmit = async (contactInfo: { 
    fullName: string, 
    email: string, 
    termsAccepted: boolean, 
    privacyAccepted: boolean 
  }) => {
    try {
      setIsSubmitting(true);
      
      const ownerIdMap = new Map<string, string>();
      const propertyIdMap = new Map<string, string>();
      
      console.log("Starting submission process with:", {
        ownersCount: owners.length,
        propertiesCount: properties.length,
        assignmentsCount: assignments.length,
        contactInfo
      });
      
      // Save contact information first
      const { data: contactData, error: contactError } = await supabase
        .from('contacts')
        .insert({
          full_name: contactInfo.fullName,
          email: contactInfo.email,
          submitted_at: new Date().toISOString()
        })
        .select();
        
      if (contactError) {
        console.error("Error saving contact:", contactError);
        throw new Error(`Error saving contact: ${contactError.message}`);
      }
      
      const contactId = contactData?.[0]?.id;
      if (!contactId) {
        console.error("Contact was saved but no ID was returned");
        throw new Error("Failed to get database ID for contact");
      }
      
      for (const owner of owners) {
        console.log("Saving owner:", owner.firstName, owner.lastName);
        
        const { data: ownerData, error: ownerError } = await supabase
          .from('owners')
          .insert({
            first_name: owner.firstName,
            last_name: owner.lastName,
            date_of_birth: owner.dateOfBirth ? owner.dateOfBirth.toISOString().split('T')[0] : null,
            country_of_birth: owner.countryOfBirth,
            citizenship: owner.citizenship,
            address_street: owner.address.street,
            address_city: owner.address.city,
            address_zip: owner.address.zip,
            address_country: owner.address.country,
            italian_tax_code: owner.italianTaxCode,
            marital_status: owner.maritalStatus,
            is_resident_in_italy: owner.isResidentInItaly,
            spent_over_182_days: owner.italianResidenceDetails?.spentOver182Days,
            italian_residence_comune_name: owner.italianResidenceDetails?.comuneName,
            italian_residence_street: owner.italianResidenceDetails?.street,
            italian_residence_city: owner.italianResidenceDetails?.city,
            italian_residence_zip: owner.italianResidenceDetails?.zip,
            contact_id: contactId
          })
          .select();
          
        if (ownerError) {
          console.error("Error saving owner:", ownerError);
          throw new Error(`Error saving owner: ${ownerError.message}`);
        }
        
        if (ownerData && ownerData.length > 0) {
          ownerIdMap.set(owner.id, ownerData[0].id);
          console.log(`Mapped owner ${owner.id} to database ID ${ownerData[0].id}`);
        } else {
          console.error("Owner was saved but no data was returned");
          throw new Error("Failed to get database ID for owner");
        }
      }
      
      for (const property of properties) {
        console.log("Saving property:", property.label);
        
        const { data: propertyData, error: propertyError } = await supabase
          .from('properties')
          .insert({
            label: property.label,
            address_comune: property.address.comune,
            address_province: property.address.province,
            address_street: property.address.street,
            address_zip: property.address.zip,
            activity_2024: property.activity2024,
            purchase_date: property.purchaseDate ? property.purchaseDate.toISOString().split('T')[0] : null,
            purchase_price: property.purchasePrice,
            sale_date: property.saleDate ? property.saleDate.toISOString().split('T')[0] : null,
            sale_price: property.salePrice,
            property_type: property.propertyType,
            remodeling: property.remodeling,
            occupancy_statuses: property.occupancyStatuses,
            months_occupied: property.monthsOccupied,
            rental_income: property.rentalIncome,
            contact_id: contactId
          })
          .select();
          
        if (propertyError) {
          console.error("Error saving property:", propertyError);
          throw new Error(`Error saving property: ${propertyError.message}`);
        }
        
        if (propertyData && propertyData.length > 0) {
          propertyIdMap.set(property.id, propertyData[0].id);
          console.log(`Mapped property ${property.id} to database ID ${propertyData[0].id}`);
        } else {
          console.error("Property was saved but no data was returned");
          throw new Error("Failed to get database ID for property");
        }
      }
      
      console.log("ID Mappings created:", {
        owners: Array.from(ownerIdMap.entries()),
        properties: Array.from(propertyIdMap.entries())
      });
      
      for (const assignment of assignments) {
        const newPropertyId = propertyIdMap.get(assignment.propertyId);
        const newOwnerId = ownerIdMap.get(assignment.ownerId);
        
        if (!newPropertyId || !newOwnerId) {
          console.error('Could not find DB ID mapping for:', { 
            propertyId: assignment.propertyId,
            localPropertyExists: properties.some(p => p.id === assignment.propertyId),
            ownerId: assignment.ownerId,
            localOwnerExists: owners.some(o => o.id === assignment.ownerId),
            maps: { 
              properties: Array.from(propertyIdMap.entries()),
              owners: Array.from(ownerIdMap.entries())
            }
          });
          throw new Error('Failed to map local IDs to database IDs');
        }
        
        console.log("Saving assignment with mapped IDs:", {
          originalPropertyId: assignment.propertyId,
          newPropertyId,
          originalOwnerId: assignment.ownerId,
          newOwnerId
        });
        
        const insertData = {
          property_id: newPropertyId,
          owner_id: newOwnerId,
          ownership_percentage: assignment.ownershipPercentage,
          resident_at_property: assignment.residentAtProperty,
          resident_from_date: assignment.residentDateRange?.from 
            ? assignment.residentDateRange.from.toISOString().split('T')[0]
            : null,
          resident_to_date: assignment.residentDateRange?.to
            ? assignment.residentDateRange.to.toISOString().split('T')[0]
            : null,
          tax_credits: assignment.taxCredits,
          contact_id: contactId
        };
        
        console.log("Assignment data to insert:", insertData);
        
        const { data: assignmentData, error: assignmentError } = await supabase
          .from('owner_property_assignments')
          .insert(insertData)
          .select();
          
        if (assignmentError) {
          console.error("Error saving assignment:", assignmentError);
          throw new Error(`Error saving assignment: ${assignmentError.message}`);
        }
      }
      
      toast.success('Form submitted successfully!', {
        description: 'Thank you for completing the property owner intake process.',
        duration: 5000,
      });
      
      // Redirect to Italian Taxes website after successful submission
      window.location.href = 'https://www.italiantaxes.com/';
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error submitting form', {
        description: error instanceof Error ? error.message : 'Please try again later',
      });
    } finally {
      setIsSubmitting(false);
      setShowContactDialog(false);
    }
  };
  
  const handleDownloadSummary = () => {
    const formData = {
      owners,
      properties,
      assignments,
      submittedAt: new Date().toISOString()
    };
    
    const jsonString = JSON.stringify(formData, null, 2);
    
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
  
  const formatOccupancyStatuses = (statuses: OccupancyStatus[], monthsOccupied?: number) => {
    if (statuses.length === 1) {
      return `${formatOccupancyStatus(statuses[0])} (${monthsOccupied || 0} months)`;
    }
    
    return statuses.map(status => 
      `${formatOccupancyStatus(status)}`
    ).join(', ') + ` (${monthsOccupied || 0} months total)`;
  };

  const hasRentalStatus = (property: Property) => {
    return property.occupancyStatuses.some(
      status => status === 'LONG_TERM_RENT' || status === 'SHORT_TERM_RENT'
    );
  };

  const renderSubmissionSection = () => (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
      <h3 className="text-xl font-semibold text-green-800 mb-3">Ready for Submission</h3>
      <p className="text-green-700 mb-4">
        You have completed all required information for your property owner tax declaration.
        Upon submission, your data will be processed for tax assessment purposes.
      </p>
      <p className="text-green-700 mb-2">
        A confirmation email will be sent to you with a summary of your submitted information.
      </p>
      
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
        <p className="font-medium mb-1">🚨 Disclaimer:</p>
        <p>By submitting this form, you acknowledge that you take full responsibility for the accuracy of all information provided. 
        We are not liable for any errors, omissions, or inaccuracies in the submitted data. Please ensure all information is 
        complete and correct before proceeding with submission.</p>
      </div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 mt-6">
        <div className="w-full md:w-auto">
          <div className="text-center md:text-left">
            <h4 className="font-medium text-gray-700">Total Owners</h4>
            <p className="text-3xl font-bold text-form-400">{owners.length}</p>
          </div>
        </div>
        
        <div className="w-full md:w-auto">
          <div className="text-center md:text-left">
            <h4 className="font-medium text-gray-700">Total Properties</h4>
            <p className="text-3xl font-bold text-form-400">{properties.length}</p>
          </div>
        </div>
        
        <div className="w-full md:w-auto">
          <div className="text-center md:text-left">
            <h4 className="font-medium text-gray-700">Total Assignments</h4>
            <p className="text-3xl font-bold text-form-400">{assignments.length}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-form-400">Review & Submit</h2>
      
      <p className="mb-6 text-gray-600">
        Please review all the information below before submitting. You can go back to make changes if needed.
      </p>
      
      {renderSubmissionSection()}
      
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
                          ? formatOccupancyStatuses(property.occupancyStatuses, property.monthsOccupied) 
                          : 'Not specified'
                      }</p>
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
      
      <div className="flex flex-col-reverse sm:flex-row justify-between gap-4">
        <Button 
          variant="outline" 
          onClick={() => prevStep()}
          className="w-full sm:w-auto"
        >
          Back
        </Button>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            onClick={handleDownloadSummary}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Download className="h-4 w-4" />
            Download Summary
          </Button>
          <Button 
            onClick={handleSubmitButtonClick}
            disabled={isSubmitting}
            className="bg-form-300 hover:bg-form-400 text-white w-full sm:w-auto"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>
      
      <ContactInfoDialog 
        open={showContactDialog} 
        onClose={() => setShowContactDialog(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default ReviewStep;
