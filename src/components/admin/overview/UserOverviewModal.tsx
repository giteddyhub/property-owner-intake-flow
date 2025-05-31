
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { User, Home, Users, FileText, ExternalLink } from 'lucide-react';
import { AccountData, OwnerData, PropertyData, AssignmentData } from '@/types/admin';

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

  const getContextualInfo = () => {
    if (!triggerContext) return null;

    switch (triggerContext.type) {
      case 'property':
        const property = properties.find(p => p.id === triggerContext.id);
        return property ? (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Home className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Clicked Property</span>
            </div>
            <p className="text-sm text-blue-700">{property.label}</p>
            <p className="text-xs text-blue-600">{property.address_comune}, {property.address_province}</p>
          </div>
        ) : null;

      case 'owner':
        const owner = owners.find(o => o.id === triggerContext.id);
        return owner ? (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-900">Clicked Owner</span>
            </div>
            <p className="text-sm text-green-700">{owner.first_name} {owner.last_name}</p>
            <p className="text-xs text-green-600">{owner.italian_tax_code}</p>
          </div>
        ) : null;

      case 'assignment':
        const assignment = assignments.find(a => a.id === triggerContext.id);
        return assignment ? (
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-purple-900">Clicked Assignment</span>
            </div>
            <p className="text-sm text-purple-700">{assignment.property_label}</p>
            <p className="text-xs text-purple-600">{assignment.owner_name} - {assignment.ownership_percentage}%</p>
          </div>
        ) : null;

      default:
        return null;
    }
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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
          {getContextualInfo()}

          {/* Account Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Account Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Name:</span>
                <p>{account.full_name || 'No Name'}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Email:</span>
                <p>{account.email}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Created:</span>
                <p>{format(new Date(account.created_at), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Status:</span>
                <Badge variant={account.is_admin ? "default" : "secondary"}>
                  {account.is_admin ? 'Admin' : 'User'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Activity Summary */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Activity Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <FileText className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                <div className="text-2xl font-bold">{account.submissions_count}</div>
                <div className="text-xs text-muted-foreground">Submissions</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Home className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                <div className="text-2xl font-bold">{account.properties_count}</div>
                <div className="text-xs text-muted-foreground">Properties</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                <div className="text-2xl font-bold">{account.owners_count}</div>
                <div className="text-xs text-muted-foreground">Owners</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Properties Overview */}
          {properties.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Properties ({properties.length})</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {properties.map((property) => (
                  <div key={property.id} className="p-2 border rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{property.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {property.address_comune}, {property.address_province}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {property.property_type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Owners Overview */}
          {owners.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Owners ({owners.length})</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {owners.map((owner) => (
                  <div key={owner.id} className="p-2 border rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{owner.first_name} {owner.last_name}</p>
                        <p className="text-xs text-muted-foreground">{owner.italian_tax_code}</p>
                      </div>
                      <Badge variant={owner.is_resident_in_italy ? "default" : "secondary"} className="text-xs">
                        {owner.is_resident_in_italy ? 'IT Resident' : 'Non-Resident'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assignments Overview */}
          {assignments.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Property-Owner Assignments ({assignments.length})</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="p-2 border rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{assignment.property_label}</p>
                        <p className="text-xs text-muted-foreground">{assignment.owner_name}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs mb-1">
                          {assignment.ownership_percentage}%
                        </Badge>
                        {assignment.resident_at_property && (
                          <Badge variant="secondary" className="text-xs block">
                            Resident
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
