
import { supabase } from '@/integrations/supabase/client';
import type { ContactInfo } from './types';

/**
 * Creates or updates a user profile with contact information
 * This replaces the old contacts table functionality
 */
export const saveContactInfo = async (
  contactInfo: ContactInfo,
  userId: string
): Promise<{ success: boolean; error?: Error }> => {
  try {
    console.log("[contactService] Updating profile with contact info for user:", userId);
    
    const profileData = {
      full_name: `${contactInfo.firstName} ${contactInfo.lastName}`.trim(),
      email: contactInfo.email,
      updated_at: new Date().toISOString()
    };
    
    console.log("[contactService] Updating profile data:", profileData);
    
    const { error } = await supabase
      .from('profiles')
      .upsert(
        { id: userId, ...profileData },
        { onConflict: 'id' }
      );
    
    if (error) {
      console.error("[contactService] Error updating profile:", error);
      throw new Error(`Failed to save contact information: ${error.message}`);
    }
    
    console.log("[contactService] Profile updated successfully");
    
    return { success: true };
  } catch (error) {
    console.error("[contactService] Error saving contact info:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error saving contact info')
    };
  }
};

/**
 * Retrieves contact information from the user's profile
 */
export const getContactInfo = async (userId: string): Promise<ContactInfo | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error("[contactService] Error fetching profile:", error);
      return null;
    }
    
    if (!profile) {
      return null;
    }
    
    // Parse full name back into first and last name
    const nameParts = (profile.full_name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    return {
      firstName,
      lastName,
      email: profile.email
    };
  } catch (error) {
    console.error("[contactService] Error getting contact info:", error);
    return null;
  }
};
