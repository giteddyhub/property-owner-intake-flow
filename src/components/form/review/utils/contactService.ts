
import { supabase } from '@/integrations/supabase/client';
import { ContactInfo } from './types';

export const saveContactInfo = async (contactInfo: ContactInfo, userId: string | null = null): Promise<string> => {
  console.log("Saving contact information:", contactInfo, "User ID:", userId);
  
  // Create a form submission entry instead of contact
  const submissionData = {
    user_id: userId,
    submitted_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('form_submissions')
    .insert(submissionData)
    .select();
    
  if (error) {
    console.error("Error saving form submission:", error);
    throw new Error(`Error saving form submission: ${error.message}`);
  }
  
  const submissionId = data?.[0]?.id;
  if (!submissionId) {
    console.error("Form submission was saved but no ID was returned");
    throw new Error("Failed to get database ID for submission");
  }
  
  // Store submission ID in session storage for the success page
  sessionStorage.setItem('submissionId', submissionId);
  
  return submissionId;
};
