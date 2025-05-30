
import React, { useState, useEffect } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FormNavigation from '@/components/form/FormNavigation';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Euro, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { 
  Card, 
  CardContent,
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Owner, 
  Property,
  OwnerPropertyAssignment,
  DateRange
} from '@/types/form';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  StandardTooltipContent
} from "@/components/ui/tooltip";

// Reusable tooltip component with standardized styling
const InfoTooltip = ({ content }: { content: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger className="flex items-center justify-center">
        <Info className="h-4 w-4 text-form-300" />
      </TooltipTrigger>
      <StandardTooltipContent>
        <p className="text-xs">{content}</p>
      </StandardTooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const AssignmentStep: React.FC = () => {
  const { state, addAssignment, updateAssignment, removeAssignment } = useFormContext();
  const { owners, properties, assignments } = state;
  
  const [dateRange, setDateRange] = useState<DateRange>({
    from: null,
    to: null,
  });
  
  const [defaultAccordionValue, setDefaultAccordionValue] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    if (properties.length > 0 && !defaultAccordionValue) {
      setDefaultAccordionValue(properties[0].id);
    }
  }, [properties, defaultAccordionValue]);
  
  const allPropertiesAssigned = properties.every(property => 
    assignments.some(assignment => assignment.propertyId === property.id)
  );
  
  const getPropertyAssignments = (propertyId: string) => {
    return assignments.filter(assignment => assignment.propertyId === propertyId);
  };
  
  const findAssignment = (propertyId: string, ownerId: string) => {
    return assignments.find(
      assignment => assignment.propertyId === propertyId && assignment.ownerId === ownerId
    );
  };
  
  const getOwnerById = (ownerId: string) => {
    return owners.find(owner => owner.id === ownerId);
  };
  
  const handlePercentageChange = (propertyId: string, ownerId: string, value: string) => {
    const percentage = value === '' ? 0 : Math.min(100, Math.max(0, parseInt(value)));
    
    const existingAssignment = findAssignment(propertyId, ownerId);
    
    if (existingAssignment) {
      const index = assignments.indexOf(existingAssignment);
      updateAssignment(index, {
        ...existingAssignment,
        ownershipPercentage: percentage
      });
    } else if (percentage > 0) {
      addAssignment({
        propertyId,
        ownerId,
        ownershipPercentage: percentage,
        residentAtProperty: false
      });
    }
  };
  
  const handleResidentStatusChange = (propertyId: string, ownerId: string, checked: boolean) => {
    const existingAssignment = findAssignment(propertyId, ownerId);
    
    if (existingAssignment) {
      const index = assignments.indexOf(existingAssignment);
      updateAssignment(index, {
        ...existingAssignment,
        residentAtProperty: checked,
        residentDateRange: checked ? existingAssignment.residentDateRange || { from: null, to: null } : undefined
      });
    } else if (checked) {
      addAssignment({
        propertyId,
        ownerId,
        ownershipPercentage: 0,
        residentAtProperty: true,
        residentDateRange: { from: null, to: null }
      });
    }
  };
  
  const handleDateRangeChange = (
    propertyId: string, 
    ownerId: string, 
    range: {from: Date | null, to: Date | null}
  ) => {
    const existingAssignment = findAssignment(propertyId, ownerId);
    
    if (existingAssignment) {
      const index = assignments.indexOf(existingAssignment);
      updateAssignment(index, {
        ...existingAssignment,
        residentDateRange: range
      });
    }
  };
  
  const handleTaxCreditChange = (propertyId: string, ownerId: string, value: string) => {
    const taxCredit = value === '' ? undefined : Number(value);
    
    const existingAssignment = findAssignment(propertyId, ownerId);
    
    if (existingAssignment) {
      const index = assignments.indexOf(existingAssignment);
      updateAssignment(index, {
        ...existingAssignment,
        taxCredits: taxCredit
      });
    } else if (taxCredit !== undefined) {
      addAssignment({
        propertyId,
        ownerId,
        ownershipPercentage: 0,
        residentAtProperty: false,
        taxCredits: taxCredit
      });
    }
  };
  
  const getTotalPercentage = (propertyId: string) => {
    return getPropertyAssignments(propertyId)
      .reduce((sum, assignment) => sum + assignment.ownershipPercentage, 0);
  };
  
  const validateAndProceed = () => {
    if (!allPropertiesAssigned) {
      toast.error('Each property must have at least one owner assigned');
      return false;
    }
    
    const propertyWithOverAllocation = properties.find(property => 
      getTotalPercentage(property.id) > 100
    );
    
    if (propertyWithOverAllocation) {
      toast.error(`Property "${propertyWithOverAllocation.label || 'Unnamed property'}" has more than 100% ownership allocated`);
      return false;
    }
    
    return true;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-form-400">Owner-Property Assignments</h2>
      
      <div className="bg-form-200 p-4 rounded-lg mb-6">
        <p className="flex items-center text-sm">
          <Info className="h-4 w-4 mr-2 text-form-300" />
          Assign each owner to their respective properties. Specify ownership percentages, residence status, and any tax credits.
        </p>
      </div>
      
      {properties.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No properties added yet. Please go back to add properties first.</p>
        </div>
      ) : (
        <Accordion 
          type="single" 
          collapsible 
          className="w-full space-y-4"
          value={defaultAccordionValue}
          onValueChange={setDefaultAccordionValue}
        >
          {properties.map((property) => (
            <AccordionItem 
              key={property.id} 
              value={property.id}
              className="border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 bg-gray-50 hover:bg-gray-100">
                <div className="flex items-start justify-between w-full text-left">
                  <div>
                    <h3 className="font-medium">
                      {property.label || `Property in ${property.address.comune}`}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {property.address.street}, {property.address.comune}, {property.address.province}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <span className={cn(
                      "inline-block px-2 py-1 rounded",
                      getTotalPercentage(property.id) === 100 
                        ? "bg-green-100 text-green-800" 
                        : getTotalPercentage(property.id) > 100
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    )}>
                      {getTotalPercentage(property.id)}% Assigned
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <Card className="border-0 shadow-none">
                  <CardHeader className="px-4 py-3 bg-gray-50 border-t border-b">
                    <CardTitle className="text-base">Owner Assignments</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">Owner</TableHead>
                          <TableHead className="w-[130px]">
                            <div className="flex items-center justify-center gap-2">
                              <span>Ownership %</span>
                              <InfoTooltip content="Enter the percentage of ownership for each owner. The total should be 100%." />
                            </div>
                          </TableHead>
                          <TableHead className="w-[130px]">
                            <div className="flex items-center justify-center gap-2">
                              <span>Resident</span>
                              <InfoTooltip content="Check if the owner uses this property as a residence." />
                            </div>
                          </TableHead>
                          <TableHead>
                            <div className="flex items-center justify-center gap-2">
                              <span>Residence Period</span>
                              <InfoTooltip content="If the owner is a resident, specify the period of residence in 2024." />
                            </div>
                          </TableHead>
                          <TableHead className="w-[150px]">
                            <div className="flex items-center justify-center gap-2">
                              <span>Tax Credits (€)</span>
                              <InfoTooltip content="Enter any tax credits claimed for this property by this owner." />
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {owners.map((owner) => {
                          const assignment = findAssignment(property.id, owner.id);
                          const ownershipPercentage = assignment?.ownershipPercentage || 0;
                          const isResident = assignment?.residentAtProperty || false;
                          const residencePeriod = assignment?.residentDateRange;
                          const taxCredits = assignment?.taxCredits;
                          
                          return (
                            <TableRow key={owner.id}>
                              <TableCell className="font-medium">
                                {owner.firstName} {owner.lastName}
                              </TableCell>
                              <TableCell className="text-center">
                                <Input 
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={ownershipPercentage || ''}
                                  onChange={(e) => handlePercentageChange(
                                    property.id, 
                                    owner.id, 
                                    e.target.value
                                  )}
                                  className="w-20 mx-auto text-center h-9"
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Switch 
                                  checked={isResident}
                                  onCheckedChange={(checked) => handleResidentStatusChange(
                                    property.id,
                                    owner.id,
                                    checked
                                  )}
                                  className="mx-auto"
                                />
                              </TableCell>
                              <TableCell>
                                {isResident && (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "w-full justify-start text-left font-normal h-9",
                                          !residencePeriod?.from && "text-muted-foreground"
                                        )}
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {residencePeriod?.from ? (
                                          residencePeriod.to ? (
                                            <>
                                              {format(residencePeriod.from, "PPP")} - {format(residencePeriod.to, "PPP")}
                                            </>
                                          ) : (
                                            format(residencePeriod.from, "PPP")
                                          )
                                        ) : (
                                          <span>Select period</span>
                                        )}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 pointer-events-auto" align="center">
                                      <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={residencePeriod?.from || new Date()}
                                        selected={{
                                          from: residencePeriod?.from || null,
                                          to: residencePeriod?.to || null
                                        }}
                                        onSelect={(range) => {
                                          if (!range) return;
                                          
                                          handleDateRangeChange(
                                            property.id,
                                            owner.id,
                                            {
                                              from: range.from,
                                              to: range.to
                                            }
                                          );
                                        }}
                                        numberOfMonths={2}
                                      />
                                    </PopoverContent>
                                  </Popover>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="relative w-full">
                                  <Euro className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                  <Input 
                                    type="number"
                                    min="0"
                                    value={taxCredits || ''}
                                    onChange={(e) => handleTaxCreditChange(
                                      property.id,
                                      owner.id,
                                      e.target.value
                                    )}
                                    className="pl-7 w-full h-9"
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
      
      <FormNavigation onNext={validateAndProceed} />
    </div>
  );
};

export default AssignmentStep;
