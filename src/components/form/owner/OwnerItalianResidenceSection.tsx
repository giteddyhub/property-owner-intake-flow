
import React, { useState, useEffect } from 'react';
import { Owner } from '@/types/form';
import { HelpCircle, ExternalLink } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, StandardTooltipContent } from '@/components/ui/tooltip';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import ResidentContactDialog from './ResidentContactDialog';

interface OwnerItalianResidenceSectionProps {
  owner: Owner;
  onResidencyStatusChange: (value: string) => void;
  onResidencyDetailChange?: (field: string, value: string) => void;
  forceShowDialog?: boolean;
  onDialogVisibilityChange?: (show: boolean) => void;
}

const OwnerItalianResidenceSection: React.FC<OwnerItalianResidenceSectionProps> = ({ 
  owner, 
  onResidencyStatusChange,
  onResidencyDetailChange,
  forceShowDialog,
  onDialogVisibilityChange
}) => {
  const [showResidentDialog, setShowResidentDialog] = useState(false);
  
  const [currentValue, setCurrentValue] = useState<string>(
    owner.isResidentInItaly === true 
      ? 'yes' 
      : owner.isResidentInItaly === false 
      ? 'no' 
      : 'not-sure'
  );

  useEffect(() => {
    if (forceShowDialog && owner.isResidentInItaly === true) {
      setShowResidentDialog(true);
      if (onDialogVisibilityChange) {
        onDialogVisibilityChange(false);
      }
    }
  }, [forceShowDialog, owner.isResidentInItaly, onDialogVisibilityChange]);
  
  const handleResidencyChange = (value: string) => {
    setCurrentValue(value);
    
    if (value === 'yes') {
      setShowResidentDialog(true);
      onResidencyStatusChange(value);
    } else if (value === 'not-sure') {
      // Open the residency assessment page in a new tab
      window.open('/residency-assessment', '_blank');
      onResidencyStatusChange(value);
    } else {
      onResidencyStatusChange(value);
    }
  };
  
  const handleStatusChange = () => {
    setCurrentValue('no');
    onResidencyStatusChange('no');
    setShowResidentDialog(false);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setShowResidentDialog(open);
    
    if (onDialogVisibilityChange) {
      onDialogVisibilityChange(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center space-x-2 mb-3">
        <h4 className="text-md font-medium">Are you a registered resident in Italy?*</h4>
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
          value={currentValue}
          onValueChange={handleResidencyChange}
          className="flex justify-start space-x-2"
        >
          <ToggleGroupItem 
            value="yes" 
            className="px-4"
            variant={currentValue === 'yes' ? 'purple' : 'outline'}
          >
            Yes
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="no" 
            className="px-4"
            variant={currentValue === 'no' ? 'purple' : 'outline'}
          >
            No
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="not-sure" 
            className="px-4 flex items-center gap-1"
            variant={currentValue === 'not-sure' ? 'purple' : 'outline'}
          >
            Not sure <ExternalLink className="h-3 w-3 ml-0.5" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <ResidentContactDialog 
        open={showResidentDialog} 
        onOpenChange={handleDialogOpenChange}
        onStatusChange={handleStatusChange}
        italianResidenceDetails={owner.italianResidenceDetails}
        onResidencyDetailChange={onResidencyDetailChange}
      />
    </div>
  );
};

export default OwnerItalianResidenceSection;
