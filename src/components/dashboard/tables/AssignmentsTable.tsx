import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Owner, Property, OwnerPropertyAssignment } from '@/components/dashboard/types';
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
import { format } from 'date-fns';
import AssignmentDrawer from '@/components/dashboard/drawers/AssignmentDrawer';
import { Badge } from '@/components/ui/badge';
import { DetailsPopover } from '@/components/dashboard/details/DetailsPopover';
import { AssignmentDetails } from '@/components/dashboard/details/AssignmentDetails';

interface AssignmentsTableProps {
  assignments: OwnerPropertyAssignment[];
  owners: Owner[];
  properties: Property[];
  onRefresh?: () => void;
}

export const AssignmentsTable: React.FC<AssignmentsTableProps> = ({ 
  assignments, 
  owners, 
  properties,
  onRefresh
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<OwnerPropertyAssignment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isActionClick, setIsActionClick] = useState(false);
  
  const getOwnerById = (id: string): Owner | undefined => {
    return owners.find(owner => owner.id === id);
  };
  
  const getPropertyById = (id: string): Property | undefined => {
    return properties.find(property => property.id === id);
  };
  
  const handleEdit = (assignment: OwnerPropertyAssignment) => {
    setSelectedAssignment(assignment);
    setIsCreating(false);
    setDrawerOpen(true);
    // Ensure details popup doesn't show
    setDetailsOpen(false);
  };
  
  const handleDelete = async () => {
    if (!selectedAssignment || !selectedAssignment.id) return;
    
    try {
      const { error } = await supabase
        .from('owner_property_assignments')
        .delete()
        .eq('id', selectedAssignment.id);
      
      if (error) throw error;
      
      toast.success('Assignment deleted successfully');
      setDeleteDialogOpen(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    }
  };
  
  const handleAdd = () => {
    setSelectedAssignment(null);
    setIsCreating(true);
    setDrawerOpen(true);
  };
  
  const handleAssignmentSaved = () => {
    if (onRefresh) onRefresh();
  };
  
  const handleRowClick = (e: React.MouseEvent, assignment: OwnerPropertyAssignment) => {
    // Prevent row click if action buttons were clicked
    if (isActionClick) {
      setIsActionClick(false);
      return;
    }
    
    // Don't navigate or trigger form submission on row clicks
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedAssignment(assignment);
    setDetailsOpen(true);
  };
  
  return (
    <>
      <div className="flex justify-start mb-4">
        <AddButton onClick={handleAdd} label="Add Assignment" />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Ownership %</TableHead>
              <TableHead>Residency</TableHead>
              <TableHead>Tax Credits</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No assignments found.
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => {
                const property = getPropertyById(assignment.propertyId);
                const owner = getOwnerById(assignment.ownerId);
                
                return (
                  <TableRow 
                    key={assignment.id || `${assignment.ownerId}-${assignment.propertyId}`}
                    className="cursor-pointer"
                    onClick={(e) => handleRowClick(e, assignment)}
                  >
                    <TableCell>
                      {property ? property.label : 'Unknown Property'}
                    </TableCell>
                    <TableCell>
                      {owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown Owner'}
                    </TableCell>
                    <TableCell>{assignment.ownershipPercentage}%</TableCell>
                    <TableCell>
                      {assignment.residentAtProperty ? (
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resident</Badge>
                          {assignment.residentDateRange?.from && (
                            <span className="text-xs text-gray-500">
                              From: {format(new Date(assignment.residentDateRange.from), 'MMM d, yyyy')}
                              {assignment.residentDateRange.to && 
                                ` to ${format(new Date(assignment.residentDateRange.to), 'MMM d, yyyy')}`
                              }
                            </span>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50">Non-Resident</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {assignment.taxCredits !== undefined && assignment.taxCredits !== null
                        ? `€${assignment.taxCredits.toLocaleString()}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setIsActionClick(true);
                        }}
                      >
                        <ActionButtons
                          onEdit={() => handleEdit(assignment)}
                          onDelete={() => {
                            setSelectedAssignment(assignment);
                            setDeleteDialogOpen(true);
                          }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {selectedAssignment && (
        <DetailsPopover
          trigger={<div />}
          open={detailsOpen}
          onOpenChange={(open) => {
            // Only update state if we're closing it or opening it properly
            if (!open || selectedAssignment) {
              setDetailsOpen(open);
            }
          }}
        >
          <AssignmentDetails 
            assignment={selectedAssignment} 
            owner={getOwnerById(selectedAssignment.ownerId)} 
            property={getPropertyById(selectedAssignment.propertyId)} 
          />
        </DetailsPopover>
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the owner-property assignment.
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
      
      <AssignmentDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        assignment={isCreating ? undefined : selectedAssignment || undefined}
        properties={properties}
        owners={owners}
        onSuccess={handleAssignmentSaved}
      />
    </>
  );
};
