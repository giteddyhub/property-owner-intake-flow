
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
  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log(`Confirming admin status change for ${accountName}. Current status: ${isAdmin ? 'admin' : 'user'}`);
    onConfirm();
  };

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
            onClick={handleConfirm}
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
  onClick: (e: React.MouseEvent) => void;
}> = ({ isAdmin, onClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Admin action button clicked. Current status: ${isAdmin ? 'admin' : 'user'}`);
    onClick(e);
  };

  return (
    <Button 
      variant={isAdmin ? "outline" : "default"}
      size="sm"
      onClick={handleClick}
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
