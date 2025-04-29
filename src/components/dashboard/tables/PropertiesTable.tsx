import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Property } from '@/components/dashboard/types';
import { formatOccupancyStatuses } from '@/components/form/property/utils/occupancyUtils';
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
import PropertyDrawer from '@/components/dashboard/drawers/PropertyDrawer';
import { DetailsPopover } from '@/components/dashboard/details/DetailsPopover';
import { PropertyDetails } from '@/components/dashboard/details/PropertyDetails';

interface PropertiesTableProps {
  properties: Property[];
  onRefresh?: () => void;
}

export const PropertiesTable: React.FC<PropertiesTableProps> = ({ properties, onRefresh }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const handleEdit = (e: React.MouseEvent, property: Property) => {
    // Stop event propagation to prevent the row click from firing
    e.stopPropagation();
    
    setSelectedProperty(property);
    setIsCreating(false);
    setDrawerOpen(true);
  };
  
  const handleDelete = async (e: React.MouseEvent, property: Property) => {
    // Stop event propagation to prevent the row click from firing
    e.stopPropagation();
    
    setSelectedProperty(property);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!selectedProperty) return;
    
    try {
      const { data: assignments } = await supabase
        .from('owner_property_assignments')
        .select('id')
        .eq('property_id', selectedProperty.id);
        
      if (assignments && assignments.length > 0) {
        toast.error('Cannot delete property with existing owner assignments. Remove assignments first.');
        setDeleteDialogOpen(false);
        return;
      }
      
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', selectedProperty.id);
      
      if (error) throw error;
      
      toast.success('Property deleted successfully');
      setDeleteDialogOpen(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    }
  };
  
  const handleAdd = () => {
    setSelectedProperty(null);
    setIsCreating(true);
    setDrawerOpen(true);
  };
  
  const handlePropertySaved = () => {
    if (onRefresh) onRefresh();
  };
  
  const handleRowClick = (property: Property) => {
    // Only set details if we're not already opening the drawer
    if (!drawerOpen) {
      setSelectedProperty(property);
      setDetailsOpen(true);
    }
  };

  return (
    <>
      <div className="flex justify-start mb-4">
        <AddButton onClick={handleAdd} label="Add Property" />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Occupancy</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No properties found.
                </TableCell>
              </TableRow>
            ) : (
              properties.map((property) => (
                <TableRow 
                  key={property.id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(property)}
                >
                  <TableCell className="font-medium">{property.label}</TableCell>
                  <TableCell>
                    {property.address.street}, {property.address.comune}, {property.address.province}
                  </TableCell>
                  <TableCell>
                    {property.propertyType.charAt(0) + property.propertyType.slice(1).toLowerCase()}
                  </TableCell>
                  <TableCell>
                    {formatOccupancyStatuses(property.occupancyStatuses)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="action-buttons">
                      <ActionButtons
                        onEdit={(e) => handleEdit(e, property)}
                        onDelete={(e) => handleDelete(e, property)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {selectedProperty && (
        <DetailsPopover
          trigger={<div />}
          {/* Only show details if drawer is not open */}
          open={detailsOpen && !drawerOpen}
          onOpenChange={setDetailsOpen}
        >
          <PropertyDetails property={selectedProperty} />
        </DetailsPopover>
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this property?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the property and all of its data.
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
      
      <PropertyDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        property={isCreating ? undefined : selectedProperty || undefined}
        onSuccess={handlePropertySaved}
      />
    </>
  );
};
