
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Link, User, Home } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Assignment {
  id: string;
  property_id: string;
  owner_id: string;
  ownership_percentage: number;
  resident_at_property: boolean;
  resident_from_date: string | null;
  resident_to_date: string | null;
  tax_credits: number | null;
  owner_first_name?: string;
  owner_last_name?: string;
  property_label?: string;
}

interface AdminSubmissionAssignmentsProps {
  submissionId: string;
}

export const AdminSubmissionAssignments: React.FC<AdminSubmissionAssignmentsProps> = ({ submissionId }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      // First get assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('owner_property_assignments')
        .select('*')
        .eq('form_submission_id', submissionId);
      
      if (assignmentsError) throw assignmentsError;
      
      if (!assignmentsData || assignmentsData.length === 0) {
        setAssignments([]);
        setLoading(false);
        return;
      }
      
      // Fetch owner and property details for each assignment
      const enhancedAssignments = await Promise.all(
        assignmentsData.map(async (assignment) => {
          // Get owner info
          const { data: ownerData } = await supabase
            .from('owners')
            .select('first_name, last_name')
            .eq('id', assignment.owner_id)
            .single();
          
          // Get property info
          const { data: propertyData } = await supabase
            .from('properties')
            .select('label')
            .eq('id', assignment.property_id)
            .single();
          
          return {
            ...assignment,
            owner_first_name: ownerData?.first_name,
            owner_last_name: ownerData?.last_name,
            property_label: propertyData?.label
          };
        })
      );
      
      setAssignments(enhancedAssignments);
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to fetch assignments', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [submissionId]);

  // Format the date range for residency
  const formatResidencyPeriod = (assignment: Assignment) => {
    if (!assignment.resident_at_property) return 'Not Resident';
    
    if (assignment.resident_from_date && assignment.resident_to_date) {
      return `${format(new Date(assignment.resident_from_date), 'MMM dd, yyyy')} - ${format(new Date(assignment.resident_to_date), 'MMM dd, yyyy')}`;
    }
    
    if (assignment.resident_from_date) {
      return `From ${format(new Date(assignment.resident_from_date), 'MMM dd, yyyy')}`;
    }
    
    if (assignment.resident_to_date) {
      return `Until ${format(new Date(assignment.resident_to_date), 'MMM dd, yyyy')}`;
    }
    
    return 'Full Year';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full max-w-md" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Assignments Found</CardTitle>
          <CardDescription>
            This submission doesn't contain any owner-property assignments.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Assignments ({assignments.length})</h3>
        <Button variant="outline" size="sm" onClick={fetchAssignments}>
          Refresh
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Owner</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Ownership</TableHead>
            <TableHead className="hidden md:table-cell">Residency</TableHead>
            <TableHead className="hidden lg:table-cell">Tax Credits</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((assignment) => (
            <TableRow key={assignment.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {assignment.owner_first_name} {assignment.owner_last_name || '(Unknown)'}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span>{assignment.property_label || '(Unknown Property)'}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                  {assignment.ownership_percentage}%
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {assignment.resident_at_property ? (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    Resident
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                    Not Resident
                  </Badge>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  {formatResidencyPeriod(assignment)}
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {assignment.tax_credits ? (
                  <div className="font-medium">€{assignment.tax_credits.toLocaleString()}</div>
                ) : (
                  <span className="text-muted-foreground text-sm">None</span>
                )}
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
