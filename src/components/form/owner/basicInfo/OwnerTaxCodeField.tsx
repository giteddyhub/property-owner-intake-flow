
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { HelpCircle } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, StandardTooltipContent } from '@/components/ui/tooltip';

interface OwnerTaxCodeFieldProps {
  italianTaxCode: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const OwnerTaxCodeField: React.FC<OwnerTaxCodeFieldProps> = ({ 
  italianTaxCode, 
  onInputChange 
}) => {
  return (
    <div>
      <div className="flex items-center space-x-1">
        <Label htmlFor="italianTaxCode">Italian Tax Code*</Label>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <StandardTooltipContent>
              <p>The "Codice Fiscale" is a unique identifier issued by the Italian government. It's required for tax purposes, property transactions, and official documents in Italy.</p>
              <p className="mt-2">It consists of <strong>16 characters</strong> (letters and numbers) representing personal data including name, birth date, and birthplace.</p>
              <p className="mt-2 font-medium">Example: RSSMRA80A01H501W</p>
            </StandardTooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Input 
        id="italianTaxCode" 
        name="italianTaxCode" 
        value={italianTaxCode || ''} 
        onChange={onInputChange}
        placeholder="e.g. RSSMRA80A01H501W"
        className="mt-1"
        required
      />
    </div>
  );
};

export default OwnerTaxCodeField;
