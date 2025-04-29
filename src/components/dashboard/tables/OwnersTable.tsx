import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Owner } from '@/components/dashboard/types';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ActionButtons, AddButton } from '@/components/dashboard/tables/ActionButtons';
import OwnerDrawer from '@/components/dashboard/drawers/OwnerDrawer';
import { DetailsPopover } from '@/components/dashboard/details/DetailsPopover';
import { OwnerDetails } from '@/components/dashboard/details/OwnerDetails';

interface OwnersTableProps {
  owners: Owner[];
  onRefresh?: () => void;
}

export const OwnersTable: React.FC<OwnersTableProps> = ({
  owners,
  onRefresh
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const handleEdit = (e: React.MouseEvent, owner: Owner) => {
    // Stop event propagation to prevent the row click from firing
    e.stopPropagation();
    
    setSelectedOwner(owner);
    setIsCreating(false);
    setDrawerOpen(true);
  };
  
  const handleDelete = (e: React.MouseEvent, owner: Owner) => {
    // Stop event propagation to prevent the row click from firing
    e.stopPropagation();
    
    setSelectedOwner(owner);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!selectedOwner) return;
    
    try {
      const {
        data: assignments
      } = await supabase.from('owner_property_assignments').select('id').eq('owner_id', selectedOwner.id);
      
      if (assignments && assignments.length > 0) {
        toast.error('Cannot delete owner with existing property assignments. Remove assignments first.');
        setDeleteDialogOpen(false);
        return;
      }
      
      const {
        error
      } = await supabase.from('owners').delete().eq('id', selectedOwner.id);
      
      if (error) throw error;
      
      toast.success('Owner deleted successfully');
      setDeleteDialogOpen(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error deleting owner:', error);
      toast.error('Failed to delete owner');
    }
  };
  
  const handleAdd = () => {
    setSelectedOwner(null);
    setIsCreating(true);
    setDrawerOpen(true);
  };
  
  const handleOwnerSaved = () => {
    if (onRefresh) onRefresh();
  };
  
  const handleRowClick = (owner: Owner) => {
    // Only set details if we're not already opening the drawer
    if (!drawerOpen) {
      setSelectedOwner(owner);
      setDetailsOpen(true);
    }
  };

  return (
    <>
      <div className="flex justify-start mb-4">
        <AddButton onClick={handleAdd} label="Add Owner" />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Tax Code</TableHead>
              <TableHead>Citizenship</TableHead>
              <TableHead>Tax Resident in Italy</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {owners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No owners found.
                </TableCell>
              </TableRow>
            ) : (
              owners.map(owner => (
                <TableRow 
                  key={owner.id} 
                  className="cursor-pointer"
                  onClick={() => handleRowClick(owner)}
                >
                  <TableCell className="font-medium">{owner.firstName} {owner.lastName}</TableCell>
                  <TableCell>{owner.italianTaxCode}</TableCell>
                  <TableCell>{owner.citizenship}</TableCell>
                  <TableCell>{owner.isResidentInItaly ? 'Yes' : 'No'}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="action-buttons">
                      <ActionButtons
                        onEdit={(e) => handleEdit(e, owner)}
                        onDelete={(e) => handleDelete(e, owner)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {selectedOwner && (
        <DetailsPopover 
          trigger={<div />} 
          {/* Only show details if drawer is not open */}
          open={detailsOpen && !drawerOpen}
          onOpenChange={setDetailsOpen}
        >
          <OwnerDetails owner={selectedOwner} />
        </DetailsPopover>
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this owner?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the owner and all of its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <OwnerDrawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        owner={isCreating ? undefined : selectedOwner || undefined} 
        onSuccess={handleOwnerSaved} 
      />
    </>
  );
};
