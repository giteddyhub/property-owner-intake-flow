
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';

interface ContactInfo {
  fullName: string;
  email: string;
  termsAccepted?: boolean;
  privacyAccepted?: boolean;
}

interface PendingFormData {
  id?: string;
  owners: Owner[];
  properties: Property[];
  assignments: OwnerPropertyAssignment[];
  contact_info: ContactInfo;
  session_id: string;
  completed: boolean;
}

export const usePendingFormData = () => {
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const savePendingFormData = async (
    owners: Owner[],
    properties: Property[],
    assignments: OwnerPropertyAssignment[],
    contactInfo: ContactInfo,
    userId?: string
  ): Promise<string | null> => {
    setLoading(true);
    
    try {
      const pendingData: Omit<PendingFormData, 'id'> = {
        owners,
        properties,
        assignments,
        contact_info: contactInfo,
        session_id: sessionId,
        completed: false
      };

      console.log('[PendingFormData] Saving pending form data:', {
        sessionId,
        userId,
        ownersCount: owners.length,
        propertiesCount: properties.length,
        assignmentsCount: assignments.length
      });

      if (userId) {
        // If user is authenticated, save to database
        const { data, error } = await supabase
          .from('pending_form_data')
          .upsert({
            user_id: userId,
            session_id: sessionId,
            owners: owners,
            properties: properties,
            assignments: assignments,
            contact_info: contactInfo,
            completed: false
          }, {
            onConflict: 'user_id,session_id'
          })
          .select()
          .single();

        if (error) {
          console.error('[PendingFormData] Database save error:', error);
          throw error;
        }

        console.log('[PendingFormData] Successfully saved to database:', data.id);
        return data.id;
      } else {
        // If user not authenticated, save to sessionStorage as backup
        sessionStorage.setItem('pendingFormData', JSON.stringify(pendingData));
        console.log('[PendingFormData] Saved to sessionStorage for unauthenticated user');
        return sessionId;
      }
    } catch (error: any) {
      console.error('[PendingFormData] Error saving pending data:', error);
      toast.error('Failed to save form data temporarily');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadPendingFormData = async (userId: string): Promise<PendingFormData | null> => {
    setLoading(true);
    
    try {
      // First try to load from database
      const { data, error } = await supabase
        .from('pending_form_data')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', false)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (error) {
        console.error('[PendingFormData] Database load error:', error);
        throw error;
      }

      if (data) {
        console.log('[PendingFormData] Loaded from database:', data.id);
        return {
          id: data.id,
          owners: data.owners as Owner[],
          properties: data.properties as Property[],
          assignments: data.assignments as OwnerPropertyAssignment[],
          contact_info: data.contact_info as ContactInfo,
          session_id: data.session_id,
          completed: data.completed
        };
      }

      // Fallback to sessionStorage
      const sessionData = sessionStorage.getItem('pendingFormData');
      if (sessionData) {
        console.log('[PendingFormData] Loaded from sessionStorage');
        return JSON.parse(sessionData) as PendingFormData;
      }

      return null;
    } catch (error: any) {
      console.error('[PendingFormData] Error loading pending data:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const completePendingFormData = async (userId: string, pendingId?: string): Promise<boolean> => {
    try {
      if (pendingId) {
        // Mark as completed in database
        const { error } = await supabase
          .from('pending_form_data')
          .update({ completed: true })
          .eq('id', pendingId)
          .eq('user_id', userId);

        if (error) {
          console.error('[PendingFormData] Error completing pending data:', error);
          return false;
        }
      }

      // Clear sessionStorage
      sessionStorage.removeItem('pendingFormData');
      sessionStorage.removeItem('submitAfterVerification');
      sessionStorage.removeItem('forceRetrySubmission');
      
      console.log('[PendingFormData] Marked as completed and cleared storage');
      return true;
    } catch (error: any) {
      console.error('[PendingFormData] Error completing pending data:', error);
      return false;
    }
  };

  const clearPendingFormData = async (userId: string): Promise<void> => {
    try {
      // Clear from database
      await supabase
        .from('pending_form_data')
        .delete()
        .eq('user_id', userId)
        .eq('completed', false);

      // Clear from sessionStorage
      sessionStorage.removeItem('pendingFormData');
      sessionStorage.removeItem('submitAfterVerification');
      sessionStorage.removeItem('forceRetrySubmission');
      
      console.log('[PendingFormData] Cleared all pending data');
    } catch (error: any) {
      console.error('[PendingFormData] Error clearing pending data:', error);
    }
  };

  return {
    loading,
    sessionId,
    savePendingFormData,
    loadPendingFormData,
    completePendingFormData,
    clearPendingFormData
  };
};
