
import React, { useState } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import { Button } from '@/components/ui/button';
import FormNavigation from '@/components/form/FormNavigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Check, CreditCard, Download, Home, Info, User2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { submitFormData } from '@/services/formDataService';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

const ReviewStep: React.FC = () => {
  const { state } = useFormContext();
  const { owners, properties, assignments } = state;
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const getOwnerById = (id: string) => {
    return owners.find(owner => owner.id === id);
  };
  
  const getPropertyById = (id: string) => {
    return properties.find(property => property.id === id);
  };
  
  const getPropertyAssignments = (propertyId: string) => {
    return assignments.filter(assignment => assignment.propertyId === propertyId);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      await submitFormData(owners, properties, assignments);
      setSubmitted(true);
      toast.success("Form data submitted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit form data");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-form-400">Review & Submit</h2>
      
      <div className="bg-form-200 p-4 rounded-lg mb-6">
        <p className="flex items-center text-sm">
          <Info className="h-4 w-4 mr-2 text-form-300" />
          Please review all information before submitting your form
        </p>
      </div>
      
      {submitted ? (
        <div className="text-center py-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
            <Check className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Form Submitted Successfully!</h3>
          <p className="text-gray-600 mb-6">
            Your data has been saved to our system.
          </p>
          <div className="flex justify-center gap-4">
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Start New Form
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Accordion type="single" collapsible defaultValue="owners" className="mb-6">
            <AccordionItem value="owners">
              <AccordionTrigger className="py-4 px-6 bg-gray-50 rounded-t-lg hover:bg-gray-100">
                <div className="flex items-center">
                  <User2 className="h-5 w-5 mr-2 text-form-300" />
                  <span className="font-semibold">Owners ({owners.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 px-0">
                {owners.map((owner, index) => (
                  <div key={owner.id} className="border-b last:border-b-0 py-4 px-6">
                    <h3 className="font-medium text-lg mb-2">{owner.firstName} {owner.lastName}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Date of Birth:</strong> {owner.dateOfBirth ? format(new Date(owner.dateOfBirth), 'PPP') : 'N/A'}</p>
                        <p><strong>Country of Birth:</strong> {owner.countryOfBirth}</p>
                        <p><strong>Citizenship:</strong> {owner.citizenship}</p>
                        <p><strong>Italian Tax Code:</strong> {owner.italianTaxCode}</p>
                        <p><strong>Marital Status:</strong> {owner.maritalStatus}</p>
                      </div>
                      <div>
                        <p><strong>Address:</strong> {owner.address.street}, {owner.address.city}, {owner.address.zip}, {owner.address.country}</p>
                        <p><strong>Resident in Italy:</strong> {owner.isResidentInItaly ? 'Yes' : 'No'}</p>
                        {owner.isResidentInItaly && owner.italianResidenceDetails && (
                          <>
                            <p><strong>Comune:</strong> {owner.italianResidenceDetails.comuneName}</p>
                            <p>
                              <strong>Residency:</strong> {owner.italianResidenceDetails.fullYear 
                                ? 'Full Year' 
                                : owner.italianResidenceDetails.startDate 
                                  ? `From ${format(new Date(owner.italianResidenceDetails.startDate), 'PPP')}` 
                                  : 'Partial Year'}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="properties">
              <AccordionTrigger className="py-4 px-6 bg-gray-50 rounded-t-lg hover:bg-gray-100">
                <div className="flex items-center">
                  <Home className="h-5 w-5 mr-2 text-form-300" />
                  <span className="font-semibold">Properties ({properties.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 px-0">
                {properties.map((property, index) => (
                  <div key={property.id} className="border-b last:border-b-0 py-4 px-6">
                    <h3 className="font-medium text-lg mb-2">{property.label || `Property in ${property.address.comune}`}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Address:</strong> {property.address.street}, {property.address.comune}, {property.address.province}, {property.address.zip}</p>
                        <p><strong>Property Type:</strong> {property.propertyType}</p>
                        <p><strong>Activity in 2024:</strong> {property.activity2024}</p>
                        {property.activity2024 === 'purchased' || property.activity2024 === 'both' ? (
                          <p><strong>Purchase:</strong> {property.purchaseDate ? format(new Date(property.purchaseDate), 'PPP') : 'N/A'} - €{property.purchasePrice?.toLocaleString() || 'N/A'}</p>
                        ) : null}
                        {property.activity2024 === 'sold' || property.activity2024 === 'both' ? (
                          <p><strong>Sale:</strong> {property.saleDate ? format(new Date(property.saleDate), 'PPP') : 'N/A'} - €{property.salePrice?.toLocaleString() || 'N/A'}</p>
                        ) : null}
                      </div>
                      <div>
                        <p><strong>Remodeling:</strong> {property.remodeling ? 'Yes' : 'No'}</p>
                        <p><strong>Occupancy Status:</strong> {property.occupancyStatuses.join(', ')}</p>
                        {property.occupancyStatuses.includes('LONG_TERM_RENT') || property.occupancyStatuses.includes('SHORT_TERM_RENT') ? (
                          <>
                            <p><strong>Months Occupied:</strong> {property.monthsOccupied || 'N/A'}</p>
                            <p><strong>Rental Income:</strong> €{property.rentalIncome?.toLocaleString() || 'N/A'}</p>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="assignments">
              <AccordionTrigger className="py-4 px-6 bg-gray-50 rounded-t-lg hover:bg-gray-100">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-form-300" />
                  <span className="font-semibold">Ownership & Tax Credits</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 px-0">
                {properties.map((property) => {
                  const propertyAssignments = getPropertyAssignments(property.id);
                  if (propertyAssignments.length === 0) return null;
                  
                  return (
                    <div key={property.id} className="border-b last:border-b-0 py-4 px-6">
                      <h3 className="font-medium text-lg mb-3">{property.label || `Property in ${property.address.comune}`}</h3>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Owner</TableHead>
                            <TableHead className="text-right">Ownership %</TableHead>
                            <TableHead>Resident Status</TableHead>
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
                                <TableCell className="text-right">
                                  {assignment.ownershipPercentage}%
                                </TableCell>
                                <TableCell>
                                  {assignment.residentAtProperty ? (
                                    assignment.residentDateRange ? (
                                      <>
                                        Resident: {assignment.residentDateRange.from ? format(new Date(assignment.residentDateRange.from), 'MMM d') : ''} 
                                        {assignment.residentDateRange.to ? ` to ${format(new Date(assignment.residentDateRange.to), 'MMM d')}` : ''}
                                      </>
                                    ) : 'Resident'
                                  ) : 'Not Resident'}
                                </TableCell>
                                <TableCell className="text-right">
                                  {assignment.taxCredits ? `€${assignment.taxCredits.toLocaleString()}` : '-'}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          
                          <TableRow>
                            <TableCell colSpan={1} className="font-medium">Total</TableCell>
                            <TableCell className="text-right font-semibold">
                              {propertyAssignments.reduce((sum, a) => sum + (a.ownershipPercentage || 0), 0)}%
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell className="text-right font-semibold">
                              €{propertyAssignments
                                .reduce((sum, a) => sum + (a.taxCredits || 0), 0)
                                .toLocaleString()}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <div className="flex justify-between">
            <FormNavigation hideNextButton />
            <Button 
              onClick={handleSubmit} 
              disabled={submitting}
              className="ml-auto"
            >
              {submitting ? 'Submitting...' : 'Submit Form'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ReviewStep;
