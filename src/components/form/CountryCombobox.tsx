
import React from 'react';
import { Combobox } from "@/components/ui/select";
import { COUNTRIES } from '@/lib/countries';
import { cn } from "@/lib/utils";

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
  // Make sure we have a valid array to work with
  const countriesArray = React.useMemo(() => {
    // Defensive check to ensure COUNTRIES is an array
    if (!COUNTRIES || !Array.isArray(COUNTRIES)) {
      console.warn("CountryCombobox: COUNTRIES is not a valid array", COUNTRIES);
      return [] as string[];
    }
    return [...COUNTRIES];
  }, []);
  
  const filteredCountries = React.useMemo(() => {
    // Defensive check for empty countries
    if (!countriesArray || countriesArray.length === 0) {
      return [] as string[];
    }
    
    // Apply exclusion filter if needed
    if (!excludeCountries || !Array.isArray(excludeCountries) || excludeCountries.length === 0) {
      return countriesArray;
    }
    
    return countriesArray.filter(country => 
      typeof country === 'string' && !excludeCountries.includes(country)
    );
  }, [countriesArray, excludeCountries]);

  // Always render a standard input if there are no countries available
  if (!filteredCountries || filteredCountries.length === 0) {
    console.warn("CountryCombobox: No filtered countries available");
    return (
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          className
        )}
      />
    );
  }

  // Use the safer implementation of Combobox
  return (
    <Combobox
      options={filteredCountries}
      value={value || ""}
      onValueChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  );
};

export default CountryCombobox;
