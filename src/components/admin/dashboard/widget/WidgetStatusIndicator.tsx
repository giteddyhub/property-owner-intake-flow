
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface WidgetStatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'info';
  icon?: React.ReactNode;
}

export const WidgetStatusIndicator: React.FC<WidgetStatusIndicatorProps> = ({
  status,
  icon
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return icon;
    }
  };

  const statusIcon = getStatusIcon();

  if (!statusIcon) {
    return null;
  }

  return (
    <div className={`p-2 rounded-full ${getStatusColor()}`}>
      {statusIcon}
    </div>
  );
};
