
import React, { useState } from 'react';
import { Property } from '@/components/dashboard/types';
import { PropertiesTableContent } from './property/PropertiesTableContent';
import PropertyDrawer from '@/components/dashboard/drawers/PropertyDrawer';

interface PropertiesTableProps {
  properties: Property[];
  onRefresh: () => void;
  onShowUserOverview?: (userId: string, context?: { type: 'property' | 'owner' | 'assignment'; id: string }) => void;
}

export const PropertiesTable: React.FC<PropertiesTableProps> = ({ 
  properties, 
  onRefresh,
  onShowUserOverview 
}) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | undefined>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleRowClick = (e: React.MouseEvent, property: Property) => {
    console.log('Property row clicked:', property);
    setSelectedProperty(property);
    setIsDrawerOpen(true);
  };

  const handleEdit = (property: Property) => {
    console.log('Edit property:', property);
    setSelectedProperty(property);
    setIsDrawerOpen(true);
  };

  const handleDelete = (property: Property) => {
    console.log('Delete property:', property);
    // TODO: Implement delete confirmation dialog
  };

  const handleActionClick = () => {
    console.log('Action button clicked');
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedProperty(undefined);
  };

  const handleSuccess = () => {
    onRefresh();
    handleDrawerClose();
  };

  return (
    <>
      <PropertiesTableContent
        properties={properties}
        onRowClick={handleRowClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onActionClick={handleActionClick}
      />
      
      <PropertyDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        property={selectedProperty}
        onSuccess={handleSuccess}
      />
    </>
  );
};
