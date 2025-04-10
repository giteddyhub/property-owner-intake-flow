
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
    if (excludeCountries.length === 0) return COUNTRIES;
    return COUNTRIES.filter(country => !excludeCountries.includes(country));
  }, [excludeCountries]);

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
