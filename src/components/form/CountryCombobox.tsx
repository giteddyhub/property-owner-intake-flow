
import React from 'react';
import { Combobox } from "@/components/ui/select";
import { COUNTRIES } from '@/lib/countries';

interface CountryComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  excludeCountries?: string[];
}

const CountryCombobox: React.FC<CountryComboboxProps> = ({
  value,
  onChange,
  placeholder = "Select a country",
  className,
  excludeCountries = []
}) => {
  // Ensure COUNTRIES is defined and is an array before using it
  const countriesArray = Array.isArray(COUNTRIES) ? COUNTRIES : [];
  
  const filteredCountries = React.useMemo(() => {
    if (countriesArray.length === 0) return [];
    
    if (!excludeCountries || excludeCountries.length === 0) {
      return countriesArray;
    }
    
    return countriesArray.filter(country => 
      !excludeCountries.includes(country)
    );
  }, [countriesArray, excludeCountries]);

  return (
    <Combobox
      options={filteredCountries}
      value={value}
      onValueChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  );
};

export default CountryCombobox;
