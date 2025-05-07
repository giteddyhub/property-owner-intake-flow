
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
import { AssignmentData } from '@/types/admin';

interface AccountAssignmentsTabProps {
  assignments: AssignmentData[];
}

export const AccountAssignmentsTab: React.FC<AccountAssignmentsTabProps> = ({ assignments }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Property-Owner Assignments</CardTitle>
        <CardDescription>
          {assignments.length === 0 
            ? 'This user has no property-owner assignments.' 
            : `${assignments.length} assignments found for this user.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No property-owner assignments found for this user.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Ownership %</TableHead>
                <TableHead>Resident</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map(assignment => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.property_label}</TableCell>
                  <TableCell>{assignment.owner_name}</TableCell>
                  <TableCell>{assignment.ownership_percentage}%</TableCell>
                  <TableCell>
                    {assignment.resident_at_property ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        No
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{format(new Date(assignment.created_at), 'MMM dd, yyyy')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
