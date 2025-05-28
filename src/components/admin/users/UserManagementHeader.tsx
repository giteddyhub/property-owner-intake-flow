
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreateAdminUserForm } from '@/components/admin/users/CreateAdminUserForm';
import { ActionsToolbar } from '@/components/dashboard/ActionsToolbar';

interface UserManagementHeaderProps {
  pageTitle: string;
  onRefresh: () => void;
  formOpen: boolean;
  setFormOpen: (open: boolean) => void;
  onCreateAdminSuccess: (userData: any) => void;
}

export const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({
  pageTitle,
  onRefresh,
  formOpen,
  setFormOpen,
  onCreateAdminSuccess
}) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">{pageTitle}</h2>
      <div className="flex items-center gap-2">
        <ActionsToolbar onRefresh={onRefresh} />
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Create Admin User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Administrator Account</DialogTitle>
              <DialogDescription>
                Create a new user account with administrative privileges.
              </DialogDescription>
            </DialogHeader>
            
            <CreateAdminUserForm 
              onSuccess={onCreateAdminSuccess}
              onCancel={() => setFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
