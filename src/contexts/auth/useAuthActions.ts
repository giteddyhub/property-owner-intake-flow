
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ActivityLogger } from '@/services/activityLogger';

export const useAuthActions = () => {
  const [loading, setLoading] = useState(false);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      
      // Use verify-email as the redirect URL for email verification
      const redirectUrl = `${window.location.origin}/verify-email`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes('User already registered')) {
          toast.error('An account with this email already exists. Please try signing in instead.');
        } else if (error.message.includes('Invalid email')) {
          toast.error('Please enter a valid email address.');
        } else if (error.message.includes('Password should be at least')) {
          toast.error('Password must be at least 6 characters long.');
        } else {
          toast.error(error.message || 'Failed to create account');
        }
        throw error;
      }

      if (data.user) {
        console.log('User signed up successfully:', data.user.id);
        
        // Enhanced registration activity logging
        await ActivityLogger.logUserRegistration(data.user.id, email);
        
        // Check if email confirmation is required
        if (!data.user.email_confirmed_at) {
          toast.success('Account created! Please check your email to verify your account.');
        } else {
          toast.success('Account created successfully! You can now sign in.');
        }
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Handle specific sign-in errors
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please verify your email address before signing in. Check your inbox for the verification link.');
        } else if (error.message.includes('Too many requests')) {
          toast.error('Too many login attempts. Please wait a moment before trying again.');
        } else {
          toast.error(error.message || 'Failed to sign in');
        }
        throw error;
      }

      if (data.user) {
        console.log('User signed in successfully:', data.user.id);
        
        // Enhanced login activity logging
        await ActivityLogger.logUserLogin(data.user.id, email);
        
        toast.success('Welcome back!');
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('Starting sign out process...');
      
      // Check if user is actually signed in before attempting sign out
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No active session found, user already signed out');
        // Clear any remaining application state
        clearApplicationState();
        return;
      }

      console.log('Found active session, proceeding with sign out');
      
      // Attempt to sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        // Don't throw error for "Session not found" as user is effectively signed out
        if (error.message?.includes('Session not found') || error.message?.includes('session_not_found')) {
          console.log('Session already expired/invalid, clearing local state');
          clearApplicationState();
          return;
        }
        throw error;
      }

      console.log('Sign out successful');
      clearApplicationState();
      
    } catch (error: any) {
      console.error('Sign out error:', error);
      
      // For session-related errors, still clear local state and don't show error to user
      if (error.message?.includes('Session not found') || 
          error.message?.includes('session_not_found') ||
          error.message?.includes('Invalid session')) {
        console.log('Handling session error by clearing local state');
        clearApplicationState();
        return;
      }
      
      toast.error('Failed to sign out properly. Clearing local session.');
      clearApplicationState();
    } finally {
      setLoading(false);
    }
  };

  const clearApplicationState = () => {
    try {
      // Clear application-specific session storage (not Supabase tokens)
      const keysToRemove = [
        'submitAfterVerification',
        'redirectToDashboard',
        'formSubmittedDuringSignup',
        'forceRetrySubmission',
        'ownersCount',
        'propertiesCount',
        'hasDocumentRetrievalService',
        'lastSubmissionTime',
        'submitted_users'
      ];
      
      keysToRemove.forEach(key => {
        try {
          sessionStorage.removeItem(key);
        } catch (e) {
          // Ignore individual key removal errors
        }
      });
      
      console.log('Application state cleared');
    } catch (error) {
      console.error('Error clearing application state:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      toast.success('Password reset email sent');
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      toast.success('Password updated successfully');
      return data;
    } catch (error: any) {
      console.error('Update password error:', error);
      toast.error(error.message || 'Failed to update password');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    loading,
    updateProfile: async (updates: { full_name?: string; email?: string }) => {
      try {
        setLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user logged in');

        // Update auth user email if provided
        if (updates.email && updates.email !== user.email) {
          const { error: emailError } = await supabase.auth.updateUser({
            email: updates.email
          });
          if (emailError) throw emailError;
        }

        // Update profile in profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: updates.full_name,
            email: updates.email || user.email,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });

        if (profileError) throw profileError;

        // Enhanced profile update activity logging
        const updatedFields = Object.keys(updates).filter(key => updates[key as keyof typeof updates]);
        await ActivityLogger.logProfileUpdate(user.id, updatedFields, user.email);

        toast.success('Profile updated successfully');
        
      } catch (error: any) {
        console.error('Profile update error:', error);
        toast.error(error.message || 'Failed to update profile');
        throw error;
      } finally {
        setLoading(false);
      }
    }
  };
};
