
import { ReactNode } from "react";
import { toast as sonnerToast, type Toast } from "sonner";

export interface ToastT extends Toast {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  type?: "success" | "info" | "warning" | "error";
}

export function toast(props: ToastT) {
  const { title, description, action, type, ...options } = props;
  
  const toastOptions: Toast = {
    ...options
  };
  
  // Map type to style if provided
  if (type) {
    switch (type) {
      case "error":
        toastOptions.style = { backgroundColor: "var(--destructive)", color: "var(--destructive-foreground)" };
        break;
      case "warning":
        toastOptions.style = { backgroundColor: "var(--warning)", color: "var(--warning-foreground)" };
        break;
      case "info":
        toastOptions.style = { backgroundColor: "var(--info)", color: "var(--info-foreground)" };
        break;
      case "success":
        toastOptions.style = { backgroundColor: "var(--success)", color: "var(--success-foreground)" };
        break;
    }
  }
  
  return sonnerToast(title as string, {
    description,
    action,
    ...toastOptions
  });
}

export const useToast = () => {
  return {
    toast
  };
};
