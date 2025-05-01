
import { supabase } from '@/integrations/supabase/client';
import { ContactInfo } from './types';

export const saveContactInfo = async (contactInfo: ContactInfo, userId: string | null = null): Promise<string> => {
  console.log("Saving contact information:", contactInfo, "User ID:", userId);
  
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
