
import { toast as sonnerToast, ToastT, Toast } from "sonner";
import React from "react";

export type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

export function toast({
  type,
  title,
  description,
  action,
  ...props
}: ToastT & {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}) {
  switch (type) {
    case "success":
      return sonnerToast.success(title, {
        description,
        action,
        ...props,
      });
    case "info":
      return sonnerToast.info(title, {
        description,
        action,
        ...props,
      });
    case "warning":
      return sonnerToast.warning(title, {
        description,
        action,
        ...props,
      });
    case "error":
      return sonnerToast.error(title, {
        description,
        action,
        ...props,
      });
    default:
      return sonnerToast(title, {
        description,
        action,
        ...props,
      });
  }
}

export const useToast = () => {
  return {
    toast,
    toasts: sonnerToast
  };
};
