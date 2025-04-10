
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

// Basic input fallback component
const BasicInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, placeholder, className }) => {
  return (
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    />
  );
};

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
      
      // Defensive programming - check if the result is a proper array
      if (!Array.isArray(countries)) {
        console.error("getCountries() did not return an array:", countries);
        return [];
      }
      
      // Ensure we have a valid array of strings
      return countries.filter(country => typeof country === 'string');
    } catch (error) {
      console.error("Error fetching countries:", error);
      return [];
    }
  }, []);
  
  // Safety check for countriesArray
  if (!Array.isArray(countriesArray) || countriesArray.length === 0) {
    return (
      <BasicInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
      />
    );
  }
  
  // Apply exclusion filter with safety checks
  const filteredCountries = React.useMemo(() => {
    // Safety check for excludeCountries
    if (!Array.isArray(excludeCountries)) {
      return countriesArray;
    }
    
    // Filter out excluded countries
    return countriesArray.filter(country => 
      !excludeCountries.includes(country)
    );
  }, [countriesArray, excludeCountries]);

  // Final safety check
  if (!Array.isArray(filteredCountries) || filteredCountries.length === 0) {
    return (
      <BasicInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
      />
    );
  }

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
