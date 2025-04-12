
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator, SelectLabel, SelectGroup } from "@/components/ui/select";
import { getOrganizedCountries } from '@/lib/countries';

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
  // Get organized countries
  const { popular, other } = getOrganizedCountries();
  
  // Filter out excluded countries from both groups
  const excludeSet = new Set(excludeCountries);
  const filteredPopular = popular.filter(country => !excludeSet.has(country));
  const filteredOther = other.filter(country => !excludeSet.has(country));

  return (
    <Select
      value={value}
      onValueChange={onChange}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {/* Popular countries section */}
        <SelectGroup>
          <SelectLabel>Popular</SelectLabel>
          {filteredPopular.map((country) => (
            <SelectItem key={`popular-${country}`} value={country}>
              {country}
            </SelectItem>
          ))}
        </SelectGroup>
        
        <SelectSeparator />
        
        {/* All other countries section */}
        <SelectGroup>
          <SelectLabel>All Countries</SelectLabel>
          {filteredOther.map((country) => (
            <SelectItem key={country} value={country}>
              {country}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default CountryCombobox;
