
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ItalianResidenceDetails } from '@/types/form';

interface ResidentContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: () => void;
  italianResidenceDetails?: ItalianResidenceDetails;
  onResidenceDetailChange?: (field: string, value: string) => void;
  onDaysInItalyChange?: (value: boolean) => void;
}

const ResidentContactDialog: React.FC<ResidentContactDialogProps> = ({
  open,
  onOpenChange,
  onStatusChange,
  italianResidenceDetails = {
    comuneName: '',
    street: '',
    city: '',
    zip: '',
    spentOver182Days: undefined
  },
  onResidenceDetailChange,
  onDaysInItalyChange
}) => {
  const [formData, setFormData] = useState(italianResidenceDetails);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (onResidenceDetailChange) {
      onResidenceDetailChange(name, value);
    }
  };

  const handleRadioChange = (value: string) => {
    const spentOver182Days = value === 'yes';
    setFormData(prev => ({ ...prev, spentOver182Days }));
    if (onDaysInItalyChange) {
      onDaysInItalyChange(spentOver182Days);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Important Notice for Italian Residents</DialogTitle>
          <DialogDescription className="pt-4">
            If you are a registered resident in Italy, you need to complete a different form.
            We'll redirect you to our specialized service for Italian residents.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 flex flex-col space-y-4">
          <p className="text-sm text-gray-600">
            Our regular service is designed for non-residents who own property in Italy.
            Residents have different tax obligations and filing requirements.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comuneName">Comune of Residence</Label>
              <Input 
                id="comuneName" 
                name="comuneName" 
                value={formData.comuneName}
                onChange={handleInputChange}
                placeholder="Your Italian comune of residence"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="street">Address in Italy</Label>
              <Input 
                id="street" 
                name="street" 
                value={formData.street}
                onChange={handleInputChange}
                placeholder="Street address"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  name="city" 
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">Postal Code</Label>
                <Input 
                  id="zip" 
                  name="zip" 
                  value={formData.zip}
                  onChange={handleInputChange}
                  placeholder="Postal code"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Did you spend more than 182 days in Italy in 2024?</Label>
              <RadioGroup 
                value={formData.spentOver182Days === undefined ? '' : formData.spentOver182Days ? 'yes' : 'no'} 
                onValueChange={handleRadioChange}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="r1" />
                  <Label htmlFor="r1">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="r2" />
                  <Label htmlFor="r2">No</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0 justify-end mt-2">
            <Button 
              type="button"
              variant="default"
              className="bg-form-400 hover:bg-form-500"
              onClick={onStatusChange}
            >
              I understand, change my status
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResidentContactDialog;
