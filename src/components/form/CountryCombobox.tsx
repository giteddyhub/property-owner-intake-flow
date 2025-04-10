
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
  const filteredCountries = React.useMemo(() => {
    // Make sure COUNTRIES is defined and is an array before filtering
    if (!Array.isArray(COUNTRIES)) {
      console.error("COUNTRIES is not an array:", COUNTRIES);
      return [];
    }
    
    if (excludeCountries.length === 0) return COUNTRIES;
    return COUNTRIES.filter(country => !excludeCountries.includes(country));
  }, [excludeCountries]);

  return (
    <Combobox
      options={filteredCountries || []} // Ensure we always pass an array
      value={value}
      onValueChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  );
};

export default CountryCombobox;
