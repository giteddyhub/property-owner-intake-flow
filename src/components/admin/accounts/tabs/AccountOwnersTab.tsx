
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Owners</CardTitle>
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
                <TableHead>Name</TableHead>
                <TableHead>Tax Code</TableHead>
                <TableHead>Resident in Italy</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {owners.map(owner => (
                <TableRow key={owner.id}>
                  <TableCell className="font-medium">
                    {owner.first_name} {owner.last_name}
                  </TableCell>
                  <TableCell>{owner.italian_tax_code}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
