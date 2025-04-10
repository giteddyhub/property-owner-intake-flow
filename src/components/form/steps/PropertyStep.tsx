import React, { useState, useEffect } from 'react';
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
import { CalendarIcon, Euro, Plus, Trash2, HelpCircle } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem, CardRadioGroupItem } from '@/components/ui/radio-group';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  occupancyStatuses: ['LONG_TERM_RENT'] as OccupancyStatus[],
  monthsOccupied: 12,
  rentalIncome: 0
});

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

const PropertyStep: React.FC = () => {
  const { state, addProperty, updateProperty, removeProperty } = useFormContext();
  const { properties } = state;
  
  const [currentProperty, setCurrentProperty] = useState<Property>(createEmptyProperty());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(properties.length === 0);
  const [activeStatuses, setActiveStatuses] = useState<Set<OccupancyStatus>>(new Set(['LONG_TERM_RENT']));
  const [occupancyMonths, setOccupancyMonths] = useState<Record<OccupancyStatus, number>>({
    PERSONAL_USE: 0,
    LONG_TERM_RENT: 12,
    SHORT_TERM_RENT: 0,
  });
  const [availableMonths, setAvailableMonths] = useState<Record<OccupancyStatus, number[]>>({
    PERSONAL_USE: [],
    LONG_TERM_RENT: [],
    SHORT_TERM_RENT: [],
  });

  useEffect(() => {
    const totalMonthsUsed = Object.values(occupancyMonths).reduce((sum, months) => sum + months, 0);
    const remainingMonths = 12 - totalMonthsUsed;
    
    const newAvailableMonths: Record<OccupancyStatus, number[]> = {
      PERSONAL_USE: [],
      LONG_TERM_RENT: [],
      SHORT_TERM_RENT: [],
    };
    
    Object.keys(newAvailableMonths).forEach((status) => {
      const statusKey = status as OccupancyStatus;
      const currentValue = occupancyMonths[statusKey];
      const maxAvailable = remainingMonths + currentValue;
      
      if (maxAvailable > 0) {
        newAvailableMonths[statusKey] = Array.from(
          { length: maxAvailable }, 
          (_, i) => i + 1
        );
      } else {
        newAvailableMonths[statusKey] = [];
      }
    });
    
    setAvailableMonths(newAvailableMonths);
  }, [occupancyMonths]);

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
      const [parentKey, childKey] = name.split('.');
      
      if (parentKey === 'address') {
        setCurrentProperty(prev => ({
          ...prev,
          address: {
            ...prev.address,
            [childKey]: value
          }
        }));
      }
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

  const handleOccupancyStatusChange = (status: OccupancyStatus) => {
    setActiveStatuses(prev => {
      const newStatuses = new Set(prev);
      newStatuses.add(status);
      return newStatuses;
    });
    
    if (!currentProperty.occupancyStatuses.includes(status)) {
      setCurrentProperty(prev => ({
        ...prev,
        occupancyStatuses: [...prev.occupancyStatuses, status]
      }));
    }
  };

  const handleOccupancyMonthsChange = (status: OccupancyStatus, months: number) => {
    setOccupancyMonths(prev => ({
      ...prev,
      [status]: months
    }));
    
    if (months > 0) {
      setActiveStatuses(prev => {
        const newStatuses = new Set(prev);
        newStatuses.add(status);
        return newStatuses;
      });
    }
  };

  const handleRemoveOccupancyStatus = (status: OccupancyStatus) => {
    setCurrentProperty(prev => ({
      ...prev,
      occupancyStatuses: prev.occupancyStatuses.filter(s => s !== status)
    }));
    
    setOccupancyMonths(prev => ({
      ...prev,
      [status]: 0
    }));
    
    setActiveStatuses(prev => {
      const newStatuses = new Set(prev);
      newStatuses.delete(status);
      return newStatuses;
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
    
    const hasRentalStatus = currentProperty.occupancyStatuses.some(
      status => status === 'LONG_TERM_RENT' || status === 'SHORT_TERM_RENT'
    );
    
    if (hasRentalStatus && (currentProperty.rentalIncome === undefined || currentProperty.rentalIncome < 0)) {
      toast.error('Please enter a valid rental income amount');
      return;
    }
    
    const totalMonths = Object.values(occupancyMonths).reduce((sum, val) => sum + val, 0);
    if (totalMonths !== 12) {
      toast.error('Total months must equal 12');
      return;
    }

    const activeOccupancyStatuses = Object.entries(occupancyMonths)
      .filter(([_, months]) => months > 0)
      .map(([status]) => status as OccupancyStatus);

    const finalProperty = {
      ...currentProperty,
      occupancyStatuses: activeOccupancyStatuses,
      monthsOccupied: activeOccupancyStatuses.length > 0 
        ? occupancyMonths[activeOccupancyStatuses[0]] 
        : 12
    };

    if (editingIndex !== null) {
      updateProperty(editingIndex, finalProperty);
      toast.success('Property updated successfully');
    } else {
      addProperty(finalProperty);
      toast.success('Property added successfully');
    }
    
    setCurrentProperty(createEmptyProperty());
    setEditingIndex(null);
    setShowForm(false);
    setOccupancyMonths({
      PERSONAL_USE: 0,
      LONG_TERM_RENT: 12,
      SHORT_TERM_RENT: 0,
    });
    setActiveStatuses(new Set(['LONG_TERM_RENT']));
  };

  const handleEdit = (index: number) => {
    const property = properties[index];
    const updatedProperty = {
      ...property,
      occupancyStatuses: Array.isArray(property.occupancyStatuses) 
        ? property.occupancyStatuses 
        : ['LONG_TERM_RENT' as OccupancyStatus]
    };
    
    setCurrentProperty(updatedProperty);
    setEditingIndex(index);
    setShowForm(true);
    
    const initialOccupancyMonths = {
      PERSONAL_USE: 0,
      LONG_TERM_RENT: 0,
      SHORT_TERM_RENT: 0,
    };
    
    const newActiveStatuses = new Set<OccupancyStatus>();
    
    if (updatedProperty.occupancyStatuses.length > 0) {
      updatedProperty.occupancyStatuses.forEach((status, idx) => {
        initialOccupancyMonths[status] = idx === 0 ? (updatedProperty.monthsOccupied || 12) : 1;
        newActiveStatuses.add(status);
      });
    } else {
      initialOccupancyMonths.PERSONAL_USE = 12;
      newActiveStatuses.add('PERSONAL_USE');
    }
    
    setOccupancyMonths(initialOccupancyMonths);
    setActiveStatuses(newActiveStatuses);
  };

  const handleDelete = (index: number) => {
    removeProperty(index);
    toast.success('Property removed successfully');
  };

  const handleCancel = () => {
    setCurrentProperty(createEmptyProperty());
    setEditingIndex(null);
    setShowForm(false);
    setOccupancyMonths({
      PERSONAL_USE: 0,
      LONG_TERM_RENT: 12,
      SHORT_TERM_RENT: 0,
    });
    setActiveStatuses(new Set(['LONG_TERM_RENT']));
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

  const shouldShowRentalIncome = () => {
    return currentProperty.occupancyStatuses.some(
      status => status === 'LONG_TERM_RENT' || status === 'SHORT_TERM_RENT'
    ) || activeStatuses.has('LONG_TERM_RENT') || activeStatuses.has('SHORT_TERM_RENT') ||
    occupancyMonths.LONG_TERM_RENT > 0 || occupancyMonths.SHORT_TERM_RENT > 0;
  };

  const calculateTotalMonths = () => {
    return Object.values(occupancyMonths).reduce((sum, months) => sum + months, 0);
  };

  const totalMonthsAllocated = calculateTotalMonths();
  const monthsRemaining = 12 - totalMonthsAllocated;

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
                  {(property.occupancyStatuses.includes('LONG_TERM_RENT') || 
                    property.occupancyStatuses.includes('SHORT_TERM_RENT')) && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>2024 Rental Income:</strong> €{property.rentalIncome?.toLocaleString() || '0'}
                    </p>
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
      
      {showForm ? (
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
              <Label htmlFor="remodeling">Did you do any remodeling or improvements for which a building permit was filed in the past 10 years?</Label>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-md font-medium mb-3">Rental Status*</h4>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="font-medium">Months Allocation</span>
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground ml-1 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="w-80 p-4">
                        <p>The total number of months allocated across all rental statuses must equal 12 (one full year).</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className={`text-sm font-medium ${totalMonthsAllocated === 12 ? 'text-green-600' : 'text-amber-600'}`}>
                  {totalMonthsAllocated}/12 months allocated {monthsRemaining > 0 ? `(${monthsRemaining} remaining)` : ''}
                </span>
              </div>
              <Progress 
                value={(totalMonthsAllocated / 12) * 100} 
                className={`h-2 ${totalMonthsAllocated === 12 ? 'bg-green-100' : ''}`}
                indicatorClassName={totalMonthsAllocated === 12 ? 'bg-green-600' : 'bg-amber-600'} 
              />
            </div>
            
            <div className="flex flex-col space-y-3">
              <div 
                className={cn(
                  "relative rounded-lg border p-4 transition-all cursor-pointer",
                  activeStatuses.has('LONG_TERM_RENT') || occupancyMonths.LONG_TERM_RENT > 0 
                    ? "bg-purple-50 border-purple-500 ring-1 ring-purple-500" 
                    : "bg-white border-gray-200 hover:border-gray-300"
                )}
                onClick={() => handleOccupancyStatusChange('LONG_TERM_RENT')}
              >
                <div className="flex items-center gap-2.5">
                  <Checkbox 
                    checked={activeStatuses.has('LONG_TERM_RENT') || occupancyMonths.LONG_TERM_RENT > 0}
                    className="cursor-pointer"
                  />
                  <span className="font-medium text-gray-900 cursor-pointer">Long-Term Rental</span>
                </div>
                <p className="text-sm text-gray-500 mt-1 cursor-pointer ml-7.5">
                  {occupancyExplanations.LONG_TERM_RENT}
                </p>
                
                <Collapsible 
                  open={activeStatuses.has('LONG_TERM_RENT') || occupancyMonths.LONG_TERM_RENT > 0}
                  className="mt-2 ml-7.5"
                >
                  <CollapsibleContent>
                    <Label htmlFor="long_term_months">Number of Months*</Label>
                    <div className="flex items-center gap-2">
                      <Select 
                        value={occupancyMonths.LONG_TERM_RENT.toString()}
                        onValueChange={(value) => handleOccupancyMonthsChange('LONG_TERM_RENT', parseInt(value))}
                        disabled={availableMonths.LONG_TERM_RENT.length === 0}
                      >
                        <SelectTrigger className="mt-1 w-24">
                          <SelectValue placeholder="Months" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMonths.LONG_TERM_RENT.map(month => (
                            <SelectItem key={`long-term-${month}`} value={month.toString()}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {currentProperty.occupancyStatuses.includes('LONG_TERM_RENT') && 
                      occupancyMonths.LONG_TERM_RENT > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="ml-2 text-red-500 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveOccupancyStatus('LONG_TERM_RENT');
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
              
              <div 
                className={cn(
                  "relative rounded-lg border p-4 transition-all cursor-pointer",
                  activeStatuses.has('SHORT_TERM_RENT') || occupancyMonths.SHORT_TERM_RENT > 0 
                    ? "bg-purple-50 border-purple-500 ring-1 ring-purple-500" 
                    : "bg-white border-gray-200 hover:border-gray-300"
                )}
                onClick={() => handleOccupancyStatusChange('SHORT_TERM_RENT')}
              >
                <div className="flex items-center gap-2.5">
                  <Checkbox 
                    checked={activeStatuses.has('SHORT_TERM_RENT') || occupancyMonths.SHORT_TERM_RENT > 0}
                    className="cursor-pointer"
                  />
                  <span className="font-medium text-gray-900 cursor-pointer">Short-Term Rental</span>
                </div>
                <p className="text-sm text-gray-500 mt-1 cursor-pointer ml-7.5">
                  {occupancyExplanations.SHORT_TERM_RENT}
                </p>
                
                <Collapsible 
                  open={activeStatuses.has('SHORT_TERM_RENT') || occupancyMonths.SHORT_TERM_RENT > 0}
                  className="mt-2 ml-7.5"
                >
                  <CollapsibleContent>
                    <Label htmlFor="short_term_months">Number of Months*</Label>
                    <div className="flex items-center gap-2">
                      <Select 
                        value={occupancyMonths.SHORT_TERM_RENT.toString()}
                        onValueChange={(value) => handleOccupancyMonthsChange('SHORT_TERM_RENT', parseInt(value))}
                        disabled={availableMonths.SHORT_TERM_RENT.length === 0}
                      >
                        <SelectTrigger className="mt-1 w-24">
                          <SelectValue placeholder="Months" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMonths.SHORT_TERM_RENT.map(month => (
                            <SelectItem key={`short-term-${month}`} value={month.toString()}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {currentProperty.occupancyStatuses.includes('SHORT_TERM_RENT') && 
                      occupancyMonths.SHORT_TERM_RENT > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="ml-2 text-red-500 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveOccupancyStatus('SHORT_TERM_RENT');
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
              
              <div 
                className={cn(
                  "relative rounded-lg border p-4 transition-all cursor-pointer",
                  activeStatuses.has('PERSONAL_USE') || occupancyMonths.PERSONAL_USE > 0 
                    ? "bg-purple-50 border-purple-500 ring-1 ring-purple-500" 
                    : "bg-white border-gray-200 hover:border-gray-300"
                )}
                onClick={() => handleOccupancyStatusChange('PERSONAL_USE')}
              >
                <div className="flex items-center gap-2.5">
                  <Checkbox 
                    checked={activeStatuses.has('PERSONAL_USE') || occupancyMonths.PERSONAL_USE > 0}
                    className="cursor-pointer"
                  />
                  <span className="font-medium text-gray-900 cursor-pointer">Personal Use / Vacant</span>
                </div>
                <p className="text-sm text-gray-500 mt-1 cursor-pointer ml-7.5">
                  {occupancyExplanations.PERSONAL_USE}
                </p>
                
                <Collapsible 
                  open={activeStatuses.has('PERSONAL_USE') || occupancyMonths.PERSONAL_USE > 0}
                  className="mt-2 ml-7.5"
                >
                  <CollapsibleContent>
                    <Label htmlFor="personal_use_months">Number of Months*</Label>
                    <div className="flex items-center gap-2">
                      <Select 
                        value={occupancyMonths.PERSONAL_USE.toString()}
                        onValueChange={(value) => handleOccupancyMonthsChange('PERSONAL_USE', parseInt(value))}
                        disabled={availableMonths.PERSONAL_USE.length === 0}
                      >
                        <SelectTrigger className="mt-1 w-24">
                          <SelectValue placeholder="Months" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMonths.PERSONAL_USE.map(month => (
                            <SelectItem key={`personal-${month}`} value={month.toString()}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {currentProperty.occupancyStatuses.includes('PERSONAL_USE') && 
                      occupancyMonths.PERSONAL_USE > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="ml-2 text-red-500 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveOccupancyStatus('PERSONAL_USE');
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </div>
          
          {shouldShowRentalIncome() && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">2024 Rental Income*</h4>
              <div className="relative mt-1">
                <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  id="rentalIncome" 
                  name="rentalIncome" 
                  type="number"
                  min="0"
                  placeholder="Enter rental income"
                  value={currentProperty.rentalIncome || ''}
                  onChange={handleInputChange}
                  className="pl-10"
                />
              </div>
            </div>
          )}
          
          <FormNavigation 
            isFormMode={true} 
            onCancel={handleCancel} 
            onSubmit={handleSubmit} 
            cancelText="Cancel" 
            submitButtonText={editingIndex !== null ? "Update Property" : "Add Property"}
            hideCancel={properties.length === 0 && editingIndex === null}
          />
        </div>
      ) : (
        <FormNavigation 
          onNext={validateAndProceed}
          showNext={true}
          showBack={true}
        />
      )}
    </div>
  );
};

export default PropertyStep;
