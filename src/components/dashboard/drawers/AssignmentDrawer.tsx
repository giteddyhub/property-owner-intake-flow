
import React, { useState } from 'react';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Owner, Property, OwnerPropertyAssignment } from '@/components/dashboard/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

interface AssignmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  assignment?: OwnerPropertyAssignment;
  properties: Property[];
  owners: Owner[];
  onSuccess: () => void;
}

interface AssignmentFormValues {
  propertyId: string;
  ownerId: string;
  ownershipPercentage: number;
  residentAtProperty: boolean;
  residentFromDate?: Date | null;
  residentToDate?: Date | null;
  taxCredits?: number;
}

const AssignmentDrawer: React.FC<AssignmentDrawerProps> = ({ 
  isOpen, 
  onClose, 
  assignment,
  properties,
  owners,
  onSuccess
}) => {
  const form = useForm<AssignmentFormValues>({
    defaultValues: {
      propertyId: assignment?.propertyId || '',
      ownerId: assignment?.ownerId || '',
      ownershipPercentage: assignment?.ownershipPercentage || 100,
      residentAtProperty: assignment?.residentAtProperty || false,
      residentFromDate: assignment?.residentDateRange?.from || null,
      residentToDate: assignment?.residentDateRange?.to || null,
      taxCredits: assignment?.taxCredits || 0
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const residentAtProperty = form.watch('residentAtProperty');
  
  const handleSubmit = async (values: AssignmentFormValues) => {
    setIsSubmitting(true);
    
    try {
      const assignmentData = {
        property_id: values.propertyId,
        owner_id: values.ownerId,
        ownership_percentage: values.ownershipPercentage,
        resident_at_property: values.residentAtProperty,
        resident_from_date: values.residentAtProperty ? values.residentFromDate : null,
        resident_to_date: values.residentAtProperty ? values.residentToDate : null,
        tax_credits: values.taxCredits || null,
        updated_at: new Date()
      };
      
      // Check if this combination already exists
      if (!assignment) {
        const { data: existingAssignment } = await supabase
          .from('owner_property_assignments')
          .select('id')
          .eq('property_id', values.propertyId)
          .eq('owner_id', values.ownerId)
          .maybeSingle();
          
        if (existingAssignment) {
          toast.error('This owner is already assigned to this property');
          setIsSubmitting(false);
          return;
        }
      }
      
      if (assignment) {
        // Update existing assignment
        const { error } = await supabase
          .from('owner_property_assignments')
          .update(assignmentData)
          .eq('id', assignment.id || '');
          
        if (error) throw error;
        toast.success('Assignment updated successfully');
      } else {
        // Create new assignment
        const { error } = await supabase
          .from('owner_property_assignments')
          .insert(assignmentData);
          
        if (error) throw error;
        toast.success('Assignment added successfully');
      }

      onClose();
      onSuccess();
    } catch (error) {
      console.error('Error saving assignment:', error);
      toast.error('Failed to save assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose} shouldScaleBackground>
      <DrawerContent>
        <div className="mx-auto max-w-4xl w-full p-6">
          <DrawerHeader>
            <div className="flex justify-between items-center">
              <div>
                <DrawerTitle>{assignment ? 'Edit Assignment' : 'Add New Assignment'}</DrawerTitle>
                <DrawerDescription>
                  {assignment 
                    ? 'Update the property-owner assignment details'
                    : 'Assign an owner to a property and set ownership details'
                  }
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          
          <div className="mt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="propertyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={!!assignment}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a property" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {properties.map(property => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.label} ({property.address.comune}, {property.address.province})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the property to assign
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="ownerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={!!assignment}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an owner" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {owners.map(owner => (
                            <SelectItem key={owner.id} value={owner.id}>
                              {owner.firstName} {owner.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the owner for this property
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="ownershipPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ownership Percentage</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Percentage of ownership (1-100)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="residentAtProperty"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Resident at Property
                        </FormLabel>
                        <FormDescription>
                          Does the owner reside at this property?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {residentAtProperty && (
                  <>
                    <FormField
                      control={form.control}
                      name="residentFromDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Resident From</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            When did the owner start residing at this property?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="residentToDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Resident Until (Optional)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Leave blank if the owner currently resides at this property
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                <FormField
                  control={form.control}
                  name="taxCredits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Credits (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )}
                        />
                      </FormControl>
                      <FormDescription>
                        Any applicable tax credits in Euro
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-4">
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : assignment ? 'Update Assignment' : 'Add Assignment'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default AssignmentDrawer;
