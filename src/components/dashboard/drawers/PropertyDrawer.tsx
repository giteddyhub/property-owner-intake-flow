
import React from 'react';
import { 
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { Property } from '@/components/dashboard/types';
import { usePropertyDrawer } from './hooks/usePropertyDrawer';
import PropertyDrawerContent from './components/PropertyDrawerContent';

interface PropertyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  property?: Property;
  onSuccess: () => void;
}

const PropertyDrawer: React.FC<PropertyDrawerProps> = ({ 
  isOpen, 
  onClose, 
  property,
  onSuccess
}) => {
  const {
    handleSubmit,
    handleClose
  } = usePropertyDrawer({
    property,
    onClose,
    onSuccess
  });
  
  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl p-0">
        <PropertyDrawerContent
          property={property}
          onSubmit={handleSubmit}
          onClose={handleClose}
        />
      </SheetContent>
    </Sheet>
  );
};

export default PropertyDrawer;
