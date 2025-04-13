
import React, { useRef } from 'react';
import { Euro } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PriceInputProps {
  id: string;
  label: string;
  value: number | undefined;
  onChange: (name: string, value: string, inputRef: React.RefObject<HTMLInputElement>) => void;
}

const PriceInput: React.FC<PriceInputProps> = ({ id, label, value, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative mt-1">
        <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          id={id} 
          type="number"
          min="0"
          placeholder={`Enter ${id.toLowerCase().includes("purchase") ? "purchase" : "sale"} price`}
          value={value || ''}
          onChange={(e) => onChange(id, e.target.value, inputRef)}
          className="pl-10"
          ref={inputRef}
        />
      </div>
    </div>
  );
};

export default PriceInput;
