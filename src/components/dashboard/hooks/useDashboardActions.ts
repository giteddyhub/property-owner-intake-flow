
import { useState } from 'react';

export const useDashboardActions = () => {
  const [activeDrawer, setActiveDrawer] = useState<'owner' | 'property' | 'assignment' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const openOwnerDrawer = (owner?: any) => {
    setSelectedItem(owner);
    setActiveDrawer('owner');
  };

  const openPropertyDrawer = (property?: any) => {
    setSelectedItem(property);
    setActiveDrawer('property');
  };

  const openAssignmentDrawer = (assignment?: any) => {
    setSelectedItem(assignment);
    setActiveDrawer('assignment');
  };

  const closeDrawer = () => {
    setActiveDrawer(null);
    setSelectedItem(null);
  };

  return {
    activeDrawer,
    selectedItem,
    openOwnerDrawer,
    openPropertyDrawer,
    openAssignmentDrawer,
    closeDrawer
  };
};
