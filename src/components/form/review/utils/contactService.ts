
import { supabase } from '@/integrations/supabase/client';
import { ContactInfo } from './types';

export const saveContactInfo = async (contactInfo: ContactInfo, userId: string | null = null): Promise<string> => {
  console.log("Saving contact information:", contactInfo, "User ID:", userId);
  
  if (!userId) {
    console.warn("No user ID provided for contact. Attempting to find by email...");
    
    if (contactInfo.email) {
      // Try to find existing user with this email
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', contactInfo.email)
        .maybeSingle();
        
      if (!error && data?.id) {
        userId = data.id;
        console.log("Found user ID by email lookup:", userId);
      }
    }
  }
  
  // Double-check session storage as a last resort
  if (!userId) {
    userId = sessionStorage.getItem('pendingUserId') || localStorage.getItem('pendingUserId');
    if (userId) {
      console.log("Using user ID from storage:", userId);
    }
  }
  
  const contactData = {
    full_name: contactInfo.fullName,
    email: contactInfo.email,
    submitted_at: new Date().toISOString(),
    user_id: userId,
    terms_accepted: contactInfo.termsAccepted,
    privacy_accepted: contactInfo.privacyAccepted
  };
  
  const { data, error } = await supabase
    .from('contacts')
    .insert(contactData)
    .select();
    
  if (error) {
    console.error("Error saving contact:", error);
    throw new Error(`Error saving contact: ${error.message}`);
  }
  
  const contactId = data?.[0]?.id;
  if (!contactId) {
    console.error("Contact was saved but no ID was returned");
    throw new Error("Failed to get database ID for contact");
  }
  
  // Store contact ID in session storage for the success page
  sessionStorage.setItem('contactId', contactId);
  
  return contactId;
};
