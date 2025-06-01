
import { supabase } from '@/integrations/supabase/client';
import { ActivityLogger } from '@/services/activityLogger';

/**
 * Utility to generate historical activities for existing users
 * This should be run once to populate activity logs for users who performed actions before logging was implemented
 */
export const generateHistoricalActivities = async (userId: string): Promise<void> => {
  console.log(`[HistoricalActivities] Generating historical activities for user: ${userId}`);
  
  try {
    // Get user registration date from profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('created_at, email, full_name')
      .eq('id', userId)
      .single();

    if (profile) {
      // Log historical user registration
      await ActivityLogger.log({
        userId,
        activityType: 'user_registration',
        activityDescription: 'User completed registration',
        entityType: 'user',
        entityId: userId,
        metadata: {
          email: profile.email,
          registration_timestamp: profile.created_at,
          source: 'historical_import'
        }
      });
    }

    // Get all owners created by this user
    const { data: owners } = await supabase
      .from('owners')
      .select('id, first_name, last_name, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (owners) {
      for (const owner of owners) {
        await ActivityLogger.log({
          userId,
          activityType: 'owner_created',
          activityDescription: `Created property owner: ${owner.first_name} ${owner.last_name}`,
          entityType: 'owner',
          entityId: owner.id,
          metadata: {
            owner_name: `${owner.first_name} ${owner.last_name}`,
            creation_timestamp: owner.created_at,
            source: 'historical_import'
          }
        });
      }
    }

    // Get all properties created by this user
    const { data: properties } = await supabase
      .from('properties')
      .select('id, label, property_type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (properties) {
      for (const property of properties) {
        await ActivityLogger.log({
          userId,
          activityType: 'property_created',
          activityDescription: `Created property: ${property.label}`,
          entityType: 'property',
          entityId: property.id,
          metadata: {
            property_label: property.label,
            property_type: property.property_type,
            creation_timestamp: property.created_at,
            source: 'historical_import'
          }
        });
      }
    }

    // Get all assignments with proper column hints to avoid ambiguity
    const { data: assignments } = await supabase
      .from('owner_property_assignments')
      .select(`
        id, 
        created_at,
        owner_id,
        property_id
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (assignments) {
      for (const assignment of assignments) {
        // Get owner and property details separately to avoid ambiguity
        const { data: owner } = await supabase
          .from('owners')
          .select('first_name, last_name')
          .eq('id', assignment.owner_id)
          .single();

        const { data: property } = await supabase
          .from('properties')
          .select('label')
          .eq('id', assignment.property_id)
          .single();

        const ownerName = owner 
          ? `${owner.first_name} ${owner.last_name}`
          : 'Unknown Owner';
        const propertyLabel = property?.label || 'Unknown Property';

        await ActivityLogger.log({
          userId,
          activityType: 'assignment_created',
          activityDescription: `Created assignment: ${ownerName} → ${propertyLabel}`,
          entityType: 'assignment',
          entityId: assignment.id,
          metadata: {
            owner_name: ownerName,
            property_label: propertyLabel,
            creation_timestamp: assignment.created_at,
            source: 'historical_import'
          }
        });
      }
    }

    // Get all form submissions by this user
    const { data: submissions } = await supabase
      .from('form_submissions')
      .select('id, submitted_at, state')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: true });

    if (submissions) {
      for (const submission of submissions) {
        await ActivityLogger.log({
          userId,
          activityType: 'form_submitted',
          activityDescription: 'Submitted tax form',
          entityType: 'form_submission',
          entityId: submission.id,
          metadata: {
            submission_state: submission.state,
            submission_timestamp: submission.submitted_at,
            source: 'historical_import'
          }
        });
      }
    }

    console.log(`[HistoricalActivities] ✅ Historical activities generated for user: ${userId}`);
  } catch (error) {
    console.error(`[HistoricalActivities] ❌ Error generating historical activities:`, error);
  }
};

/**
 * Generate historical activities for all users in the system
 */
export const generateAllHistoricalActivities = async (): Promise<void> => {
  console.log('[HistoricalActivities] Generating historical activities for all users...');
  
  try {
    // Get all user IDs from profiles table
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id');

    if (profiles) {
      for (const profile of profiles) {
        await generateHistoricalActivities(profile.id);
        // Add a small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('[HistoricalActivities] ✅ All historical activities generated');
  } catch (error) {
    console.error('[HistoricalActivities] ❌ Error generating all historical activities:', error);
  }
};
