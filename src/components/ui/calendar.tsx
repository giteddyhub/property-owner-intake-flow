
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, SelectSingleEventHandler, SelectRangeEventHandler, SelectMultipleEventHandler } from "react-day-picker";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  // Custom formatter for month labels to use abbreviated month names
  const formatMonthCaption = (date: Date) => {
    return format(date, "MMM"); // This will return abbreviated month names like "Jan", "Feb", etc.
  };

  // Fix TypeScript errors by conditionally casting the onSelect handler based on mode
  const getSelectHandler = () => {
    if (props.mode === 'range') {
      return props.onSelect as SelectRangeEventHandler;
    } else if (props.mode === 'multiple') {
      return props.onSelect as SelectMultipleEventHandler;
    }
    return props.onSelect as SelectSingleEventHandler;
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto", className)}
      classNames={{
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
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      captionLayout="dropdown-buttons"
      formatters={{ formatMonthCaption }}
      fromYear={1900}
      toYear={2025}
      onSelect={getSelectHandler()}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
