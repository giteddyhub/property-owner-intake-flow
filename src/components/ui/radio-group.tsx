
import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Check, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-5 w-5 rounded-full border border-gray-300 text-white ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 cursor-pointer",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-white" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

// Create a card-style radio item that matches the example image
const CardRadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
    title?: string;
    description?: string;
    explanation?: string;
    children?: React.ReactNode;
    hideRadio?: boolean;
  }
>(({ className, title, description, explanation, children, hideRadio = false, ...props }, ref) => {
  // Generate an ID for connecting the label to the radio
  const id = React.useId();
  
  return (
    <div className={cn(
      "relative rounded-lg border border-gray-200 p-4 transition-all hover:border-gray-300 cursor-pointer",
      "data-[state=checked]:border-purple-500 data-[state=checked]:ring-1 data-[state=checked]:ring-purple-500",
      props.checked ? "bg-purple-50" : "bg-white",
      className
    )}
    onClick={(e) => {
      // This ensures the click propagates to the radio input
      const radioInput = e.currentTarget.querySelector('button[role="radio"]');
      if (radioInput) {
        (radioInput as HTMLElement).click();
      }
    }}>
      {!hideRadio && (
        <div className="flex items-center gap-2.5">
          <RadioGroupPrimitive.Item
            ref={ref}
            id={id}
            className={cn(
              "aspect-square h-5 w-5 rounded-full border border-gray-300 text-white ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 cursor-pointer",
            )}
            {...props}
          >
            <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
              <Circle className="h-2.5 w-2.5 fill-current text-white" />
            </RadioGroupPrimitive.Indicator>
          </RadioGroupPrimitive.Item>
          {title && <span className="font-medium text-gray-900 cursor-pointer">{title}</span>}
        </div>
      )}
      {description && <p className="text-sm text-gray-500 mt-1 cursor-pointer ml-7.5">{description}</p>}
      
      {/* This is the container that will expand when checked to show the explanation and form fields */}
      <div className={cn(
        "radio-explanation mt-2",
        !title && !description ? "" : "ml-7.5",
        props.checked ? "show" : ""
      )}>
        {explanation && (
          <p className="text-sm text-gray-600 mb-3 cursor-pointer">
            {explanation}
          </p>
        )}
        {props.checked && children}
      </div>
    </div>
  )
})
CardRadioGroupItem.displayName = "CardRadioGroupItem"

export { RadioGroup, RadioGroupItem, CardRadioGroupItem }
