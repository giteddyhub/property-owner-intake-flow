
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { OwnerData } from '@/types/admin';

interface OwnersSectionProps {
  owners: OwnerData[];
}

export const OwnersSection: React.FC<OwnersSectionProps> = ({ owners }) => {
  return (
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
  );
};
