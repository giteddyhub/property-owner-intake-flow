
import { supabase } from '@/integrations/supabase/client';
import { ContactInfo } from './types';

export const saveContactInfo = async (contactInfo: ContactInfo, userId: string | null = null): Promise<string> => {
  console.log("Saving contact information:", contactInfo, "User ID:", userId);
  
  let effectiveUserId = userId;
  
  if (!effectiveUserId) {
    console.warn("No user ID provided for contact. Attempting to find by email...");
    
    if (contactInfo.email) {
      // Try to find existing user with this email
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', contactInfo.email)
        .maybeSingle();
        
      if (!profileError && profileData?.id) {
        effectiveUserId = profileData.id;
        console.log("Found user ID by profile email lookup:", effectiveUserId);
      } else {
        // If profile lookup fails, try auth.users directly (requires service role which we don't have)
        // Instead, use any stored user ID
        effectiveUserId = sessionStorage.getItem('pendingUserId') || localStorage.getItem('pendingUserId');
        if (effectiveUserId) {
          console.log("Using user ID from storage:", effectiveUserId);
        }
      }
    }
  }
  
  // Store the pending user ID and email in both session and local storage for redundancy
  if (effectiveUserId) {
    console.log("Storing effective user ID in session/local storage:", effectiveUserId);
    sessionStorage.setItem('pendingUserId', effectiveUserId);
    localStorage.setItem('pendingUserId', effectiveUserId);
  }
  
  if (contactInfo.email) {
    console.log("Storing user email in session/local storage:", contactInfo.email);
    sessionStorage.setItem('userEmail', contactInfo.email);
    localStorage.setItem('userEmail', contactInfo.email);
  }
  
  // Prepare contact data with user ID if available
  const contactData = {
    full_name: contactInfo.fullName,
    email: contactInfo.email,
    submitted_at: new Date().toISOString(),
    user_id: effectiveUserId, // This might be null, but that's better than not trying
    terms_accepted: contactInfo.termsAccepted,
    privacy_accepted: contactInfo.privacyAccepted
  };
  
  // Save the contact info regardless of whether we have a userId
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
  
  // Store contact ID in session storage for the success page and potential recovery
  sessionStorage.setItem('contactId', contactId);
  localStorage.setItem('contactId', contactId);
  
  return contactId;
};
