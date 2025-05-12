
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
import { AlertTriangle, Link as LinkIcon, RefreshCw, User, Home } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define the shape of an assignment record
interface Assignment {
  id: string;
  owner_id: string;
  property_id: string;
  ownership_percentage: number;
  resident_at_property: boolean;
  resident_from_date: string | null;
  resident_to_date: string | null;
  tax_credits: number | null;
  created_at: string;
  // Joined fields
  owner_first_name?: string;
  owner_last_name?: string;
  property_label?: string;
  property_address?: string;
}

interface AdminSubmissionAssignmentsProps {
  submissionId: string;
}

export const AdminSubmissionAssignments: React.FC<AdminSubmissionAssignmentsProps> = ({ submissionId }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const { adminSession } = useAdminAuth();

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo({});
    
    try {
      console.log('Fetching assignments for submission:', submissionId);
      console.log('Admin session token available:', !!adminSession?.token);
      
      // Set up headers with admin token if available
      let options: any = {};
      if (adminSession?.token) {
        options = {
          headers: {
            'x-admin-token': adminSession.token
          }
        };
        console.log('Using admin token in request headers');
      } else {
        console.warn('No admin token available for request');
      }

      // Use the admin-tools edge function to fetch data
      const { data: response, error: fnError } = await supabase.functions.invoke('admin-tools', {
        body: {
          action: 'direct_fetch',
          params: {
            table: 'owner_property_assignments',
            id_column: 'form_submission_id',
            id_value: submissionId,
            orderBy: { column: 'created_at', ascending: false }
          }
        }
      });
      
      console.log('Edge function response:', response);
      
      if (fnError) {
        console.error('Edge function error:', fnError);
        throw new Error(`Edge function error: ${fnError.message}`);
      }
      
      if (!response || !response.data) {
        throw new Error('No data returned from edge function');
      }
      
      setDebugInfo(prev => ({
        ...prev,
        edgeFunctionResponse: response,
        dataCount: response.data ? response.data.length : 0,
        submissionId
      }));
      
      // Transform the data to include the joined fields
      const rawAssignments = response.data || [];
      
      // Fetch additional data for owners and properties
      const ownerIds = [...new Set(rawAssignments.map((a: Assignment) => a.owner_id))];
      const propertyIds = [...new Set(rawAssignments.map((a: Assignment) => a.property_id))];
      
      // Get owner details
      const { data: ownersData } = await supabase
        .from('owners')
        .select('id, first_name, last_name')
        .in('id', ownerIds as string[]);
      
      // Get property details
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('id, label, address_street, address_comune')
        .in('id', propertyIds as string[]);
      
      // Create lookup maps
      const ownerMap = (ownersData || []).reduce((acc, owner) => {
        acc[owner.id] = owner;
        return acc;
      }, {} as Record<string, any>);
      
      const propertyMap = (propertiesData || []).reduce((acc, property) => {
        acc[property.id] = property;
        return acc;
      }, {} as Record<string, any>);
      
      // Transform the data
      const transformedData = rawAssignments.map((item: Assignment) => {
        const owner = ownerMap[item.owner_id] || {};
        const property = propertyMap[item.property_id] || {};
        
        return {
          ...item,
          owner_first_name: owner.first_name || 'Unknown',
          owner_last_name: owner.last_name || 'Owner',
          property_label: property.label || 'Unknown Property',
          property_address: property.address_street && property.address_comune ? 
            `${property.address_street}, ${property.address_comune}` : 
            'No address'
        };
      });
      
      setAssignments(transformedData);
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      setError(`Failed to fetch assignments: ${error.message || 'Unknown error'}`);
      
      // Add to debug info
      setDebugInfo(prev => ({ 
        ...prev, 
        errorType: error.name,
        errorStack: error.stack
      }));
      
      toast.error('Failed to fetch assignments', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [submissionId, adminSession]);
  
  // Add manual retry without the admin token (emergency access)
  const fetchWithoutToken = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('EMERGENCY: Trying to fetch assignment data using admin-tools edge function');
      
      const { data: response, error: fnError } = await supabase.functions.invoke('admin-tools', {
        body: {
          action: 'direct_fetch',
          params: {
            table: 'owner_property_assignments',
            id_column: 'form_submission_id',
            id_value: submissionId
          }
        }
      });
      
      if (fnError) throw fnError;
      
      if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Process and transform data as needed
        setAssignments(response.data);
        toast.success('Successfully retrieved assignment data using emergency method');
      } else {
        setError('No assignment data returned from emergency method');
      }
    } catch (error: any) {
      console.error('Error in emergency fetch:', error);
      setError(`Emergency fetch failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full max-w-md" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error fetching assignment data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        <div className="p-4 bg-muted rounded-md">
          <h4 className="text-sm font-semibold mb-2">Debug Information</h4>
          <pre className="text-xs overflow-auto p-2 bg-muted/50 rounded border max-h-48">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
          
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchAssignments}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Normal Fetch
            </Button>
            <Button variant="destructive" size="sm" onClick={fetchWithoutToken}>
              Emergency Access (Bypass RLS)
            </Button>
          </div>
        </div>
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
        <CardContent>
          <div className="p-4 bg-muted rounded-md">
            <h4 className="text-sm font-semibold mb-2">Debug Information</h4>
            <pre className="text-xs overflow-auto p-2 bg-muted/50 rounded border max-h-48">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
            
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={fetchAssignments}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Fetch
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Assignments ({assignments.length})</h3>
        <Button variant="outline" size="sm" onClick={fetchAssignments}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Owner</TableHead>
            <TableHead>Property</TableHead>
            <TableHead className="hidden lg:table-cell">Ownership</TableHead>
            <TableHead className="hidden md:table-cell">Residency</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((assignment) => (
            <TableRow key={assignment.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {assignment.owner_first_name} {assignment.owner_last_name}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {assignment.owner_id.substring(0, 8)}...
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{assignment.property_label}</div>
                    <div className="text-xs text-muted-foreground">
                      {assignment.property_address}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <Badge variant="outline">{assignment.ownership_percentage}%</Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {assignment.resident_at_property ? (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    Resident
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                    Non-Resident
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
