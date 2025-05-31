
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, User } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { OwnerData } from '@/types/admin';

interface AccountOwnersTabProps {
  owners: OwnerData[];
}

export const AccountOwnersTab: React.FC<AccountOwnersTabProps> = ({ owners }) => {
  const [expandedOwner, setExpandedOwner] = useState<string | null>(null);

  const toggleOwnerExpansion = (ownerId: string) => {
    setExpandedOwner(expandedOwner === ownerId ? null : ownerId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Owners
        </CardTitle>
        <CardDescription>
          {owners.length === 0 
            ? 'This user has no owners registered.' 
            : `${owners.length} owners found for this user.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {owners.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No owners found for this user.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Tax Code</TableHead>
                <TableHead>Citizenship</TableHead>
                <TableHead>IT Resident</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {owners.map(owner => (
                <React.Fragment key={owner.id}>
                  <TableRow 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleOwnerExpansion(owner.id)}
                  >
                    <TableCell>
                      {expandedOwner === owner.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {owner.first_name} {owner.last_name}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{owner.italian_tax_code}</TableCell>
                    <TableCell>{owner.citizenship}</TableCell>
                    <TableCell>
                      {owner.is_resident_in_italy ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          No
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{format(new Date(owner.created_at), 'MMM dd, yyyy')}</TableCell>
                  </TableRow>
                  {expandedOwner === owner.id && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-muted/20">
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-muted-foreground">Full Name:</span>
                              <p>{owner.first_name} {owner.last_name}</p>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Italian Tax Code:</span>
                              <p className="font-mono">{owner.italian_tax_code}</p>
                            </div>
                            {owner.date_of_birth && (
                              <div>
                                <span className="font-medium text-muted-foreground">Date of Birth:</span>
                                <p>{format(new Date(owner.date_of_birth), 'MMM dd, yyyy')}</p>
                              </div>
                            )}
                            <div>
                              <span className="font-medium text-muted-foreground">Country of Birth:</span>
                              <p>{owner.country_of_birth}</p>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Citizenship:</span>
                              <p>{owner.citizenship}</p>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Marital Status:</span>
                              <p>{owner.marital_status}</p>
                            </div>
                          </div>
                          
                          <div className="border-t pt-4">
                            <h4 className="font-medium text-sm mb-2">Address Information</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-muted-foreground">Address:</span>
                                <p>{owner.address_street}</p>
                                <p>{owner.address_city}, {owner.address_zip}</p>
                                <p>{owner.address_country}</p>
                              </div>
                              {owner.is_resident_in_italy && owner.italian_residence_street && (
                                <div>
                                  <span className="font-medium text-muted-foreground">Italian Residence:</span>
                                  <p>{owner.italian_residence_street}</p>
                                  <p>{owner.italian_residence_city}, {owner.italian_residence_zip}</p>
                                  <p>{owner.italian_residence_comune_name}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
