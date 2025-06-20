
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SuccessToastProps {
  title: string;
  description?: string;
}

export const showSuccessToast = ({ title, description }: SuccessToastProps) => {
  toast.success(title, {
    description,
    duration: 4000,
    icon: <CheckCircle className="h-4 w-4" />,
  });
};

export const showErrorToast = (message: string) => {
  toast.error(message, {
    duration: 5000,
  });
};

export const showLoadingToast = (message: string) => {
  return toast.loading(message);
};
