
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Owner } from '@/components/dashboard/types';
import { format } from 'date-fns';
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
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ActionButtons, AddButton } from '@/components/dashboard/tables/ActionButtons';
import OwnerDrawer from '@/components/dashboard/drawers/OwnerDrawer';

interface OwnersTableProps {
  owners: Owner[];
  onRefresh?: () => void;
}

export const OwnersTable: React.FC<OwnersTableProps> = ({ owners, onRefresh }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const handleEdit = (owner: Owner) => {
    setSelectedOwner(owner);
    setIsCreating(false);
    setDrawerOpen(true);
  };
  
  const handleDelete = async () => {
    if (!selectedOwner) return;
    
    try {
      // First check if the owner has any assignments
      const { data: assignments } = await supabase
        .from('owner_property_assignments')
        .select('id')
        .eq('owner_id', selectedOwner.id);
        
      if (assignments && assignments.length > 0) {
        toast.error('Cannot delete owner with existing property assignments. Remove assignments first.');
        setDeleteDialogOpen(false);
        return;
      }
      
      const { error } = await supabase
        .from('owners')
        .delete()
        .eq('id', selectedOwner.id);
      
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
  
  return (
    <>
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-medium">Owners</h2>
        <AddButton onClick={handleAdd} label="Add Owner" />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Tax Code</TableHead>
              <TableHead>Citizenship</TableHead>
              <TableHead>Resident in Italy</TableHead>
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
              owners.map((owner) => (
                <TableRow key={owner.id}>
                  <TableCell className="font-medium">{owner.firstName} {owner.lastName}</TableCell>
                  <TableCell>{owner.italianTaxCode}</TableCell>
                  <TableCell>{owner.citizenship}</TableCell>
                  <TableCell>{owner.isResidentInItaly ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <ActionButtons
                      onEdit={() => handleEdit(owner)}
                      onDelete={() => {
                        setSelectedOwner(owner);
                        setDeleteDialogOpen(true);
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Delete Confirmation Dialog */}
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
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Owner Drawer for Edit/Create */}
      <OwnerDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        owner={isCreating ? undefined : selectedOwner || undefined}
        onSuccess={handleOwnerSaved}
      />
    </>
  );
};
