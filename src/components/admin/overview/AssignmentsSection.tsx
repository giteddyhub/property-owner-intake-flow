
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AssignmentData } from '@/types/admin';

interface AssignmentsSectionProps {
  assignments: AssignmentData[];
}

export const AssignmentsSection: React.FC<AssignmentsSectionProps> = ({ assignments }) => {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-3">Ownership Links ({assignments.length})</h3>
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
        <p className="text-sm text-muted-foreground">No ownership links found.</p>
      )}
    </div>
  );
};
