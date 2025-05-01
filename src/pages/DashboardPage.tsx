
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
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const [refreshFlag, setRefreshFlag] = useState(0);
  const refreshData = useCallback(() => {
    setRefreshFlag(prev => prev + 1);
  }, []);
  
  // Try to get the user ID from either the authenticated user or the stored pending ID
  const effectiveUserId = user?.id || pendingUserId;
  
  // Check for pendingUserId in both sessionStorage and localStorage
  useEffect(() => {
    const storedPendingUserId = sessionStorage.getItem('pendingUserId') || 
                              localStorage.getItem('pendingUserId');
    
    if (storedPendingUserId) {
      console.log("Found pending user ID in storage:", storedPendingUserId);
      setPendingUserId(storedPendingUserId);
    }
    
    // Set loading auth to false after checking for pending user ID
    setLoadingAuth(false);
  }, []);
  
  // Fetch data using the effective user ID
  const { loading, owners, properties, assignments, error } = useDashboardData({ 
    userId: effectiveUserId,
    refreshFlag 
  });

  // If we have a data loading error, show a toast
  useEffect(() => {
    if (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data. Please try again.");
    }
  }, [error]);

  // Handle the case where we are coming back after a form submission
  useEffect(() => {
    const contactId = sessionStorage.getItem('contactId');
    if (contactId) {
      console.log("Found contact ID in session storage:", contactId);
      
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
  }, [refreshData]);

  // Check if there's any purchase id that we should redirect to
  useEffect(() => {
    const purchaseId = sessionStorage.getItem('purchaseId');
    if (purchaseId && !loading && !loadingAuth) {
      // Only redirect if we have verified the user is authenticated
      if (effectiveUserId) {
        console.log("Found pending tax filing session:", purchaseId);
        navigate(`/tax-filing-service/${purchaseId}`);
      }
    }
  }, [effectiveUserId, navigate, loading, loadingAuth]);

  // Redirect if not authenticated and we don't have a pending user ID
  useEffect(() => {
    if (!loadingAuth && !user && !pendingUserId) {
      console.log("No authenticated user or pending ID found, redirecting to home");
      navigate('/');
    }
  }, [user, navigate, loadingAuth, pendingUserId]);

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

  // Show a more informative loading screen with potential recovery options
  if (loading && !error) {
    return <LoadingScreen />;
  }

  // If we have an error and no data, show error state
  if (error && owners.length === 0 && properties.length === 0 && assignments.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-semibold text-red-600 mb-2">Error Loading Dashboard</h1>
          <p className="text-gray-600 mb-4">
            We couldn't load your dashboard data. This might be due to a connection issue.
          </p>
          <button 
            onClick={refreshData} 
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Try Again
          </button>
          <button 
            onClick={() => navigate('/')} 
            className="px-4 py-2 ml-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    // Clear the pending user ID from storage
    sessionStorage.removeItem('pendingUserId');
    localStorage.removeItem('pendingUserId');
    sessionStorage.removeItem('purchaseId');
    
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
