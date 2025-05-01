
import React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Create a completely separate basic input for fallback
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

interface ComboboxProps {
  options: readonly string[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  triggerClassName?: string;
}

export const Combobox = ({
  options,
  value,
  onValueChange,
  placeholder = "Select option",
  emptyMessage = "No results found.",
  className,
  triggerClassName,
}: ComboboxProps) => {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // First defensive check - if options is undefined or null, return input
  if (!options) {
    console.warn("Combobox: options is undefined or null");
    return (
      <BasicInput
        value={value || ""}
        onChange={onValueChange}
        placeholder={placeholder}
        className={className}
      />
    );
  }

  // Second defensive check - ensure options is an array
  if (!Array.isArray(options)) {
    console.warn("Combobox: options is not an array:", options);
    return (
      <BasicInput
        value={value || ""}
        onChange={onValueChange}
        placeholder={placeholder}
        className={className}
      />
    );
  }

  // Third defensive check - ensure array has items
  if (options.length === 0) {
    console.warn("Combobox: options array is empty");
    return (
      <BasicInput
        value={value || ""}
        onChange={onValueChange}
        placeholder={placeholder}
        className={className}
      />
    );
  }

  // Initialize filteredOptions as a guaranteed array with a default empty array
  const emptyArray: string[] = [];
  let filteredOptions: string[] = [...emptyArray];
  
  try {
    // Filter options based on search with full error handling
    if (searchQuery.trim() === "") {
      // When no search, use all options - ensure we're creating a new array
      filteredOptions = [...options];
    } else {
      // When searching, filter options that include the search text (case insensitive)
      filteredOptions = options.filter(option => 
        typeof option === 'string' && option.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  } catch (err) {
    console.error("Error filtering options:", err);
    // Fall back to the full options list if we can
    try {
      filteredOptions = [...options];
    } catch (e) {
      console.error("Failed to copy options array:", e);
      filteredOptions = [...emptyArray];
    }
  }

  // Final safety check - ensure filteredOptions is a valid array
  if (!Array.isArray(filteredOptions)) {
    filteredOptions = [...emptyArray];
  }

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(!open);
  };

  const handleSelectItem = (itemValue: string) => {
    onValueChange(itemValue);
    setSearchQuery("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            triggerClassName
          )}
          onClick={handleTriggerClick}
        >
          {value || <span className="text-muted-foreground">{placeholder}</span>}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn("p-0", className)} 
        align="start" 
        side="bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <Command className="w-full">
          <CommandInput
            placeholder="Search..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-9"
            onKeyDown={(e) => {
              // Prevent propagation of keyboard events that might affect parent components
              e.stopPropagation();
            }}
          />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup className="max-h-[200px] overflow-y-auto">
            {filteredOptions.map((option) => (
              <CommandItem
                key={option}
                value={option}
                onSelect={() => handleSelectItem(option)}
                onClick={(e) => e.stopPropagation()}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option ? "opacity-100" : "opacity-0"
                  )}
                />
                {option}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
