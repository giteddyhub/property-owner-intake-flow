
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
import { PropertyData } from '@/types/admin';

interface AccountPropertiesTabProps {
  properties: PropertyData[];
}

export const AccountPropertiesTab: React.FC<AccountPropertiesTabProps> = ({ properties }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Properties</CardTitle>
        <CardDescription>
          {properties.length === 0 
            ? 'This user has no properties.' 
            : `${properties.length} properties found for this user.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {properties.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No properties found for this user.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map(property => (
                <TableRow key={property.id}>
                  <TableCell className="font-medium">{property.label}</TableCell>
                  <TableCell>{property.property_type}</TableCell>
                  <TableCell>{property.address_comune}, {property.address_zip}</TableCell>
                  <TableCell>{format(new Date(property.created_at), 'MMM dd, yyyy')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
