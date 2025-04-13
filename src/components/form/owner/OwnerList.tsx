
import React from 'react';
import { Owner, ItalianResidenceDetails } from '@/types/form';
import { format } from 'date-fns';
import { Flag, FlagOff, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface OwnerListProps {
  owners: Owner[];
  onAddOwner: () => void;
  onEditOwner: (index: number) => void;
  onDeleteOwner: (index: number) => void;
}

const OwnerList: React.FC<OwnerListProps> = ({ owners, onAddOwner, onEditOwner, onDeleteOwner }) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold">Registered Owners</h3>
        <Button 
          onClick={onAddOwner}
          className="bg-form-300 hover:bg-form-400 text-white"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Owner
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {owners.map((owner, index) => (
          <Card key={owner.id} className="border border-gray-200">
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>{owner.firstName} {owner.lastName}</span>
                <div className="flex items-center">
                  {owner.isResidentInItaly ? (
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger>
                          <Flag className="h-4 w-4 text-green-600 ml-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Italian Tax Resident</p>
                          {owner.italianResidenceDetails?.spentOver182Days !== undefined && (
                            <p>{owner.italianResidenceDetails?.spentOver182Days ? 'More than' : 'Less than'} 182 days in Italy in 2024</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger>
                          <FlagOff className="h-4 w-4 text-gray-500 ml-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Not an Italian Tax Resident</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </CardTitle>
              <CardDescription>
                {owner.dateOfBirth ? format(new Date(owner.dateOfBirth), 'PPP') : 'No DOB'} • {owner.citizenship}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Tax Code:</strong> {owner.italianTaxCode || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Address:</strong> {owner.address.street}, {owner.address.city}, {owner.address.zip}, {owner.address.country}
              </p>
              {owner.isResidentInItaly && owner.italianResidenceDetails && (
                <>
                  <p className="text-sm text-gray-600">
                    <strong>Italian Residence:</strong> {owner.italianResidenceDetails.comuneName}, {owner.italianResidenceDetails.street}, {owner.italianResidenceDetails.city}, {owner.italianResidenceDetails.zip}
                  </p>
                  {owner.italianResidenceDetails.spentOver182Days !== undefined && (
                    <p className="text-sm text-gray-600">
                      <strong>Time in Italy (2024):</strong> {owner.italianResidenceDetails.spentOver182Days ? 'More than' : 'Less than'} 182 days
                    </p>
                  )}
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDeleteOwner(index)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
              <Button 
                onClick={() => onEditOwner(index)} 
                size="sm"
              >
                Edit
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OwnerList;
