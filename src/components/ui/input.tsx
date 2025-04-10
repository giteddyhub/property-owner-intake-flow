
import * as React from "react"
import { useState } from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    // Add a stable reference to maintain focus
    const inputRef = React.useRef<HTMLInputElement>(null);
    
    // Merge the refs to maintain both the forwarded ref and our internal ref
    const mergedRef = (node: HTMLInputElement) => {
      // Update our internal ref
      inputRef.current = node;
      
      // Forward the ref if it exists
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    // We only want to track focus changes, not run on every render
    const [isFocused, setIsFocused] = useState(false);
    
    // Handle focus tracking
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // Call the original onFocus if provided
      if (props.onFocus) props.onFocus(e);
    };
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      // Call the original onBlur if provided
      if (props.onBlur) props.onBlur(e);
    };
    
    // Fix focus issues by ensuring the input regains focus if it was focused before
    // This effect only runs when value changes and the input was already focused
    const value = props.value;
    React.useEffect(() => {
      if (isFocused && inputRef.current && document.activeElement !== inputRef.current) {
        // Restore focus and position cursor at the end of the input
        inputRef.current.focus();
        
        // For text/number inputs, set cursor position at the end
        if (inputRef.current.setSelectionRange && (
          type === 'text' || type === 'number' || type === undefined
        )) {
          const length = String(inputRef.current.value).length;
          // Small timeout to ensure the cursor is placed after the value is updated
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.setSelectionRange(length, length);
            }
          }, 0);
        }
      }
    }, [value, isFocused, type]);

    // Extract original event handlers to avoid duplicate calls
    const { onFocus, onBlur, ...restProps } = props;

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground placeholder:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={mergedRef}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...restProps}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
