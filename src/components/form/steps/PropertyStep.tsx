
import React, { useState } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import FormNavigation from '@/components/form/FormNavigation';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Euro, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  ActivityType, 
  OccupancyStatus, 
  Property, 
  PropertyAddress, 
  PropertyType 
} from '@/types/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Italian provinces for dropdown
const PROVINCES = [
  "Agrigento", "Alessandria", "Ancona", "Aosta", "Arezzo", "Ascoli Piceno", "Asti", "Avellino", 
  "Bari", "Barletta-Andria-Trani", "Belluno", "Benevento", "Bergamo", "Biella", "Bologna", 
  "Bolzano", "Brescia", "Brindisi", "Cagliari", "Caltanissetta", "Campobasso", "Carbonia-Iglesias", 
  "Caserta", "Catania", "Catanzaro", "Chieti", "Como", "Cosenza", "Cremona", "Crotone", "Cuneo", 
  "Enna", "Fermo", "Ferrara", "Firenze", "Foggia", "Forlì-Cesena", "Frosinone", "Genova", "Gorizia", 
  "Grosseto", "Imperia", "Isernia", "La Spezia", "L'Aquila", "Latina", "Lecce", "Lecco", "Livorno", 
  "Lodi", "Lucca", "Macerata", "Mantova", "Massa-Carrara", "Matera", "Messina", "Milano", "Modena", 
  "Monza e Brianza", "Napoli", "Novara", "Nuoro", "Ogliastra", "Olbia-Tempio", "Oristano", "Padova", 
  "Palermo", "Parma", "Pavia", "Perugia", "Pesaro e Urbino", "Pescara", "Piacenza", "Pisa", "Pistoia", 
  "Pordenone", "Potenza", "Prato", "Ragusa", "Ravenna", "Reggio Calabria", "Reggio Emilia", "Rieti", 
  "Rimini", "Roma", "Rovigo", "Salerno", "Medio Campidano", "Sassari", "Savona", "Siena", "Siracusa", 
  "Sondrio", "Taranto", "Teramo", "Terni", "Torino", "Trapani", "Trento", "Treviso", "Trieste", 
  "Udine", "Varese", "Venezia", "Verbano-Cusio-Ossola", "Vercelli", "Verona", "Vibo Valentia", 
  "Vicenza", "Viterbo"
];

// Default empty property template
const createEmptyProperty = (): Property => ({
  id: '',
  label: '',
  address: {
    comune: '',
    province: '',
    street: '',
    zip: ''
  },
  activity2024: 'neither',
  propertyType: 'RESIDENTIAL',
  remodeling: false,
  occupancyStatus: 'PERSONAL_USE',
  monthsOccupied: 12
});

