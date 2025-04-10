
import React, { useState } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormNavigation from '@/components/form/FormNavigation';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2, HelpCircle, Flag, FlagOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Owner, MaritalStatus, Address, ItalianResidenceDetails } from '@/types/form';
import CountryCombobox from '@/components/form/CountryCombobox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const COUNTRIES = [
  "Italy", "United States", "United Kingdom", "France", "Germany", 
  "Spain", "Canada", "Australia", "Switzerland", "Other"
];

const createEmptyOwner = (): Owner => ({
  id: '',
  firstName: '',
  lastName: '',
  dateOfBirth: null,
  countryOfBirth: '',
  citizenship: '',
  address: {
    street: '',
    city: '',
    zip: '',
    country: ''
  },
  maritalStatus: 'UNMARRIED',
  isResidentInItaly: false,
  italianTaxCode: ''
});

const OwnerStep: React.FC = () => {
  const { state, addOwner, updateOwner, removeOwner } = useFormContext();
  const { owners } = state;
  
  const [currentOwner, setCurrentOwner] = useState<Owner>(createEmptyOwner());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(owners.length === 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setCurrentOwner(prev => {
        if (parent === 'address') {
          return {
            ...prev,
            address: {
              ...prev.address,
              [child]: value
            }
          };
        } else if (parent === 'italianResidenceDetails' && prev.italianResidenceDetails) {
          return {
            ...prev,
            italianResidenceDetails: {
              ...prev.italianResidenceDetails,
              [child]: value
            }
          };
        } else if (parent === 'italianResidenceDetails') {
          return {
            ...prev,
            italianResidenceDetails: {
              comuneName: '',
              street: '',
              city: '',
              zip: '',
              [child]: value
            }
          };
        }
        return prev;
      });
    } else {
      setCurrentOwner(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setCurrentOwner(prev => {
        if (parent === 'address') {
          return {
            ...prev,
            address: {
              ...prev.address,
              [child]: value
            }
          };
        } else if (parent === 'italianResidenceDetails' && prev.italianResidenceDetails) {
          return {
            ...prev,
            italianResidenceDetails: {
              ...prev.italianResidenceDetails,
              [child]: value
            }
          };
        } else if (parent === 'italianResidenceDetails') {
          return {
            ...prev,
            italianResidenceDetails: {
              comuneName: '',
              street: '',
              city: '',
              zip: '',
              [child]: value
            }
          };
        }
        return prev;
      });
    } else {
      setCurrentOwner(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setCurrentOwner(prev => ({ ...prev, dateOfBirth: date || null }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setCurrentOwner(prev => ({ 
      ...prev, 
      isResidentInItaly: checked,
      italianResidenceDetails: checked 
        ? (prev.italianResidenceDetails || { 
            comuneName: '', 
            street: '',
            city: '',
            zip: ''
          })
        : undefined
    }));
  };

  const handleResidencyDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentOwner(prev => ({
      ...prev,
      italianResidenceDetails: {
        ...(prev.italianResidenceDetails || { 
          comuneName: '', 
          street: '',
          city: '',
          zip: ''
        }),
        [name]: value
      }
    }));
  };

  const handleCountryChange = (field: string, value: string) => {
    if (field === 'countryOfBirth') {
      setCurrentOwner(prev => ({ ...prev, countryOfBirth: value }));
    } else if (field === 'citizenship') {
      setCurrentOwner(prev => ({ ...prev, citizenship: value }));
    } else if (field === 'address.country') {
      setCurrentOwner(prev => ({
        ...prev,
        address: {
          ...prev.address,
          country: value
        }
      }));
    }
  };

  const handleSubmit = () => {
    if (!currentOwner.firstName.trim() || !currentOwner.lastName.trim()) {
      toast.error('Please enter first and last name');
      return;
    }
    
    if (!currentOwner.dateOfBirth) {
      toast.error('Please enter date of birth');
      return;
    }
    
    if (!currentOwner.countryOfBirth) {
      toast.error('Please select country of birth');
      return;
    }
    
    if (!currentOwner.citizenship) {
      toast.error('Please select citizenship');
      return;
    }
    
    if (!currentOwner.address.street || !currentOwner.address.city || 
        !currentOwner.address.zip || !currentOwner.address.country) {
      toast.error('Please complete all address fields');
      return;
    }

    if (!currentOwner.italianTaxCode) {
      toast.error('Please enter Italian Tax Code');
      return;
    }
    
    if (currentOwner.isResidentInItaly) {
      if (!currentOwner.italianResidenceDetails?.comuneName) {
        toast.error('Please enter comune name for Italian residence');
        return;
      }
      
      if (!currentOwner.italianResidenceDetails?.street || 
          !currentOwner.italianResidenceDetails?.city || 
          !currentOwner.italianResidenceDetails?.zip) {
        toast.error('Please complete the Italian address fields');
        return;
      }
    }

    if (editingIndex !== null) {
      updateOwner(editingIndex, currentOwner);
      toast.success('Owner updated successfully');
    } else {
      addOwner(currentOwner);
      toast.success('Owner added successfully');
    }
    
    setCurrentOwner(createEmptyOwner());
    setEditingIndex(null);
    setShowForm(false);
  };

  const handleEdit = (index: number) => {
    setCurrentOwner({ ...owners[index] });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index: number) => {
    removeOwner(index);
    toast.success('Owner removed successfully');
  };

  const validateAndProceed = () => {
    if (owners.length === 0) {
      toast.error('Please add at least one owner before proceeding');
      return false;
    }
    return true;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-form-400">Owner Information</h2>
      
      {owners.length > 0 && !showForm && (
        <div className="mb-6">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-semibold">Registered Owners</h3>
            <Button 
              onClick={() => {
                setCurrentOwner(createEmptyOwner());
                setEditingIndex(null);
                setShowForm(true);
              }}
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
                    </>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(index)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                  <Button 
                    onClick={() => handleEdit(index)} 
                    size="sm"
                  >
                    Edit
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {showForm && (
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">
            {editingIndex !== null ? 'Edit Owner' : 'Add New Owner'}
          </h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="firstName">First Name*</Label>
              <Input 
                id="firstName" 
                name="firstName" 
                placeholder="Enter first name"
                value={currentOwner.firstName} 
                onChange={handleInputChange} 
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="lastName">Last Name*</Label>
              <Input 
                id="lastName" 
                name="lastName" 
                placeholder="Enter last name"
                value={currentOwner.lastName} 
                onChange={handleInputChange} 
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth*</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !currentOwner.dateOfBirth && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {currentOwner.dateOfBirth ? (
                      format(currentOwner.dateOfBirth, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto">
                  <Calendar
                    mode="single"
                    selected={currentOwner.dateOfBirth || undefined}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="countryOfBirth">Country of Birth*</Label>
              <div className="mt-1">
                <CountryCombobox
                  value={currentOwner.countryOfBirth}
                  onChange={(value) => handleCountryChange('countryOfBirth', value)}
                  placeholder="Select country of birth"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="citizenship">Citizenship*</Label>
              <div className="mt-1">
                <CountryCombobox
                  value={currentOwner.citizenship}
                  onChange={(value) => handleCountryChange('citizenship', value)}
                  placeholder="Select citizenship"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="maritalStatus">Marital Status*</Label>
              <Select 
                value={currentOwner.maritalStatus} 
                onValueChange={(value) => handleSelectChange('maritalStatus', value as MaritalStatus)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNMARRIED">Unmarried</SelectItem>
                  <SelectItem value="MARRIED">Married</SelectItem>
                  <SelectItem value="DIVORCED">Divorced</SelectItem>
                  <SelectItem value="WIDOWED">Widowed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <div className="flex items-center space-x-1">
                <Label htmlFor="italianTaxCode">Italian Tax Code*</Label>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>The "Codice Fiscale" is a unique identifier issued by the Italian government. It's required for tax purposes, property transactions, and official documents in Italy.</p>
                      <p className="mt-2 font-medium">Example: RSSMRA80A01H501W</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input 
                id="italianTaxCode" 
                name="italianTaxCode" 
                value={currentOwner.italianTaxCode || ''} 
                onChange={handleInputChange}
                placeholder="e.g. RSSMRA80A01H501W"
                className="mt-1"
                required
              />
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-md font-medium mb-3">Address outside Italy*</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="address.street">Street Address*</Label>
                <Input 
                  id="address.street" 
                  name="address.street" 
                  placeholder="Enter street address"
                  value={currentOwner.address.street} 
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="address.city">City*</Label>
                <Input 
                  id="address.city" 
                  name="address.city" 
                  placeholder="Enter city name"
                  value={currentOwner.address.city} 
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="address.zip">ZIP/Postal Code*</Label>
                <Input 
                  id="address.zip" 
                  name="address.zip" 
                  placeholder="Enter ZIP/postal code"
                  value={currentOwner.address.zip} 
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="address.country">Country*</Label>
                <div className="mt-1">
                  <CountryCombobox
                    value={currentOwner.address.country}
                    onChange={(value) => handleCountryChange('address.country', value)}
                    placeholder="Select country"
                    excludeCountries={['Italy']}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center space-x-2">
              <Switch 
                id="isResidentInItaly" 
                checked={currentOwner.isResidentInItaly}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="isResidentInItaly">Resident in Italy?</Label>
            </div>
            
            {currentOwner.isResidentInItaly && (
              <div className="mt-4 border-t pt-4">
                <h4 className="font-medium mb-3">Italian Address*</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="comuneName">Comune Name*</Label>
                    <Input 
                      id="comuneName" 
                      name="comuneName" 
                      placeholder="Enter Italian comune name"
                      value={currentOwner.italianResidenceDetails?.comuneName || ''} 
                      onChange={handleResidencyDetailChange}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="street">Street Address*</Label>
                    <Input 
                      id="street" 
                      name="street" 
                      placeholder="Enter street address in Italy"
                      value={currentOwner.italianResidenceDetails?.street || ''} 
                      onChange={handleResidencyDetailChange}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="city">City*</Label>
                    <Input 
                      id="city" 
                      name="city" 
                      placeholder="Enter city name in Italy"
                      value={currentOwner.italianResidenceDetails?.city || ''} 
                      onChange={handleResidencyDetailChange}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="zip">ZIP/Postal Code*</Label>
                    <Input 
                      id="zip" 
                      name="zip" 
                      placeholder="Enter ZIP/postal code in Italy"
                      value={currentOwner.italianResidenceDetails?.zip || ''} 
                      onChange={handleResidencyDetailChange}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowForm(false);
                setCurrentOwner(createEmptyOwner());
                setEditingIndex(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSubmit}
              className="bg-form-300 hover:bg-form-400 text-white"
            >
              {editingIndex !== null ? 'Update Owner' : 'Add Owner'}
            </Button>
          </div>
        </div>
      )}
      
      {!showForm && owners.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">No owners added yet. Please add at least one owner.</p>
          <Button 
            onClick={() => {
              setShowForm(true);
              setCurrentOwner(createEmptyOwner());
            }}
            className="bg-form-300 hover:bg-form-400 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Owner
          </Button>
        </div>
      )}
      
      <FormNavigation onNext={validateAndProceed} />
    </div>
  );
};

export default OwnerStep;
