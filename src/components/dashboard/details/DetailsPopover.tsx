
import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DetailsPopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const DetailsPopover = ({
  trigger,
  children,
  open,
  onOpenChange,
}: DetailsPopoverProps) => {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <ScrollArea className="max-h-[500px]">
          <div className="p-4">{children}</div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
