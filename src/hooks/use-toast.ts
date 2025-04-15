
import { toast as sonnerToast, type ToastT, type ExternalToast } from "sonner";
import React from "react";

export type ToastProps = React.ComponentPropsWithoutRef<typeof sonnerToast>;

// Modified toast function that includes common toast methods
const toast = Object.assign(
  function toast({
    type,
    title,
    description,
    action,
    ...props
  }: Omit<ToastT, 'id'> & {
    title?: React.ReactNode
    description?: React.ReactNode
    action?: React.ReactNode
  }) {
    // Create a common props object that includes everything passed
    const toastProps = {
      description,
      action,
      ...props,
    };

    switch (type) {
      case "success":
        return sonnerToast.success(title, toastProps);
      case "info":
        return sonnerToast.info(title, toastProps);
      case "warning":
        return sonnerToast.warning(title, toastProps);
      case "error":
        return sonnerToast.error(title, toastProps);
      default:
        return sonnerToast(title, toastProps);
    }
  },
  {
    // Add direct access to the sonnerToast methods
    success: sonnerToast.success,
    error: sonnerToast.error,
    info: sonnerToast.info,
    warning: sonnerToast.warning,
    promise: sonnerToast.promise,
    loading: sonnerToast.loading,
    dismiss: sonnerToast.dismiss
  }
);

export { toast };

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
