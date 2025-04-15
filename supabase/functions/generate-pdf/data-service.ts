
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const dataService = {
  /**
   * Updates contact with custom checkout link
   */
  async updateContactWithCheckoutLink(
    supabase: SupabaseClient,
    contactId: string,
    customCheckoutLink: string
  ) {
    const { error: updateError } = await supabase
      .from("contacts")
      .update({ custom_checkout_link: customCheckoutLink })
      .eq("id", contactId);

    if (updateError) {
      console.error("Error updating contact with custom link:", updateError);
      throw new Error(`Error updating contact: ${updateError.message}`);
    }
  },

  /**
   * Fetches contact data and all related entities
   */
  async fetchAllContactData(supabase: SupabaseClient, contactId: string) {
    // Fetch contact info
    const { data: contactData, error: contactError } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", contactId)
      .single();

    if (contactError || !contactData) {
      console.error("Error fetching contact:", contactError);
      throw new Error(`Error fetching contact: ${contactError?.message || "Contact not found"}`);
    }

    // Get owner information
    const { data: owners, error: ownersError } = await supabase
      .from("owners")
      .select("*")
      .eq("contact_id", contactId);

    if (ownersError) {
      console.error("Error fetching owners:", ownersError);
      throw new Error(`Error fetching owners: ${ownersError.message}`);
    }

    // Get property information
    const { data: properties, error: propertiesError } = await supabase
      .from("properties")
      .select("*")
      .eq("contact_id", contactId);

    if (propertiesError) {
      console.error("Error fetching properties:", propertiesError);
      throw new Error(`Error fetching properties: ${propertiesError.message}`);
    }

    // Get assignments information
    const { data: assignments, error: assignmentsError } = await supabase
      .from("owner_property_assignments")
      .select("*")
      .eq("contact_id", contactId);

    if (assignmentsError) {
      console.error("Error fetching assignments:", assignmentsError);
      throw new Error(`Error fetching assignments: ${assignmentsError.message}`);
    }

    return {
      contactData,
      owners,
      properties,
      assignments
    };
  },

  /**
   * Mark PDF as generated in the database
   */
  async markPdfAsGenerated(supabase: SupabaseClient, contactId: string) {
    await supabase
      .from("contacts")
      .update({ pdf_generated: true })
      .eq("id", contactId);
  }
};
