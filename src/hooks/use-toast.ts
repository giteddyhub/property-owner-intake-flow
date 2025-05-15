
import { ReactNode } from "react";
import { toast as sonnerToast } from "sonner";

// Define our own Toast type based on sonner's parameters
export interface ToastT {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  type?: "success" | "info" | "warning" | "error";
  id?: string;
  dismissible?: boolean;
  duration?: number;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";
  icon?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onAutoClose?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onClose?: (id: string) => void;
}

// Create a custom toast function with methods
const customToast = (props: ToastT) => {
  const { title, description, action, type, ...options } = props;
  
  const toastOptions: any = {
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
};

// Add custom methods to make it compatible with previous usage
export const toast = Object.assign(customToast, {
  error: (message: string) => sonnerToast.error(message),
  success: (message: string) => sonnerToast.success(message),
  info: (message: string) => sonnerToast.info(message),
  warning: (message: string) => sonnerToast.warning(message)
});

export const useToast = () => {
  return {
    toast
  };
};
