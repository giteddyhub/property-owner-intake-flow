
import React, { useState } from 'react';
import { Owner } from '@/components/dashboard/types';
import { OwnersTableContent } from './owner/OwnersTableContent';
import OwnerDrawer from '@/components/dashboard/drawers/OwnerDrawer';

interface OwnersTableProps {
  owners: Owner[];
  onRefresh: () => void;
  onShowUserOverview?: (userId: string, context?: { type: 'property' | 'owner' | 'assignment'; id: string }) => void;
}

export const OwnersTable: React.FC<OwnersTableProps> = ({ 
  owners, 
  onRefresh,
  onShowUserOverview 
}) => {
  const [selectedOwner, setSelectedOwner] = useState<Owner | undefined>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleRowClick = (e: React.MouseEvent, owner: Owner) => {
    console.log('Owner row clicked:', owner);
    setSelectedOwner(owner);
    setIsDrawerOpen(true);
  };

  const handleEdit = (owner: Owner) => {
    console.log('Edit owner:', owner);
    setSelectedOwner(owner);
    setIsDrawerOpen(true);
  };

  const handleDelete = (owner: Owner) => {
    console.log('Delete owner:', owner);
    // TODO: Implement delete confirmation dialog
  };

  const handleActionClick = () => {
    console.log('Action button clicked');
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedOwner(undefined);
  };

  const handleSuccess = () => {
    onRefresh();
    handleDrawerClose();
  };

  return (
    <>
      <OwnersTableContent
        owners={owners}
        onRowClick={handleRowClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onActionClick={handleActionClick}
      />
      
      <OwnerDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        owner={selectedOwner}
        onSuccess={handleSuccess}
      />
    </>
  );
};
