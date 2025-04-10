
import * as React from "react"

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

    // Handle value changes without losing focus
    React.useEffect(() => {
      // If the input is the active element and gets blurred during re-renders,
      // we want to refocus it
      const activeElement = document.activeElement;
      const isInputFocused = activeElement === inputRef.current;
      
      if (isInputFocused && inputRef.current) {
        // Restore focus and position cursor at the end
        const length = inputRef.current.value.length;
        inputRef.current.focus();
        inputRef.current.setSelectionRange(length, length);
      }
    });

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground placeholder:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={mergedRef}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
