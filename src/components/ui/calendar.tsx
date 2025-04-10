
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { 
  DayPicker, 
  type DayClickEventHandler, 
  type ActiveModifiers, 
  type DateRange,
  type DayPickerDefaultProps,
  type DayPickerSingleProps,
  type DayPickerMultipleProps,
  type DayPickerRangeProps,
  type CaptionLayout,
  type SelectSingleEventHandler,
  type SelectRangeEventHandler,
  type SelectMultipleEventHandler
} from "react-day-picker";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  onDayClick,
  mode,
  ...props
}: CalendarProps) {
  // Custom formatter for month labels to use abbreviated month names
  const formatMonthCaption = (date: Date) => {
    return format(date, "MMM"); // This will return abbreviated month names like "Jan", "Feb", etc.
  };

  // Handle day click to automatically close the popover only for single mode or when range is complete
  const handleDayClick: DayClickEventHandler = React.useCallback(
    (day, modifiers, e) => {
      // If the day is disabled, don't do anything
      if (modifiers.disabled) return;
      
      // Call the original onDayClick handler if provided
      if (onDayClick) {
        onDayClick(day, modifiers, e);
      }
      
      // Only close the calendar if it's in single mode or if a range has been completed
      // Need to check if props.selected is a DateRange with from and to properties
      const isDateRange = props.selected && 
        typeof props.selected === "object" && 
        'from' in props.selected;
      
      // Only proceed with range checking if we have a DateRange object
      const isRangeComplete = mode === "range" && 
        isDateRange && 
        (props.selected as DateRange).from && 
        (props.selected as DateRange).to;
      
      // Close in single mode or when range is complete
      if (mode !== "range" || isRangeComplete) {
        // Close any popover or dialog containing this calendar
        // This works by simulating an Escape key press
        const event = new KeyboardEvent("keydown", {
          key: "Escape",
          bubbles: true,
          cancelable: true,
        });
        document.dispatchEvent(event);
      }
    },
    [onDayClick, mode, props.selected]
  );

  // Common props without mode-specific properties
  const commonProps = {
    showOutsideDays,
    className: cn("p-3 pointer-events-auto", className),
    classNames: {
      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
      month: "space-y-4",
      caption: "flex justify-center pt-1 relative items-center mb-4",
      caption_label: "text-sm font-medium hidden", // Hide default label when using dropdowns
      caption_dropdowns: "flex gap-3 items-center justify-center w-full",
      dropdown: "p-1.5 text-sm rounded-md bg-background border border-input shadow-sm focus:ring-1 focus:ring-ring cursor-pointer",
      dropdown_month: "mr-1 font-semibold", // Added font-semibold to make Month selector bold
      dropdown_year: "font-semibold",
      nav: "hidden", // Hide navigation arrows completely
      nav_button: cn(
        buttonVariants({ variant: "outline" }),
        "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
      ),
      nav_button_previous: "absolute left-1",
      nav_button_next: "absolute right-1",
      table: "w-full border-collapse space-y-1",
      head_row: "flex",
      head_cell:
        "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
      row: "flex w-full mt-2",
      cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
      day: cn(
        buttonVariants({ variant: "ghost" }),
        "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
      ),
      day_range_end: "day-range-end",
      day_selected:
        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
      day_today: "bg-accent text-accent-foreground",
      day_outside:
        "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
      day_disabled: "text-muted-foreground opacity-50",
      day_range_middle:
        "aria-selected:bg-accent aria-selected:text-accent-foreground",
      day_hidden: "invisible",
      ...classNames,
    },
    components: {
      IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
      IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
    },
    captionLayout: "dropdown-buttons" as CaptionLayout,
    formatters: { formatMonthCaption },
    fromYear: 1900,
    toYear: 2025,
    onDayClick: handleDayClick,
  };

  // Create type-safe props objects for each mode
  if (mode === "range") {
    // Extract selected, onSelect, and other range-specific props
    const { selected, onSelect, ...otherProps } = props;
    
    // Create a properly typed range props object
    const rangeProps: DayPickerRangeProps = {
      ...commonProps,
      ...otherProps,
      mode: "range",
      selected: selected as DateRange | undefined,
      // Only include onSelect if it's a range select handler
      ...(onSelect ? { onSelect: onSelect as SelectRangeEventHandler } : {})
    };
    
    return <DayPicker {...rangeProps} />;
  } 
  
  if (mode === "single") {
    // Extract selected, onSelect, and other single-specific props
    const { selected, onSelect, ...otherProps } = props;
    
    // Create a properly typed single props object
    const singleProps: DayPickerSingleProps = {
      ...commonProps,
      ...otherProps,
      mode: "single",
      selected: selected as Date | undefined,
      // Only include onSelect if it's a single select handler
      ...(onSelect ? { onSelect: onSelect as SelectSingleEventHandler } : {})
    };
    
    return <DayPicker {...singleProps} />;
  } 
  
  if (mode === "multiple") {
    // Extract selected, onSelect, and other multiple-specific props
    const { selected, onSelect, ...otherProps } = props;
    
    // Create a properly typed multiple props object
    const multipleProps: DayPickerMultipleProps = {
      ...commonProps,
      ...otherProps,
      mode: "multiple",
      selected: selected as Date[] | undefined,
      // Only include onSelect if it's a multiple select handler
      ...(onSelect ? { onSelect: onSelect as SelectMultipleEventHandler } : {})
    };
    
    return <DayPicker {...multipleProps} />;
  }
  
  // Default mode - no selection
  // Remove any mode-specific props that don't apply to default mode
  const { selected, onSelect, ...otherProps } = props;
  
  const defaultProps: DayPickerDefaultProps = {
    ...commonProps,
    ...otherProps,
    mode: "default"
  };
  
  return <DayPicker {...defaultProps} />;
}
Calendar.displayName = "Calendar";

export { Calendar };
