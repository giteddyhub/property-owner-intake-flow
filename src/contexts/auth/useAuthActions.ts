
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ActivityLogger } from '@/services/activityLogger';

export const useAuthActions = () => {
  const [loading, setLoading] = useState(false);
  // Remove the setUser dependency since the auth state is managed by the context

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        console.log('User signed up successfully:', data.user.id);
        
        // Log registration activity
        await ActivityLogger.logUserRegistration(data.user.id, email);
        
        toast.success('Account created! Please check your email to verify your account.');
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to create account');
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

      if (error) throw error;

      if (data.user) {
        console.log('User signed in successfully:', data.user.id);
        
        // Log login activity
        await ActivityLogger.logUserLogin(data.user.id);
        
        toast.success('Welcome back!');
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.message || 'Failed to sign out');
    } finally {
      setLoading(false);
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
          .update({
            full_name: updates.full_name,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (profileError) throw profileError;

        // Log profile update activity
        const updatedFields = Object.keys(updates).filter(key => updates[key as keyof typeof updates]);
        await ActivityLogger.logProfileUpdate(user.id, updatedFields);

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