const PropertyStep: React.FC = () => {
  const { state, addProperty, updateProperty, removeProperty } = useFormContext();
  const { properties } = state;
  
  const [currentProperty, setCurrentProperty] = useState<Property>(createEmptyProperty());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(properties.length === 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested objects (like address.comune)
      const [parent, child] = name.split('.');
      setCurrentProperty(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof Property],
          [child]: value
        }
      }));
    } else if (name === 'purchasePrice' || name === 'salePrice' || name === 'monthsOccupied') {
      // Handle numeric fields
      const numValue = value === '' ? undefined : Number(value);
      setCurrentProperty(prev => ({ ...prev, [name]: numValue }));
    } else {
      setCurrentProperty(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name.includes('.')) {
      // Handle nested objects
      const [parent, child] = name.split('.');
      setCurrentProperty(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof Property],
          [child]: value
        }
      }));
    } else {
      setCurrentProperty(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleActivityChange = (value: ActivityType) => {
    // Reset purchase/sale fields based on selection
    let updatedProperty = { ...currentProperty, activity2024: value };
    
    if (value === 'neither' || value === 'sold') {
      updatedProperty.purchaseDate = null;
      updatedProperty.purchasePrice = undefined;
    }
    
    if (value === 'neither' || value === 'purchased') {
      updatedProperty.saleDate = null;
      updatedProperty.salePrice = undefined;
    }
    
    setCurrentProperty(updatedProperty);
  };

  const handlePurchaseDateChange = (date: Date | undefined) => {
    setCurrentProperty(prev => ({ ...prev, purchaseDate: date || null }));
  };

  const handleSaleDateChange = (date: Date | undefined) => {
    setCurrentProperty(prev => ({ ...prev, saleDate: date || null }));
  };

  const handleRemodelingChange = (checked: boolean) => {
    setCurrentProperty(prev => ({ ...prev, remodeling: checked }));
  };

  const handleOccupancyStatusChange = (value: OccupancyStatus) => {
    setCurrentProperty(prev => ({ 
      ...prev, 
      occupancyStatus: value,
      // Reset months occupied to default value
      monthsOccupied: 12
    }));
  };

  const handleSubmit = () => {
    // Basic validation
    if (!currentProperty.address.comune.trim()) {
      toast.error('Please enter a comune name');
      return;
    }
    
    if (!currentProperty.address.province) {
      toast.error('Please select a province');
      return;
    }
    
    if (!currentProperty.address.street.trim()) {
      toast.error('Please enter a street address');
      return;
    }
    
    if (!currentProperty.address.zip.trim()) {
      toast.error('Please enter a ZIP code');
      return;
    }
    
    if (!currentProperty.propertyType) {
      toast.error('Please select a property type');
      return;
    }
    
    // Validate activity specific fields
    if (currentProperty.activity2024 === 'purchased' || currentProperty.activity2024 === 'both') {
      if (!currentProperty.purchaseDate) {
        toast.error('Please select a purchase date');
        return;
      }
      
      if (currentProperty.purchasePrice === undefined) {
        toast.error('Please enter a purchase price');
        return;
      }
    }
    
    if (currentProperty.activity2024 === 'sold' || currentProperty.activity2024 === 'both') {
      if (!currentProperty.saleDate) {
        toast.error('Please select a sale date');
        return;
      }
      
      if (currentProperty.salePrice === undefined) {
        toast.error('Please enter a sale price');
        return;
      }
    }
    
    // Validate months occupied (should be 1-12)
    if (currentProperty.monthsOccupied !== undefined && 
        (currentProperty.monthsOccupied < 1 || currentProperty.monthsOccupied > 12)) {
      toast.error('Months occupied must be between 1 and 12');
      return;
    }

    if (editingIndex !== null) {
      updateProperty(editingIndex, currentProperty);
      toast.success('Property updated successfully');
    } else {
      addProperty(currentProperty);
      toast.success('Property added successfully');
    }
    
    // Reset form
    setCurrentProperty(createEmptyProperty());
    setEditingIndex(null);
    setShowForm(false);
  };

  const handleEdit = (index: number) => {
    setCurrentProperty({ ...properties[index] });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index: number) => {
    removeProperty(index);
    toast.success('Property removed successfully');
  };

  const validateAndProceed = () => {
    if (properties.length === 0) {
      toast.error('Please add at least one property before proceeding');
      return false;
    }
    return true;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-form-400">Property Information</h2>
      
      {/* Show list of added properties if any */}
      {properties.length > 0 && !showForm && (
        <div className="mb-6">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-semibold">Registered Properties</h3>
            <Button 
              onClick={() => {
                setCurrentProperty(createEmptyProperty());
                setEditingIndex(null);
                setShowForm(true);
              }}
              className="bg-form-300 hover:bg-form-400 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {properties.map((property, index) => (
              <Card key={property.id} className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>
                      {property.label ? property.label : `Property ${index + 1}`}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {property.propertyType.charAt(0) + property.propertyType.slice(1).toLowerCase()} • 
                    {property.activity2024 === 'purchased' && ' Purchased in 2024'}
                    {property.activity2024 === 'sold' && ' Sold in 2024'}
                    {property.activity2024 === 'both' && ' Purchased & Sold in 2024'}
                    {property.activity2024 === 'neither' && ' Owned all year'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    <strong>Address:</strong> {property.address.street}, {property.address.comune}, {property.address.province}, {property.address.zip}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Occupancy:</strong> {property.occupancyStatus === 'PERSONAL_USE' 
                      ? 'Personal Use' 
                      : property.occupancyStatus === 'LONG_TERM_RENT' 
                        ? 'Long-term Rental' 
                        : 'Short-term Rental'} ({property.monthsOccupied} months)
                  </p>
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
      
      {/* Property form */}
      {showForm && (
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">
            {editingIndex !== null ? 'Edit Property' : 'Add New Property'}
          </h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="label">Property Label (Optional)</Label>
              <Input 
                id="label" 
                name="label" 
                placeholder="e.g. Vacation Home in Venice" 
                value={currentProperty.label || ''} 
                onChange={handleInputChange} 
                className="mt-1"
              />
            </div>
          </div>
          
          {/* Address */}
          <div className="mt-6">
            <h4 className="text-md font-medium mb-3">Property Address*</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="address.comune">Comune*</Label>
                <Input 
                  id="address.comune" 
                  name="address.comune" 
                  value={currentProperty.address.comune} 
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="address.province">Province*</Label>
                <Select 
                  value={currentProperty.address.province} 
                  onValueChange={(value) => handleSelectChange('address.province', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVINCES.map(province => (
                      <SelectItem key={province} value={province}>{province}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="address.street">Street Address*</Label>
                <Input 
                  id="address.street" 
                  name="address.street" 
                  value={currentProperty.address.street} 
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="address.zip">ZIP Code*</Label>
                <Input 
                  id="address.zip" 
                  name="address.zip" 
                  value={currentProperty.address.zip} 
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          
          {/* Property Type */}
          <div className="mt-6">
            <Label htmlFor="propertyType">Property Type*</Label>
            <Select 
              value={currentProperty.propertyType} 
              onValueChange={(value) => handleSelectChange('propertyType', value as PropertyType)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RESIDENTIAL">Residential</SelectItem>
                <SelectItem value="B&B">B&B</SelectItem>
                <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                <SelectItem value="LAND">Land</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Activity in 2024 */}
          <div className="mt-6">
            <h4 className="text-md font-medium mb-3">Activity in 2024*</h4>
            <RadioGroup 
              value={currentProperty.activity2024}
              onValueChange={(value) => handleActivityChange(value as ActivityType)}
              className="flex flex-col space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="purchased" id="purchased" />
                <Label htmlFor="purchased">Purchased Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sold" id="sold" />
                <Label htmlFor="sold">Sold Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both">Both Purchased & Sold</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="neither" id="neither" />
                <Label htmlFor="neither">Owned All Year</Label>
              </div>
            </RadioGroup>
            
            {/* Purchase Details */}
            {(currentProperty.activity2024 === 'purchased' || currentProperty.activity2024 === 'both') && (
              <div className="mt-4 pl-6 border-l-2 border-blue-200">
                <h5 className="text-sm font-medium mb-2">Purchase Details</h5>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="purchaseDate">Purchase Date*</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1",
                            !currentProperty.purchaseDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {currentProperty.purchaseDate ? (
                            format(new Date(currentProperty.purchaseDate), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 pointer-events-auto">
                        <Calendar
                          mode="single"
                          selected={currentProperty.purchaseDate || undefined}
                          onSelect={handlePurchaseDateChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label htmlFor="purchasePrice">Purchase Price (€)*</Label>
                    <div className="relative mt-1">
                      <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        id="purchasePrice" 
                        name="purchasePrice" 
                        type="number"
                        min="0"
                        value={currentProperty.purchasePrice || ''}
                        onChange={handleInputChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Sale Details */}
            {(currentProperty.activity2024 === 'sold' || currentProperty.activity2024 === 'both') && (
              <div className="mt-4 pl-6 border-l-2 border-blue-200">
                <h5 className="text-sm font-medium mb-2">Sale Details</h5>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="saleDate">Sale Date*</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1",
                            !currentProperty.saleDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {currentProperty.saleDate ? (
                            format(new Date(currentProperty.saleDate), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 pointer-events-auto">
                        <Calendar
                          mode="single"
                          selected={currentProperty.saleDate || undefined}
                          onSelect={handleSaleDateChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label htmlFor="salePrice">Sale Price (€)*</Label>
                    <div className="relative mt-1">
                      <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        id="salePrice" 
                        name="salePrice" 
                        type="number"
                        min="0"
                        value={currentProperty.salePrice || ''}
                        onChange={handleInputChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Renovations */}
          <div className="mt-6">
            <div className="flex items-center space-x-2">
              <Switch 
                id="remodeling" 
                checked={currentProperty.remodeling}
                onCheckedChange={handleRemodelingChange}
              />
              <Label htmlFor="remodeling">Property underwent remodeling/improvements in 2024</Label>
            </div>
          </div>
          
          {/* Occupancy Status */}
          <div className="mt-6">
            <h4 className="text-md font-medium mb-3">Occupancy Status*</h4>
            <RadioGroup 
              value={currentProperty.occupancyStatus}
              onValueChange={(value) => handleOccupancyStatusChange(value as OccupancyStatus)}
              className="flex flex-col space-y-3 mb-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PERSONAL_USE" id="personal" />
                <Label htmlFor="personal">Personal Use / Vacant</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="LONG_TERM_RENT" id="longTerm" />
                <Label htmlFor="longTerm">Long-Term Rental</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="SHORT_TERM_RENT" id="shortTerm" />
                <Label htmlFor="shortTerm">Short-Term Rental</Label>
              </div>
            </RadioGroup>
            
            <div>
              <Label htmlFor="monthsOccupied">Number of Months*</Label>
              <Input 
                id="monthsOccupied" 
                name="monthsOccupied" 
                type="number"
                min="1"
                max="12"
                value={currentProperty.monthsOccupied || ''}
                onChange={handleInputChange}
                className="mt-1 w-20"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowForm(false);
                setCurrentProperty(createEmptyProperty());
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
              {editingIndex !== null ? 'Update Property' : 'Add Property'}
            </Button>
          </div>
        </div>
      )}
      
      {!showForm && properties.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">No properties added yet. Please add at least one property.</p>
          <Button 
            onClick={() => {
              setShowForm(true);
              setCurrentProperty(createEmptyProperty());
            }}
            className="bg-form-300 hover:bg-form-400 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>
      )}
      
      <FormNavigation onNext={validateAndProceed} />
    </div>
  );
};

export default PropertyStep;
