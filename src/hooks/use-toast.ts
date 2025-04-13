
import { toast as sonnerToast, ToastT, type ExternalToast } from "sonner";
import React from "react";

export type ToastProps = React.ComponentPropsWithoutRef<typeof sonnerToast>;

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
    dismiss: sonnerToast.dismiss,
    error: sonnerToast.error,
    success: sonnerToast.success,
    info: sonnerToast.info,
    warning: sonnerToast.warning,
    promise: sonnerToast.promise,
    loading: sonnerToast.loading,
    custom: sonnerToast
  };
};
