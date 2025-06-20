
import React, { useState } from 'react';
import { Owner } from '@/components/dashboard/types';
import { OwnersTableContent } from './owner/OwnersTableContent';
import { OwnersTableHeader } from './owner/OwnersTableHeader';
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
  onOpenDrawer: (owner?: Owner) => void;
}

export const OwnersTable: React.FC<OwnersTableProps> = ({ 
  owners, 
  onRefresh,
  onShowUserOverview,
  onOpenDrawer
}) => {
  const { deleteOwner } = useDashboardData();
  const [ownerToDelete, setOwnerToDelete] = useState<Owner | null>(null);

  const handleRowClick = (e: React.MouseEvent, owner: Owner) => {
    console.log('Owner row clicked:', owner);
    onOpenDrawer(owner);
  };

  const handleEdit = (owner: Owner) => {
    console.log('Edit owner:', owner);
    onOpenDrawer(owner);
  };

  const handleDelete = (owner: Owner) => {
    console.log('Delete owner:', owner);
    setOwnerToDelete(owner);
  };

  const handleAddOwner = () => {
    console.log('Add new owner');
    onOpenDrawer();
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
