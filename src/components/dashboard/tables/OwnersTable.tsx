
import React, { useState } from 'react';
import { Owner } from '@/components/dashboard/types';
import { OwnersTableContent } from './owner/OwnersTableContent';
import { OwnersTableHeader } from './owner/OwnersTableHeader';
import OwnerDrawer from '@/components/dashboard/drawers/OwnerDrawer';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

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
  const { deleteOwner } = useDashboardData();
  const [selectedOwner, setSelectedOwner] = useState<Owner | undefined>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState<Owner | null>(null);

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
    setOwnerToDelete(owner);
  };

  const handleAddOwner = () => {
    console.log('Add new owner');
    setSelectedOwner(undefined);
    setIsDrawerOpen(true);
  };

  const confirmDelete = async () => {
    if (ownerToDelete) {
      const success = await deleteOwner(ownerToDelete.id);
      if (success) {
        onRefresh();
      }
      setOwnerToDelete(null);
    }
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
    <div>
      <OwnersTableHeader 
        onAddOwner={handleAddOwner}
        ownersCount={owners.length}
      />
      
      <OwnersTableContent
        owners={owners}
        onRowClick={handleRowClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onActionClick={handleActionClick}
        onAddOwner={handleAddOwner}
      />
      
      <OwnerDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        owner={selectedOwner}
        onSuccess={handleSuccess}
      />

      <AlertDialog open={!!ownerToDelete} onOpenChange={() => setOwnerToDelete(null)}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Owner
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the owner "{ownerToDelete?.firstName} {ownerToDelete?.lastName}" and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
