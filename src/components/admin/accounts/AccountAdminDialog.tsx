
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Shield, ShieldCheck } from 'lucide-react';

interface AccountAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  accountName: string;
  isAdmin: boolean;
}

export const AccountAdminDialog: React.FC<AccountAdminDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  accountName,
  isAdmin
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isAdmin 
              ? "Remove Admin Privileges" 
              : "Grant Admin Privileges"}
          </DialogTitle>
          <DialogDescription>
            {isAdmin 
              ? `Are you sure you want to remove admin privileges from ${accountName}?` 
              : `Are you sure you want to grant admin privileges to ${accountName}?`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            variant={isAdmin ? "destructive" : "default"}
            onClick={onConfirm}
          >
            {isAdmin ? "Remove Admin" : "Grant Admin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const AdminActionButton: React.FC<{
  isAdmin: boolean;
  onClick: (e: React.MouseEvent) => void;  // Updated to accept a mouse event parameter
}> = ({ isAdmin, onClick }) => {
  return (
    <Button 
      variant={isAdmin ? "outline" : "default"}
      size="sm"
      onClick={onClick}
    >
      {isAdmin ? (
        <>
          <Shield className="h-4 w-4 mr-2" />
          Remove Admin Status
        </>
      ) : (
        <>
          <ShieldCheck className="h-4 w-4 mr-2" />
          Make Admin
        </>
      )}
    </Button>
  );
};
