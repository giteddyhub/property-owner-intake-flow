
import React from 'react';
import { X } from 'lucide-react';
import { 
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Owner, Property, OwnerPropertyAssignment } from '@/components/dashboard/types';
import AssignmentForm from './AssignmentForm';

interface AssignmentDrawerContentProps {
  assignment?: OwnerPropertyAssignment;
  properties: Property[];
  owners: Owner[];
  onClose: () => void;
  onSuccess: () => void;
  userId: string; // Added userId prop
}

const AssignmentDrawerContent: React.FC<AssignmentDrawerContentProps> = ({
  assignment,
  properties,
  owners,
  onClose,
  onSuccess,
  userId // Accept userId prop
}) => {
  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <SheetHeader>
          <div className="flex justify-between items-center">
            <div>
              <SheetTitle>{assignment ? 'Edit Assignment' : 'Add New Assignment'}</SheetTitle>
              <SheetDescription>
                {assignment 
                  ? 'Update the property-owner assignment details'
                  : 'Assign an owner to a property and set ownership details'
                }
              </SheetDescription>
            </div>
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>
        
        <div className="mt-6">
          <AssignmentForm
            assignment={assignment}
            properties={properties}
            owners={owners}
            onClose={onClose}
            onSuccess={onSuccess}
            userId={userId} // Pass userId
          />
        </div>
      </div>
    </ScrollArea>
  );
};

export default AssignmentDrawerContent;
