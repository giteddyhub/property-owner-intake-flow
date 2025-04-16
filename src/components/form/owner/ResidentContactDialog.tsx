
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ItalianResidenceDetails } from '@/types/form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ResidentContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: () => void;
  italianResidenceDetails?: ItalianResidenceDetails;
  onResidencyDetailChange?: (field: string, value: string) => void;
}

interface ResidentContact {
  firstName: string;
  lastName: string;
  email: string;
}

const ResidentContactDialog: React.FC<ResidentContactDialogProps> = ({
  open,
  onOpenChange,
  onStatusChange,
  italianResidenceDetails = {},
  onResidencyDetailChange,
}) => {
  const [contact, setContact] = useState<ResidentContact>({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isContactSubmitted, setIsContactSubmitted] = useState(false);

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContact(prev => ({ ...prev, [name]: value }));
  };
  
  const validateContact = () => {
    if (!contact.firstName.trim() || !contact.lastName.trim()) {
      toast.error("Please enter your first and last name");
      return false;
    }
    
    if (!contact.email.trim()) {
      toast.error("Please enter your email address");
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    
    return true;
  };

  const saveResidentContact = async () => {
    if (!validateContact()) return;
    
    setIsSubmitting(true);
    
    try {
      // Save the resident contact to Supabase
      const { data, error } = await supabase
        .from('resident_contacts')
        .insert({
          first_name: contact.firstName,
          last_name: contact.lastName,
          email: contact.email
        })
        .select();
      
      if (error) {
        console.error('Error saving resident contact:', error);
        toast.error('Error saving your information. Please try again.');
        return;
      }
      
      console.log('Resident contact saved successfully:', data);
      toast.success('Thank you! Your information has been saved.');
      setIsContactSubmitted(true);
      
    } catch (err) {
      console.error('Error in saveResidentContact:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Important Notice for Italian Residents</DialogTitle>
          <DialogDescription className="pt-4">
            If you are a registered resident in Italy, you need to complete a different form.
            We'll contact you with information about our specialized service for Italian residents.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 flex flex-col space-y-4">
          {!isContactSubmitted ? (
            <>
              <p className="text-sm text-gray-600">
                Our regular service is designed for non-residents who own property in Italy.
                Residents have different tax obligations and filing requirements.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      value={contact.firstName}
                      onChange={handleContactChange}
                      placeholder="Your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      value={contact.lastName}
                      onChange={handleContactChange}
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
                    onChange={handleContactChange}
                    placeholder="Your email address"
                  />
                </div>
                
                {/* Address fields have been removed */}
              </div>
              
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0 justify-end mt-2">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => onStatusChange()}
                  disabled={isSubmitting}
                >
                  Change my status to non-resident
                </Button>
                <Button 
                  type="button"
                  variant="default"
                  className="bg-form-400 hover:bg-form-500"
                  onClick={saveResidentContact}
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
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-green-800">Thank You!</h3>
                <p className="mt-2 text-sm text-green-600">
                  We've received your information and will contact you when our specialized service for Italian residents is available.
                </p>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="button"
                  onClick={() => window.location.href = '/ResidentSuccessPage'}
                  className="bg-form-400 hover:bg-form-500"
                >
                  Continue to success page
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResidentContactDialog;
