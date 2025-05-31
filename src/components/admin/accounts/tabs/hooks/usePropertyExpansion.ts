
import { useState } from 'react';

export const usePropertyExpansion = () => {
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null);

  const togglePropertyExpansion = (propertyId: string) => {
    setExpandedProperty(expandedProperty === propertyId ? null : propertyId);
  };

  return {
    expandedProperty,
    togglePropertyExpansion
  };
};
