
import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

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
        "aspect-square h-5 w-5 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-purple-500 data-[state=checked]:bg-purple-100/40 cursor-pointer",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-3 w-3 fill-purple-600 text-purple-600" />
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
  }
>(({ className, title, description, children, ...props }, ref) => {
  // Generate an ID for connecting the label to the radio
  const id = React.useId();
  
  return (
    <div className={cn(
      "relative rounded-lg border border-gray-200 p-4 transition-all hover:border-gray-300 cursor-pointer",
      "data-[state=checked]:border-purple-500 data-[state=checked]:ring-1 data-[state=checked]:ring-purple-500",
      className
    )}>
      <RadioGroupPrimitive.Item
        ref={ref}
        id={id}
        className={cn(
          "absolute left-4 top-4 aspect-square h-5 w-5 rounded-full border border-gray-300 text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-purple-500 data-[state=checked]:bg-purple-100/40 cursor-pointer",
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <Circle className="h-3 w-3 fill-purple-600 text-purple-600" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
      {(title || description || children) && (
        <label htmlFor={id} className="radio-group-item-label pl-8 block cursor-pointer">
          {title && <h3 className="font-medium text-gray-900 cursor-pointer">{title}</h3>}
          {description && <p className="text-sm text-gray-500 mt-1 cursor-pointer">{description}</p>}
          {children}
        </label>
      )}
    </div>
  )
})
CardRadioGroupItem.displayName = "CardRadioGroupItem"

export { RadioGroup, RadioGroupItem, CardRadioGroupItem }
