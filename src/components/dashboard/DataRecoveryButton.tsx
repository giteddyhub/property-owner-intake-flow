
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { associateOrphanedData } from '@/hooks/dashboard/mappers/assignmentMapper';
import { supabase } from '@/integrations/supabase/client';

interface DataRecoveryButtonProps {
  onDataRecovered: () => void;
  prominent?: boolean;
}

export const DataRecoveryButton: React.FC<DataRecoveryButtonProps> = ({ 
  onDataRecovered,
  prominent = false
}) => {
  const [isRecovering, setIsRecovering] = useState(false);
  const { user } = useAuth();
  
  const handleRecoveryAttempt = async () => {
    if (!user?.email) {
      // Try to find email in sessionStorage
      const storedEmail = sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail');
      
      if (!storedEmail) {
        toast.error("You must be logged in with a valid email to recover data");
        return;
      }
    }
    
    const userEmail = user?.email || sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail');
    const userId = user?.id || sessionStorage.getItem('pendingUserId') || localStorage.getItem('pendingUserId');
    
    if (!userId) {
      toast.error("Unable to determine your user ID. Please try logging out and back in.");
      return;
    }
    
    setIsRecovering(true);
    
    try {
      console.log(`Attempting to recover data for user ${userId} with email ${userEmail}`);
      
      // Try standard data recovery approach first
      const result = await associateOrphanedData(userId, userEmail);
      
      if (result.success) {
        toast.success(`Successfully recovered your data!`);
        onDataRecovered();
      } else {
        // Try a second approach - check against email only
        console.log("First recovery attempt failed, trying email-only approach");
        const emailOnlyResult = await associateOrphanedData(userId, userEmail, true);
        
        if (emailOnlyResult.success) {
          toast.success(`Successfully recovered your data through email matching!`);
          onDataRecovered();
        } else {
          // Try a third, more aggressive approach - look for any data with matching email
          console.log("Second recovery attempt failed, trying aggressive approach");
          
          // First check if there are any contacts with this email that don't have a user_id
          const { data: contactData, error: contactError } = await supabase
            .from('contacts')
            .select('id')
            .eq('email', userEmail)
            .is('user_id', null);
            
          if (!contactError && contactData && contactData.length > 0) {
            console.log(`Found ${contactData.length} contacts with matching email but no user ID`);
            
            // Update each contact with the user ID
            for (const contact of contactData) {
              await associateContactDataWithUser(contact.id, userId);
            }
            
            toast.success(`Successfully recovered your data! Found ${contactData.length} matching submissions.`);
            onDataRecovered();
          } else {
            // Try to find contact directly
            const contactInfo = await fetchContactByEmail(userEmail);
            
            if (contactInfo) {
              console.log("Found contact info via email:", contactInfo);
              await associateContactDataWithUser(contactInfo.id, userId);
              toast.success("Successfully recovered your data through contact lookup!");
              onDataRecovered();
            } else {
              toast.info("No orphaned data was found associated with your account. If you previously submitted data, please contact support.");
            }
          }
        }
      }
    } catch (error) {
      console.error("Error recovering data:", error);
      toast.error("Failed to recover data. Please try again later.");
    } finally {
      setIsRecovering(false);
    }
  };

  // Helper function to find contact by email
  const fetchContactByEmail = async (email: string) => {
    const { data, error } = await supabase
      .from('contacts')
      .select('id, full_name, email')
      .eq('email', email)
      .maybeSingle();
      
    if (error) {
      console.error("Error finding contact by email:", error);
      return null;
    }
    
    return data;
  };
  
  // Helper function to associate all data from a contact with a user
  const associateContactDataWithUser = async (contactId: string, userId: string): Promise<void> => {
    try {
      console.log(`Associating all data for contact ${contactId} with user ${userId}`);
      
      // Update the contact with user ID
      const { error: contactError } = await supabase
        .from('contacts')
        .update({ user_id: userId })
        .eq('id', contactId);
        
      if (contactError) {
        console.error("Error updating contact:", contactError);
      }
      
      // Update owners with this contact
      const { error: ownersError } = await supabase
        .from('owners')
        .update({ user_id: userId })
        .eq('contact_id', contactId);
        
      if (ownersError) {
        console.error("Error updating owners:", ownersError);
      }
      
      // Update properties with this contact
      const { error: propertiesError } = await supabase
        .from('properties')
        .update({ user_id: userId })
        .eq('contact_id', contactId);
        
      if (propertiesError) {
        console.error("Error updating properties:", propertiesError);
      }
      
      // Update assignments with this contact
      const { error: assignmentsError } = await supabase
        .from('owner_property_assignments')
        .update({ user_id: userId })
        .eq('contact_id', contactId);
        
      if (assignmentsError) {
        console.error("Error updating assignments:", assignmentsError);
      }
    } catch (error) {
      console.error("Error associating contact data with user:", error);
      throw error;
    }
  };

  return (
    <Button
      onClick={handleRecoveryAttempt}
      disabled={isRecovering || (!user?.email && !sessionStorage.getItem('userEmail'))}
      variant={prominent ? "default" : "outline"}
      size={prominent ? "lg" : "sm"}
      className={`flex items-center gap-2 ${prominent ? 'bg-form-400 hover:bg-form-500 text-white' : ''}`}
    >
      {isRecovering ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Recovering...
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4" />
          {prominent ? 'Recover Your Form Data' : 'Find Missing Data'}
        </>
      )}
    </Button>
  );
};

export default DataRecoveryButton;
