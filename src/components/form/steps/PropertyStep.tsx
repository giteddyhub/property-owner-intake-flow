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
import { Checkbox } from '@/components/ui/checkbox'; 
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
import { RadioGroup, CardRadioGroupItem } from '@/components/ui/radio-group';

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
  occupancyStatuses: ['PERSONAL_USE'], // Initialize with PERSONAL_USE as default
  monthsOccupied: 12
});

const PropertyStep: React.FC = () => {
  const { state, addProperty, updateProperty, removeProperty } = useFormContext();
  const { properties } = state;
  
  const [currentProperty, setCurrentProperty] = useState<Property>(createEmptyProperty());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(properties.length === 0);

  const activityExplanations = {
    purchased: "Select this if you purchased the property during 2024 but did not sell it. You'll need to provide the purchase date and price.",
    sold: "Select this if you sold the property during 2024 but did not purchase it in the same year. You'll need to provide the sale date and price.",
    both: "Select this if you both purchased and sold this property during 2024. You'll need to provide details for both transactions.",
    neither: "Select this if you owned the property throughout 2024 without purchasing or selling it."
  };

  const occupancyExplanations = {
    PERSONAL_USE: "Select this if the property was used personally by you or your family, or if it was vacant during the period.",
    LONG_TERM_RENT: "Select this if the property was rented out with a long-term lease agreement (typically more than 30 days).",
    SHORT_TERM_RENT: "Select this if the property was rented out for short periods (less than 30 days), such as vacation rentals or Airbnb."
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      setCurrentProperty(prev => {
        if (name === 'address.comune') {
          return {
            ...prev,
            address: {
              ...prev.address,
              comune: value
            }
          };
        }
        return prev;
      });
    } else if (name === 'purchasePrice' || name === 'salePrice' || name === 'monthsOccupied') {
      const numValue = value === '' ? undefined : Number(value);
      setCurrentProperty(prev => ({ ...prev, [name]: numValue }));
    } else {
      setCurrentProperty(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name.includes('.')) {
      setCurrentProperty(prev => {
        if (name === 'address.province') {
          return {
            ...prev,
            address: {
              ...prev.address,
              province: value
            }
          };
        }
        return prev;
      });
    } else {
      setCurrentProperty(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleActivityChange = (value: ActivityType) => {
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

  const handleOccupancyStatusChange = (status: OccupancyStatus, checked: boolean) => {
    setCurrentProperty(prev => {
      if (checked) {
        return {
          ...prev,
          occupancyStatuses: [...prev.occupancyStatuses.filter(s => s !== status), status]
        };
      } else {
        const newStatuses = prev.occupancyStatuses.filter(s => s !== status);
        return {
          ...prev,
          occupancyStatuses: newStatuses.length > 0 ? newStatuses : prev.occupancyStatuses
        };
      }
    });
  };

  const handleSubmit = () => {
    if (!currentProperty.label?.trim()) {
      toast.error('Please enter a property name');
      return;
    }
    
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
    
    if (currentProperty.occupancyStatuses.length === 0) {
      toast.error('Please select at least one rental status');
      return;
    }
    
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
    
    setCurrentProperty(createEmptyProperty());
    setEditingIndex(null);
    setShowForm(false);
  };

  const handleEdit = (index: number) => {
    const property = properties[index];
    const updatedProperty = {
      ...property,
      occupancyStatuses: Array.isArray(property.occupancyStatuses) 
        ? property.occupancyStatuses 
        : ['PERSONAL_USE']
    };
    
    setCurrentProperty(updatedProperty);
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

  const formatOccupancyStatuses = (statuses: OccupancyStatus[]) => {
    const statusMap = {
      PERSONAL_USE: 'Personal Use',
      LONG_TERM_RENT: 'Long-term Rental',
      SHORT_TERM_RENT: 'Short-term Rental'
    };
    
    return statuses.map(status => statusMap[status]).join(', ');
  };

  const PurchaseDateCalendar = () => (
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
  );

  const PurchasePriceInput = () => (
    <div>
      <Label htmlFor="purchasePrice">Purchase Price (€)*</Label>
      <div className="relative mt-1">
        <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          id="purchasePrice" 
          name="purchasePrice" 
          type="number"
          min="0"
          placeholder="Enter purchase price"
          value={currentProperty.purchasePrice || ''}
          onChange={handleInputChange}
          className="pl-10"
        />
      </div>
    </div>
  );

  const SaleDateCalendar = () => (
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
  );

  const SalePriceInput = () => (
    <div>
      <Label htmlFor="salePrice">Sale Price (€)*</Label>
      <div className="relative mt-1">
        <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          id="salePrice" 
          name="salePrice" 
          type="number"
          min="0"
          placeholder="Enter sale price"
          value={currentProperty.salePrice || ''}
          onChange={handleInputChange}
          className="pl-10"
        />
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-form-400">Property Information</h2>
      
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
                    <strong>Rental Status:</strong> {
                      Array.isArray(property.occupancyStatuses) 
                        ? formatOccupancyStatuses(property.occupancyStatuses)
                        : 'Not specified'
                    } ({property.monthsOccupied} months)
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
      
      {showForm && (
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">
            {editingIndex !== null ? 'Edit Property' : 'Add New Property'}
          </h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="label">Property Name*</Label>
              <Input 
                id="label" 
                name="label" 
                placeholder="e.g. Vacation Home in Venice" 
                value={currentProperty.label || ''} 
                onChange={handleInputChange} 
                className="mt-1"
                required
              />
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-md font-medium mb-3">Property Address*</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="address.comune">Comune*</Label>
                <Input 
                  id="address.comune" 
                  name="address.comune" 
                  placeholder="e.g. Roma, Milano, Firenze"
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
                  placeholder="e.g. Via Roma 123"
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
                  placeholder="e.g. 00100"
                  value={currentProperty.address.zip} 
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          
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
          
          <div className="mt-6">
            <h4 className="text-md font-medium mb-3">Activity in 2024*</h4>
            <RadioGroup 
              value={currentProperty.activity2024}
              onValueChange={(value) => handleActivityChange(value as ActivityType)}
              className="flex flex-col space-y-3"
            >
              <CardRadioGroupItem 
                value="purchased" 
                id="purchased" 
                checked={currentProperty.activity2024 === 'purchased'}
                title="Purchased Only"
                explanation={activityExplanations.purchased}
              >
                <div className="grid gap-4 md:grid-cols-2 mt-2">
                  <PurchaseDateCalendar />
                  <PurchasePriceInput />
                </div>
              </CardRadioGroupItem>
              
              <CardRadioGroupItem 
                value="sold" 
                id="sold" 
                checked={currentProperty.activity2024 === 'sold'}
                title="Sold Only"
                explanation={activityExplanations.sold}
              >
                <div className="grid gap-4 md:grid-cols-2 mt-2">
                  <SaleDateCalendar />
                  <SalePriceInput />
                </div>
              </CardRadioGroupItem>
              
              <CardRadioGroupItem 
                value="both" 
                id="both" 
                checked={currentProperty.activity2024 === 'both'}
                title="Both Purchased & Sold"
                explanation={activityExplanations.both}
              >
                <div className="mt-2">
                  <h5 className="text-sm font-medium mb-2">Purchase Details</h5>
                  <div className="grid gap-4 md:grid-cols-2">
                    <PurchaseDateCalendar />
                    <PurchasePriceInput />
                  </div>
                  
                  <h5 className="text-sm font-medium mb-2 mt-4">Sale Details</h5>
                  <div className="grid gap-4 md:grid-cols-2">
                    <SaleDateCalendar />
                    <SalePriceInput />
                  </div>
                </div>
              </CardRadioGroupItem>
              
              <CardRadioGroupItem 
                value="neither" 
                id="neither" 
                checked={currentProperty.activity2024 === 'neither'}
                title="Owned All Year"
                explanation={activityExplanations.neither}
              >
                <p className="text-sm text-gray-600 mt-2">No additional information needed.</p>
              </CardRadioGroupItem>
            </RadioGroup>
          </div>
          
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
          
          <div className="mt-6">
            <h4 className="text-md font-medium mb-3">Rental Status*</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="personal_use" 
                  checked={currentProperty.occupancyStatuses.includes('PERSONAL_USE')}
                  onCheckedChange={(checked) => 
                    handleOccupancyStatusChange('PERSONAL_USE', checked as boolean)
                  }
                />
                <div>
                  <Label 
                    htmlFor="personal_use" 
                    className="text-sm font-medium cursor-pointer"
                  >
                    Personal Use / Vacant
                  </Label>
                  <p className="text-xs text-gray-500">{occupancyExplanations.PERSONAL_USE}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="long_term_rent" 
                  checked={currentProperty.occupancyStatuses.includes('LONG_TERM_RENT')}
                  onCheckedChange={(checked) => 
                    handleOccupancyStatusChange('LONG_TERM_RENT', checked as boolean)
                  }
                />
                <div>
                  <Label 
                    htmlFor="long_term_rent" 
                    className="text-sm font-medium cursor-pointer"
                  >
                    Long-Term Rental
                  </Label>
                  <p className="text-xs text-gray-500">{occupancyExplanations.LONG_TERM_RENT}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="short_term_rent" 
                  checked={currentProperty.occupancyStatuses.includes('SHORT_TERM_RENT')}
                  onCheckedChange={(checked) => 
                    handleOccupancyStatusChange('SHORT_TERM_RENT', checked as boolean)
                  }
                />
                <div>
                  <Label 
                    htmlFor="short_term_rent" 
                    className="text-sm font-medium cursor-pointer"
                  >
                    Short-Term Rental
                  </Label>
                  <p className="text-xs text-gray-500">{occupancyExplanations.SHORT_TERM_RENT}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <Label htmlFor="monthsOccupied">Number of Months*</Label>
                <Input 
                  id="monthsOccupied" 
                  name="monthsOccupied" 
                  type="number"
                  min="1"
                  max="12"
                  placeholder="e.g. 12"
                  value={currentProperty.monthsOccupied || ''}
                  onChange={handleInputChange}
                  className="mt-1 w-20"
                />
              </div>
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
