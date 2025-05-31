
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, ExternalLink } from 'lucide-react';
import { AccountData, OwnerData, PropertyData, AssignmentData } from '@/types/admin';
import { ContextualInfo } from './ContextualInfo';
import { AccountInfoSection } from './AccountInfoSection';
import { PropertiesSection } from './PropertiesSection';
import { OwnersSection } from './OwnersSection';
import { AssignmentsSection } from './AssignmentsSection';

interface UserOverviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userData: {
    account?: AccountData;
    owners?: OwnerData[];
    properties?: PropertyData[];
    assignments?: AssignmentData[];
  };
  triggerContext?: {
    type: 'property' | 'owner' | 'assignment';
    id: string;
  };
}

export const UserOverviewModal: React.FC<UserOverviewModalProps> = ({
  open,
  onOpenChange,
  userId,
  userData,
  triggerContext
}) => {
  const navigate = useNavigate();
  const { account, owners = [], properties = [], assignments = [] } = userData;

  const handleViewFullAccount = () => {
    onOpenChange(false);
    navigate(`/admin/accounts/${userId}`);
  };

  if (!account) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Information</DialogTitle>
            <DialogDescription>Loading user data...</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Overview
          </DialogTitle>
          <DialogDescription>
            Complete information for {account.full_name || account.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contextual Information */}
          <ContextualInfo
            triggerContext={triggerContext}
            owners={owners}
            properties={properties}
            assignments={assignments}
          />

          {/* Account Information */}
          <AccountInfoSection account={account} />

          <Separator />

          {/* Properties Overview */}
          <PropertiesSection properties={properties} />

          <Separator />

          {/* Owners Overview */}
          <OwnersSection owners={owners} />

          <Separator />

          {/* Assignments Overview */}
          <AssignmentsSection assignments={assignments} />

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleViewFullAccount} className="flex-1">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Full Account Details
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
