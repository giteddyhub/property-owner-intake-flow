
import React from 'react';
import { 
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import PropertyForm from '@/components/form/property/PropertyForm';
import { Property } from '@/components/dashboard/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PropertyDrawerContentProps {
  property?: Property;
  onSubmit: (property: Property, occupancyMonths: Record<string, number>) => void;
  onClose: () => void;
}

const PropertyDrawerContent: React.FC<PropertyDrawerContentProps> = ({ 
  property,
  onSubmit,
  onClose
}) => {
  // Create a proper default property only when needed, without hardcoded occupancy statuses
  const createDefaultProperty = (): Property => ({
    id: '',
    label: '',
    address: {
      comune: '',
      province: '',
      street: '',
      zip: ''
    },
    activity2024: 'owned_all_year',
    propertyType: 'RESIDENTIAL',
    remodeling: false,
    occupancyStatuses: [] // Start with empty array to avoid hardcoded defaults
  });

  const handleOccupancyClick = (e: React.MouseEvent) => {
    // This prevents clicks in the occupancy section from bubbling up
    // and potentially causing problems with the drawer
    e.stopPropagation();
  };

  const propertyToUse = property || createDefaultProperty();

  console.log('[PropertyDrawerContent] Using property data:', propertyToUse);

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <SheetHeader className="relative">
          <div>
            <SheetTitle>{property ? 'Edit Property' : 'Add New Property'}</SheetTitle>
            <SheetDescription>
              {property 
                ? 'Update the property details below'
                : 'Fill in the details to add a new property'
              }
            </SheetDescription>
          </div>
        </SheetHeader>
        
        <div 
          className="pt-2"
          onClick={handleOccupancyClick}
        >
          <PropertyForm
            property={propertyToUse}
            editingIndex={property ? 0 : null}
            onSubmit={onSubmit}
            onCancel={onClose}
            hideCancel={true}
            standalone={true}
          />
        </div>

        <SheetFooter className="pt-4">
          <SheetClose asChild>
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
          </SheetClose>
        </SheetFooter>
      </div>
    </ScrollArea>
  );
};

export default PropertyDrawerContent;
