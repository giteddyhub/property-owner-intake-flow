
import React, { useState } from 'react';
import { Owner } from '@/types/form';
import { Label } from '@/components/ui/label';
import { HelpCircle } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, StandardTooltipContent } from '@/components/ui/tooltip';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import ResidentContactDialog from './ResidentContactDialog';

interface OwnerItalianResidenceSectionProps {
  owner: Owner;
  onResidencyStatusChange: (value: string) => void;
}

const OwnerItalianResidenceSection: React.FC<OwnerItalianResidenceSectionProps> = ({ 
  owner, 
  onResidencyStatusChange
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

  // Determine the current value for the ToggleGroup
  const currentValue = 
    owner.isResidentInItaly === true 
      ? 'yes' 
      : owner.isResidentInItaly === false 
      ? 'no' 
      : 'not-sure';

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
          value={currentValue}
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
    </div>
  );
};

export default OwnerItalianResidenceSection;
