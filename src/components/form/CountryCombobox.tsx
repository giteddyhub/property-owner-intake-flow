
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
  // Get countries using the getCountries function with safety checks
  const countriesArray = React.useMemo(() => {
    try {
      const countries = getCountries();
      return Array.isArray(countries) && countries.length > 0 ? countries : [];
    } catch (error) {
      console.error("Error fetching countries:", error);
      return [];
    }
  }, []);
  
  const filteredCountries = React.useMemo(() => {
    if (!Array.isArray(countriesArray) || countriesArray.length === 0) {
      return [];
    }
    
    // Apply exclusion filter if needed
    if (!Array.isArray(excludeCountries) || excludeCountries.length === 0) {
      return countriesArray;
    }
    
    return countriesArray.filter(country => 
      !excludeCountries.includes(country)
    );
  }, [countriesArray, excludeCountries]);

  // Always render a standard input if there are no countries available
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
