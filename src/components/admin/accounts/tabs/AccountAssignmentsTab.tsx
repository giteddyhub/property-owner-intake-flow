
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Users } from 'lucide-react';
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
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null);

  const toggleAssignmentExpansion = (assignmentId: string) => {
    setExpandedAssignment(expandedAssignment === assignmentId ? null : assignmentId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Property-Owner Assignments
        </CardTitle>
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
                <TableHead className="w-8"></TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Ownership %</TableHead>
                <TableHead>Resident</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map(assignment => (
                <React.Fragment key={assignment.id}>
                  <TableRow 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleAssignmentExpansion(assignment.id)}
                  >
                    <TableCell>
                      {expandedAssignment === assignment.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{assignment.property_label}</TableCell>
                    <TableCell>{assignment.owner_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{assignment.ownership_percentage}%</Badge>
                    </TableCell>
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
                  {expandedAssignment === assignment.id && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-muted/20">
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-muted-foreground">Property:</span>
                              <p className="font-medium">{assignment.property_label}</p>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Owner:</span>
                              <p className="font-medium">{assignment.owner_name}</p>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Ownership Percentage:</span>
                              <p>{assignment.ownership_percentage}%</p>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Resident at Property:</span>
                              <p>{assignment.resident_at_property ? 'Yes' : 'No'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Property ID:</span>
                              <p className="font-mono text-xs">{assignment.property_id}</p>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Owner ID:</span>
                              <p className="font-mono text-xs">{assignment.owner_id}</p>
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
