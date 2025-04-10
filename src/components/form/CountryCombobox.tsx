
import React from 'react';
import { Combobox } from "@/components/ui/select";
import { getCountries } from '@/lib/countries';
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
  // Get countries with robust error handling
  const countriesArray = React.useMemo(() => {
    try {
      const countries = getCountries();
      // Ensure we have a valid array of strings
      if (!Array.isArray(countries)) {
        console.error("Countries is not an array:", countries);
        return [];
      }
      // Filter out any non-string values
      return countries.filter(country => typeof country === 'string');
    } catch (error) {
      console.error("Error fetching countries:", error);
      return [];
    }
  }, []);
  
  // Apply exclusion filter with safety checks
  const filteredCountries = React.useMemo(() => {
    // Make sure countriesArray is a valid array
    if (!Array.isArray(countriesArray) || countriesArray.length === 0) {
      return [];
    }
    
    // Make sure excludeCountries is a valid array, if not just return all countries
    if (!Array.isArray(excludeCountries)) {
      return countriesArray;
    }
    
    // Filter out excluded countries
    return countriesArray.filter(country => 
      !excludeCountries.includes(country)
    );
  }, [countriesArray, excludeCountries]);

  // Fallback to a simple input if no countries are available
  if (!Array.isArray(filteredCountries) || filteredCountries.length === 0) {
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

  // Use the Combobox component with explicit array check
  return (
    <Combobox
      options={Array.isArray(filteredCountries) ? filteredCountries : []}
      value={value || ""}
      onValueChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  );
};

export default CountryCombobox;
