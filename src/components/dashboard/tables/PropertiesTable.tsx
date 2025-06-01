
import React, { useState } from 'react';
import { Property } from '@/components/dashboard/types';
import { PropertiesTableContent } from './property/PropertiesTableContent';
import PropertyDrawer from '@/components/dashboard/drawers/PropertyDrawer';
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
  const { deleteProperty } = useDashboardData();
  const [selectedProperty, setSelectedProperty] = useState<Property | undefined>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

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
    setPropertyToDelete(property);
  };

  const confirmDelete = async () => {
    if (propertyToDelete) {
      const success = await deleteProperty(propertyToDelete.id);
      if (success) {
        onRefresh();
      }
      setPropertyToDelete(null);
    }
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

      <AlertDialog open={!!propertyToDelete} onOpenChange={() => setPropertyToDelete(null)}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Property
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the property "{propertyToDelete?.label}" and all associated data.
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
    </>
  );
};
