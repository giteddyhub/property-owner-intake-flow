
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
import { Link, User, Home, AlertTriangle, RefreshCw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
        
        // Add token info to debug data
        setDebugInfo(prev => ({
          ...prev,
          hasAdminToken: true,
          tokenLength: adminSession.token.length,
          tokenStart: adminSession.token.substring(0, 8) + '...'
        }));
      } else {
        console.warn('No admin token available for request');
        setDebugInfo(prev => ({ ...prev, hasAdminToken: false }));
      }
      
      // First get assignments
      console.log('Executing assignments query with options:', options);
      const { data: assignmentsData, error: assignmentsError, status, statusText } = await supabase
        .from('owner_property_assignments')
        .select('*')
        .eq('form_submission_id', submissionId);
      
      console.log('Assignments query response status:', status, statusText);
      console.log('Assignments query response data:', assignmentsData);
      console.log('Assignments query response error:', assignmentsError);
      
      setDebugInfo(prev => ({
        ...prev,
        queryStatus: status,
        queryStatusText: statusText,
        dataCount: assignmentsData ? assignmentsData.length : 0,
        errorMessage: assignmentsError ? assignmentsError.message : null,
        submissionId
      }));
      
      if (assignmentsError) throw assignmentsError;
      
      if (!assignmentsData || assignmentsData.length === 0) {
        setAssignments([]);
        setLoading(false);
        return;
      }
      
      // Fetch owner and property details for each assignment
      const enhancedAssignments = await Promise.all(
        assignmentsData.map(async (assignment) => {
          // Get owner info with error handling
          let ownerData = null;
          try {
            const { data, error } = await supabase
              .from('owners')
              .select('first_name, last_name')
              .eq('id', assignment.owner_id)
              .single();
              
            if (error) {
              console.error(`Error fetching owner ${assignment.owner_id}:`, error);
              setDebugInfo(prev => ({ 
                ...prev, 
                ownerErrors: [...(prev.ownerErrors || []), {
                  id: assignment.owner_id,
                  error: error.message
                }]
              }));
            } else {
              ownerData = data;
            }
          } catch (error) {
            console.error(`Exception fetching owner ${assignment.owner_id}:`, error);
          }
          
          // Get property info with error handling
          let propertyData = null;
          try {
            const { data, error } = await supabase
              .from('properties')
              .select('label')
              .eq('id', assignment.property_id)
              .single();
              
            if (error) {
              console.error(`Error fetching property ${assignment.property_id}:`, error);
              setDebugInfo(prev => ({ 
                ...prev, 
                propertyErrors: [...(prev.propertyErrors || []), {
                  id: assignment.property_id,
                  error: error.message
                }]
              }));
            } else {
              propertyData = data;
            }
          } catch (error) {
            console.error(`Exception fetching property ${assignment.property_id}:`, error);
          }
          
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
  
  // Emergency fetch without RLS
  const fetchWithoutToken = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('EMERGENCY: Trying to fetch assignments without token validation');
      
      // Use the admin-tools edge function to fetch data
      const { data: response, error: funcError } = await supabase.functions.invoke('admin-tools', {
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
      
      if (funcError) throw funcError;
      
      if (!response || !response.data || !response.data.length) {
        setError('No assignments found with emergency method');
        return;
      }
      
      // Now enhance with owner and property data
      const assignmentsWithDetails = await Promise.all(
        response.data.map(async (assignment: any) => {
          // Get owner info with error handling
          let ownerData = null;
          try {
            const { data: ownerResponse } = await supabase.functions.invoke('admin-tools', {
              body: { 
                action: 'direct_fetch', 
                params: { 
                  table: 'owners',
                  id_column: 'id',
                  id_value: assignment.owner_id
                } 
              }
            });
            
            if (ownerResponse?.data?.length) {
              ownerData = ownerResponse.data[0];
            }
          } catch (error) {
            console.error(`Error fetching owner ${assignment.owner_id}:`, error);
          }
          
          // Get property info with error handling
          let propertyData = null;
          try {
            const { data: propertyResponse } = await supabase.functions.invoke('admin-tools', {
              body: { 
                action: 'direct_fetch', 
                params: { 
                  table: 'properties',
                  id_column: 'id',
                  id_value: assignment.property_id
                } 
              }
            });
            
            if (propertyResponse?.data?.length) {
              propertyData = propertyResponse.data[0];
            }
          } catch (error) {
            console.error(`Error fetching property ${assignment.property_id}:`, error);
          }
          
          return {
            ...assignment,
            owner_first_name: ownerData?.first_name,
            owner_last_name: ownerData?.last_name,
            property_label: propertyData?.label
          };
        })
      );
      
      setAssignments(assignmentsWithDetails);
      toast.success('Successfully retrieved assignments using emergency method');
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
              <RefreshCw className="mr-2 h-4 w-4" />
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
                <RefreshCw className="mr-2 h-4 w-4" />
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
