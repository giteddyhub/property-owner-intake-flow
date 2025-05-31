
import React from 'react';
import { Home, User, Users } from 'lucide-react';
import { OwnerData, PropertyData, AssignmentData } from '@/types/admin';

interface ContextualInfoProps {
  triggerContext?: {
    type: 'property' | 'owner' | 'assignment';
    id: string;
  };
  owners: OwnerData[];
  properties: PropertyData[];
  assignments: AssignmentData[];
}

export const ContextualInfo: React.FC<ContextualInfoProps> = ({
  triggerContext,
  owners,
  properties,
  assignments
}) => {
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
