
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DbOwner, DbProperty, DbAssignment } from '../types';

interface FetchUserDataParams {
  userId: string | undefined;
}

interface FetchUserDataResult {
  ownersData: DbOwner[];
  propertiesData: DbProperty[];
  assignmentsData: DbAssignment[];
  error: Error | null;
}

export const fetchUserData = async ({ userId }: FetchUserDataParams): Promise<FetchUserDataResult> => {
  if (!userId) {
    console.log("No userId provided to fetchUserData, skipping data fetch");
    return {
      ownersData: [],
      propertiesData: [],
      assignmentsData: [],
      error: null
    };
  }

  try {
    console.log("Fetching user data for userId:", userId);
    
    // First, check if the user exists in the auth.users table
    const { data: authUserData, error: authUserError } = await supabase.auth.getUser();
    
    if (authUserError) {
      console.error("Error fetching auth user:", authUserError);
      // Continue anyway as we might be using a pendingUserId
    } else {
      console.log("Auth user data:", authUserData?.user?.id);
    }
    
    // Fetch owners data - use user_id directly
    const ownersResult = await supabase
      .from('owners')
      .select('*')
      .eq('user_id', userId);

    if (ownersResult.error) {
      console.error("Error fetching owners:", ownersResult.error);
      throw ownersResult.error;
    }
    
    // Use simple casting to avoid deep type instantiation
    const ownersData = (ownersResult.data || []) as DbOwner[];
    console.log("Owners data fetched:", ownersData.length);
    
    // Fetch properties data
    const propertiesResult = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', userId);

    if (propertiesResult.error) {
      console.error("Error fetching properties:", propertiesResult.error);
      throw propertiesResult.error;
    }
    
    // Use simple casting to avoid deep type instantiation
    const propertiesData = (propertiesResult.data || []) as DbProperty[];
    console.log("Properties data fetched:", propertiesData.length);
    
    // Fetch assignments using direct user_id approach first
    let assignmentsData: DbAssignment[] = [];
    
    try {
      const { data: directAssignments, error: directError } = await supabase
        .from('owner_property_assignments')
        .select('*')
        .eq('user_id', userId);
        
      if (directError) {
        console.error("Error fetching assignments by user_id:", directError);
      } else {
        assignmentsData = (directAssignments || []) as DbAssignment[];
        console.log("Direct assignments fetched by user_id:", assignmentsData.length);
      }
    } catch (error) {
      console.error("Error processing direct assignments:", error);
    }
    
    // If no direct assignments found and we have owners, 
    // try fetching assignments related to those owners as a fallback
    if (assignmentsData.length === 0 && ownersData.length > 0) {
      const ownerIds = ownersData.map(o => o.id);
      
      try {
        const { data, error } = await supabase
          .from('owner_property_assignments')
          .select('*')
          .in('owner_id', ownerIds);
        
        if (error) {
          console.error("Error fetching assignments by owner_id:", error);
        } else {
          // Create plain objects manually to avoid TypeScript's deep instantiation issues
          const ownerAssignments = (data || []).map(item => ({
            id: item.id,
            property_id: item.property_id,
            owner_id: item.owner_id,
            ownership_percentage: item.ownership_percentage,
            resident_at_property: item.resident_at_property,
            resident_from_date: item.resident_from_date,
            resident_to_date: item.resident_to_date,
            tax_credits: item.tax_credits,
            user_id: item.user_id
          })) as DbAssignment[];
          
          // Only add assignments that weren't already added by direct query
          const existingIds = new Set(assignmentsData.map(a => a.id));
          const newAssignments = ownerAssignments.filter(a => !existingIds.has(a.id));
          
          assignmentsData = [...assignmentsData, ...newAssignments];
          console.log("Assignments data fetched via owners:", newAssignments.length);
        }
      } catch (error) {
        console.error("Error processing assignments via owners:", error);
      }
    }
    
    // If we still have no assignments, check for contact_id as last resort
    if (assignmentsData.length === 0) {
      console.log("No assignments found through user_id or owners, checking for contact_id associations");
      
      try {
        // Get contacts associated with this user
        const { data: contactsData, error: contactsError } = await supabase
          .from('contacts')
          .select('id')
          .eq('user_id', userId);
          
        if (contactsError) {
          console.error("Error fetching contacts:", contactsError);
        } else if (contactsData && contactsData.length > 0) {
          const contactIds = contactsData.map(c => c.id);
          
          // Get assignments by contact_id
          const { data: contactAssignments, error: contactAssignError } = await supabase
            .from('owner_property_assignments')
            .select('*')
            .in('contact_id', contactIds);
            
          if (contactAssignError) {
            console.error("Error fetching assignments by contact_id:", contactAssignError);
          } else {
            // Add any assignments not already in the list
            const existingIds = new Set(assignmentsData.map(a => a.id));
            const contactAssignmentsTyped = (contactAssignments || []) as DbAssignment[];
            const newAssignments = contactAssignmentsTyped.filter(a => !existingIds.has(a.id));
            
            assignmentsData = [...assignmentsData, ...newAssignments];
            console.log("Assignments data fetched via contacts:", newAssignments.length);
            
            // Update these assignments with the user_id for future queries
            if (newAssignments.length > 0) {
              const assignmentIds = newAssignments.map(a => a.id);
              const { error: updateError } = await supabase
                .from('owner_property_assignments')
                .update({ user_id: userId })
                .in('id', assignmentIds);
                
              if (updateError) {
                console.error("Error updating assignments with user_id:", updateError);
              } else {
                console.log(`Updated ${newAssignments.length} assignments with user_id`);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error with contact-based assignment lookup:", error);
      }
    }

    // Return the final result
    return {
      ownersData,
      propertiesData,
      assignmentsData,
      error: null
    };

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    toast.error('Failed to load your data. Please try again later.');
    return {
      ownersData: [],
      propertiesData: [],
      assignmentsData: [],
      error: error as Error
    };
  }
};
