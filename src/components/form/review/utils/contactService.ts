
import { supabase } from '@/integrations/supabase/client';
import { ContactInfo } from './types';

export const saveContactInfo = async (contactInfo: ContactInfo): Promise<string> => {
  console.log("Saving contact information:", contactInfo);
  
  const { data: contactData, error: contactError } = await supabase
    .from('contacts')
    .insert({
      full_name: contactInfo.fullName,
      email: contactInfo.email,
      submitted_at: new Date().toISOString()
    })
    .select();
    
  if (contactError) {
    console.error("Error saving contact:", contactError);
    throw new Error(`Error saving contact: ${contactError.message}`);
  }
  
  const contactId = contactData?.[0]?.id;
  if (!contactId) {
    console.error("Contact was saved but no ID was returned");
    throw new Error("Failed to get database ID for contact");
  }
  
  // Store contact ID in session storage for the success page
  sessionStorage.setItem('contactId', contactId);
  
  return contactId;
};
