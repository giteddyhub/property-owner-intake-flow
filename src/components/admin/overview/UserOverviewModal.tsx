
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
import { User, Home, Users, FileText, ExternalLink, Download } from 'lucide-react';
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

  const handleDownloadDocument = (documentUrl: string, documentName: string) => {
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = documentName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

          {/* Properties Overview */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Properties ({properties.length})</h3>
            {properties.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {properties.map((property) => (
                  <div key={property.id} className="p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
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
                    
                    {/* Property Documents */}
                    {property.documents && property.documents.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Documents:</p>
                        <div className="flex flex-wrap gap-1">
                          {property.documents.map((doc, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => handleDownloadDocument(doc, `${property.label}_doc_${index + 1}`)}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Doc {index + 1}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {property.use_document_retrieval_service && (
                      <div className="mt-2 pt-2 border-t">
                        <Badge variant="secondary" className="text-xs">
                          Document Retrieval Service
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No properties found.</p>
            )}
          </div>

          <Separator />

          {/* Owners Overview */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Owners ({owners.length})</h3>
            {owners.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {owners.map((owner) => (
                  <div key={owner.id} className="p-2 border rounded-md hover:bg-muted/50 cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{owner.first_name} {owner.last_name}</p>
                        <p className="text-xs text-muted-foreground">{owner.italian_tax_code}</p>
                        <p className="text-xs text-muted-foreground">{owner.citizenship}</p>
                      </div>
                      <Badge variant={owner.is_resident_in_italy ? "default" : "secondary"} className="text-xs">
                        {owner.is_resident_in_italy ? 'IT Resident' : 'Non-Resident'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No owners found.</p>
            )}
          </div>

          <Separator />

          {/* Assignments Overview */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Property-Owner Assignments ({assignments.length})</h3>
            {assignments.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="p-2 border rounded-md hover:bg-muted/50 cursor-pointer">
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
            ) : (
              <p className="text-sm text-muted-foreground">No assignments found.</p>
            )}
          </div>

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
