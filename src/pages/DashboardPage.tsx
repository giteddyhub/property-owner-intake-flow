import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { LoadingScreen } from '@/components/dashboard/LoadingScreen';
import { useDashboardData } from '@/hooks/useDashboardData';
import { toast } from '@/hooks/use-toast';

const DashboardPage = () => {
  const { user, signOut, checkAdminStatus } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('properties');
  
  const [refreshFlag, setRefreshFlag] = useState(0);
  
  const refreshData = useCallback(() => {
    console.log("Dashboard: Manually refreshing data");
    setRefreshFlag(prev => prev + 1);
  }, []);
  
  const { loading, owners, properties, assignments, refetch } = useDashboardData();

  // Trigger refetch when refreshFlag changes
  useEffect(() => {
    if (refreshFlag > 0) {
      refetch();
    }
  }, [refreshFlag, refetch]);

  // Check for redirect from form submission - revised to use localStorage
  useEffect(() => {
    const handleRedirectMessage = () => {
      // Get the redirect flag from sessionStorage
      const shouldShowMessage = sessionStorage.getItem('redirectToDashboard') === 'true';
      
      // Check localStorage to see if we've already shown this message in this session
      const hasShownMessage = localStorage.getItem('dashboardMessageShown') === 'true';
      
      if (shouldShowMessage && !hasShownMessage) {
        // Clear the redirect flag
        sessionStorage.removeItem('redirectToDashboard');
        
        // Set the flag in localStorage so we don't show it again on refresh
        localStorage.setItem('dashboardMessageShown', 'true');
        
        // Show the success message
        toast.success("Your property data has been successfully saved!");
        console.log("Dashboard: Showing one-time success message after redirect");
      }
    };
    
    handleRedirectMessage();
    
    // Clean up localStorage when navigating away 
    return () => {
      // This will ensure that if the user navigates away and back, 
      // they could potentially see the message again if redirected
      localStorage.removeItem('dashboardMessageShown');
    };
  }, []);

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

  React.useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    try {
      // First clear any session storage
      sessionStorage.clear();
      localStorage.removeItem('supabase.auth.token');
      
      await signOut();
      toast.success('Signed out successfully');
      
      // Use window.location for a full page reload and reset
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
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
      userId={user?.id || ''}
    />
  );
};

export default DashboardPage;
