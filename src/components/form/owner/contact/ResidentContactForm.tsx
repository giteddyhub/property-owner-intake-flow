
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { ResidentContact } from '@/hooks/useResidentContactForm';

interface ResidentContactFormProps {
  contact: ResidentContact;
  isSubmitting: boolean;
  onContactChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusChange: () => void;
  onSubmit: () => void;
}

export const ResidentContactForm: React.FC<ResidentContactFormProps> = ({
  contact,
  isSubmitting,
  onContactChange,
  onStatusChange,
  onSubmit
}) => {
  return (
    <>
      <p className="text-sm text-gray-600">
        Our regular service is designed for non-tax residents who own property in Italy.
        Tax residents have different tax obligations and filing requirements.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input 
              id="firstName" 
              name="firstName" 
              value={contact.firstName}
              onChange={onContactChange}
              placeholder="Your first name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input 
              id="lastName" 
              name="lastName" 
              value={contact.lastName}
              onChange={onContactChange}
              placeholder="Your last name"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email" 
            name="email" 
            type="email"
            value={contact.email}
            onChange={onContactChange}
            placeholder="Your email address"
          />
        </div>
      </div>
      
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0 justify-end mt-2">
        <Button 
          type="button"
          variant="outline"
          onClick={onStatusChange}
          disabled={isSubmitting}
        >
          Change status to non-tax-resident
        </Button>
        <Button 
          type="button"
          variant="default"
          className="bg-form-400 hover:bg-form-500"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </div>
    </>
  );
};
