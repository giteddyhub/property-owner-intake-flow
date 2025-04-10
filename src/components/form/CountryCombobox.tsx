
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
    if (!Array.isArray(countriesArray)) {
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

  // Ensure we always have a valid array, never undefined
  const safeCountries = Array.isArray(filteredCountries) ? filteredCountries : [];

  return (
    <Combobox
      options={safeCountries}
      value={value || ""}
      onValueChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  );
};

export default CountryCombobox;
