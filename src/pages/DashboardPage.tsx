import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { LoadingScreen } from '@/components/dashboard/LoadingScreen';
import { useDashboardData } from '@/hooks/useDashboardData';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const DashboardPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('properties');
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  
  const [refreshFlag, setRefreshFlag] = useState(0);
  const refreshData = useCallback(() => {
    setRefreshFlag(prev => prev + 1);
  }, []);
  
  // Try to get the user ID from either the authenticated user or the stored pending ID
  const effectiveUserId = user?.id || pendingUserId;
  
  // Fetch data using the effective user ID
  const { loading, owners, properties, assignments } = useDashboardData({ 
    userId: effectiveUserId,
    refreshFlag 
  });

  // Check for pendingUserId in both sessionStorage and localStorage
  useEffect(() => {
    const storedPendingUserId = sessionStorage.getItem('pendingUserId') || 
                              localStorage.getItem('pendingUserId');
    
    if (storedPendingUserId) {
      console.log("Found pending user ID in storage:", storedPendingUserId);
      setPendingUserId(storedPendingUserId);
    }
  }, []);

  // Handle the case where we are coming back after a form submission
  useEffect(() => {
    const isComingFromSubmission = sessionStorage.getItem('contactId');
    if (isComingFromSubmission) {
      // Clear the flag to avoid showing the message again
      sessionStorage.removeItem('contactId');
      
      // Show the welcome message
      toast.success("Welcome to your dashboard!", {
        description: "Your property information has been saved and is now available in your account.",
        duration: 5000,
      });
      
      // Refresh data to ensure we have the latest
      refreshData();
    }
  }, [effectiveUserId, refreshData]);

  // Redirect if not authenticated and we don't have a pending user ID
  useEffect(() => {
    if (!user && !pendingUserId && !loading) {
      console.log("No authenticated user or pending ID found, redirecting to home");
      navigate('/');
    }
  }, [user, navigate, loading, pendingUserId]);

  // Add a global cleanup handler
  useEffect(() => {
    // Initial cleanup on mount
    const cleanupOverlays = () => {
      const selectors = [
        '[data-state="closed"][data-radix-portal]',
        '.vaul-overlay[data-state="closed"]',
        '[role="dialog"][aria-hidden="true"]',
        '.fixed.inset-0.z-50:not([data-state="open"])'
      ];
      
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
          if (element.parentNode) {
            console.log('Global cleanup removing element:', element);
            element.parentNode.removeChild(element);
          }
        });
      });
      
      // Reset body styles
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
    };

    // Cleanup on mount
    cleanupOverlays();
    
    // Add global click handler to force cleanup overlays if any are stuck
    const handleGlobalClick = () => {
      // Check if there are any closed dialogs still in the DOM
      const closedDialogs = document.querySelectorAll('[data-state="closed"][data-radix-portal]');
      if (closedDialogs.length > 0) {
        console.log('Found stray dialogs on click, cleaning up:', closedDialogs.length);
        cleanupOverlays();
      }
    };
    
    document.addEventListener('click', handleGlobalClick);
    
    // Cleanup on unmount
    return () => {
      document.removeEventListener('click', handleGlobalClick);
      cleanupOverlays();
    };
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  const handleSignOut = async () => {
    // Clear the pending user ID from storage
    sessionStorage.removeItem('pendingUserId');
    localStorage.removeItem('pendingUserId');
    
    // If we had a pending user ID but no authenticated user, just navigate home
    if (pendingUserId && !user) {
      navigate('/');
      return;
    }
    
    // Otherwise, perform the normal sign out
    await signOut();
    navigate('/');
  };

  return (
    <DashboardLayout
      owners={owners}
      properties={properties}
      assignments={assignments}
      onSignOut={handleSignOut}
      activeFilter={activeFilter}
      setActiveFilter={setActiveFilter}
      onRefresh={refreshData}
    />
  );
};

export default DashboardPage;
