
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
        // Try to get user ID from auth if available
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user?.id) {
          effectiveUserId = sessionData.session.user.id;
          console.log("Found user ID from current session:", effectiveUserId);
        } else {
          // If all lookups fail, use any stored user ID
          effectiveUserId = sessionStorage.getItem('pendingUserId') || 
                           localStorage.getItem('pendingUserId');
          if (effectiveUserId) {
            console.log("Using user ID from storage:", effectiveUserId);
          }
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
  
  // Check if we already have a contact with this email and user_id
  if (contactInfo.email && effectiveUserId) {
    const { data: existingContact, error: lookupError } = await supabase
      .from('contacts')
      .select('id')
      .eq('email', contactInfo.email)
      .eq('user_id', effectiveUserId)
      .maybeSingle();
      
    if (!lookupError && existingContact?.id) {
      console.log("Found existing contact with this email and user ID:", existingContact.id);
      // Update existing contact
      const { error: updateError } = await supabase
        .from('contacts')
        .update({
          full_name: contactInfo.fullName,
          submitted_at: new Date().toISOString(),
          terms_accepted: contactInfo.termsAccepted,
          privacy_accepted: contactInfo.privacyAccepted
        })
        .eq('id', existingContact.id);
        
      if (updateError) {
        console.error("Error updating existing contact:", updateError);
      } else {
        console.log("Updated existing contact");
        return existingContact.id;
      }
    }
  }
  
  // Save the contact info as new record
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
  
  // If user ID is available but wasn't originally in the contact record, update it now
  // This is a safety measure in case user ID becomes available after initial save
  if (effectiveUserId && !data[0].user_id) {
    console.log("Updating contact with user ID that became available after initial save");
    const { error: updateError } = await supabase
      .from('contacts')
      .update({ user_id: effectiveUserId })
      .eq('id', contactId);
      
    if (updateError) {
      console.error("Error updating contact with new user ID:", updateError);
    }
  }
  
  console.log("Contact saved successfully with ID:", contactId, "and user ID:", effectiveUserId || "(none)");
  return contactId;
};
