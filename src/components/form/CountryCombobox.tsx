
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
    if (countriesArray.length === 0) {
      console.warn("No countries available in the COUNTRIES array");
      return [];
    }
    
    if (!excludeCountries || excludeCountries.length === 0) {
      return countriesArray;
    }
    
    return countriesArray.filter(country => 
      !excludeCountries.includes(country)
    );
  }, [countriesArray, excludeCountries]);

  // Add additional safeguard
  if (filteredCountries.length === 0) {
    console.warn("No countries available after filtering");
    // Return a simpler input if no countries are available
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          className
        )}
      />
    );
  }

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

// Add missing import
const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

export default CountryCombobox;
