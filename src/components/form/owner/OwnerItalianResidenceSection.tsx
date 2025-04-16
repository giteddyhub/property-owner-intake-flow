
import React, { useState } from 'react';
import { Owner } from '@/types/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { HelpCircle } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, StandardTooltipContent } from '@/components/ui/tooltip';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import ResidentContactDialog from './ResidentContactDialog';

interface OwnerItalianResidenceSectionProps {
  owner: Owner;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResidencyStatusChange: (value: string) => void;
  onDaysInItalyChange: (value: string) => void;
}

const OwnerItalianResidenceSection: React.FC<OwnerItalianResidenceSectionProps> = ({ 
  owner, 
  onInputChange, 
  onResidencyStatusChange, 
  onDaysInItalyChange 
}) => {
  const [showResidentDialog, setShowResidentDialog] = useState(false);
  
  const handleResidencyChange = (value: string) => {
    if (value === 'yes') {
      setShowResidentDialog(true);
    } else {
      onResidencyStatusChange(value);
    }
  };
  
  const handleStatusChange = () => {
    onResidencyStatusChange('no');
    setShowResidentDialog(false);
  };

  return (
    <div className="mt-6">
      <div className="flex items-center space-x-2">
        <Label htmlFor="isResidentInItaly">Are you a registered resident in Italy?</Label>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <StandardTooltipContent>
              <p>A person is considered an Italian tax resident if they meet at least one of these conditions:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Registered with the Italian Registry Office for most of the tax period (183+ days)</li>
                <li>Have their habitual abode in Italy</li>
                <li>Establish their main center of business and interests in Italy</li>
              </ul>
              <p className="mt-2">Italian tax residents are taxed on their worldwide income.</p>
            </StandardTooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="mt-2">
        <ToggleGroup 
          type="single" 
          variant="purple"
          value={owner.isResidentInItaly ? 'yes' : owner.isResidentInItaly === false ? 'no' : undefined}
          onValueChange={handleResidencyChange}
          className="flex justify-start space-x-2"
        >
          <ToggleGroupItem value="yes" className="px-4">
            Yes
          </ToggleGroupItem>
          <ToggleGroupItem value="no" className="px-4">
            No
          </ToggleGroupItem>
          <ToggleGroupItem value="not-sure" className="px-4">
            Not sure
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <ResidentContactDialog 
        open={showResidentDialog} 
        onOpenChange={setShowResidentDialog}
        onStatusChange={handleStatusChange}
      />
      
      {owner.isResidentInItaly === false && (
        <div className="mt-4 border-t pt-4">
          <h4 className="font-medium mb-3">Italian Address*</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="comuneName">Comune Name*</Label>
              <Input 
                id="comuneName" 
                name="comuneName" 
                placeholder="Enter Italian comune name"
                value={owner.italianResidenceDetails?.comuneName || ''} 
                onChange={onInputChange}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="street">Street Address*</Label>
              <Input 
                id="street" 
                name="street" 
                placeholder="Enter street address in Italy"
                value={owner.italianResidenceDetails?.street || ''} 
                onChange={onInputChange}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="city">City*</Label>
              <Input 
                id="city" 
                name="city" 
                placeholder="Enter city name in Italy"
                value={owner.italianResidenceDetails?.city || ''} 
                onChange={onInputChange}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="zip">ZIP/Postal Code*</Label>
              <Input 
                id="zip" 
                name="zip" 
                placeholder="Enter ZIP/postal code in Italy"
                value={owner.italianResidenceDetails?.zip || ''} 
                onChange={onInputChange}
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="font-medium mb-3">Time spent in Italy during 2024*</h4>
            <div className="mt-2 space-y-2">
              <ToggleGroup 
                type="single" 
                variant="purple"
                value={owner.italianResidenceDetails?.spentOver182Days !== undefined 
                  ? (owner.italianResidenceDetails.spentOver182Days ? 'over182' : 'under182') 
                  : undefined}
                onValueChange={onDaysInItalyChange}
                className="flex justify-start space-x-2"
              >
                <ToggleGroupItem value="over182" className="px-4">
                  More than 182 days
                </ToggleGroupItem>
                <ToggleGroupItem value="under182" className="px-4">
                  Less than 182 days
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerItalianResidenceSection;
