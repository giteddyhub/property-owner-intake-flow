
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { LoadingScreen } from '@/components/dashboard/LoadingScreen';
import { useDashboardData } from '@/hooks/useDashboardData';
import { toast } from 'sonner';

const DashboardPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('properties');
  
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [hasRefreshedAfterRedirect, setHasRefreshedAfterRedirect] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  const refreshData = useCallback(() => {
    console.log("Dashboard: Manually refreshing data");
    setRefreshFlag(prev => prev + 1);
  }, []);
  
  const { loading, owners, properties, assignments } = useDashboardData({ 
    userId: user?.id,
    refreshFlag 
  });

  // Check for redirect from form submission and handle initial data load only once
  useEffect(() => {
    // Check if we need to refresh the data after form submission
    const shouldReload = sessionStorage.getItem('redirectToDashboard') === 'true';
    
    if (!initialLoadComplete) {
      // Initial load - mark as complete
      setInitialLoadComplete(true);
      
      // Only show welcome toast for first-time redirects
      if (shouldReload && !hasRefreshedAfterRedirect) {
        sessionStorage.removeItem('redirectToDashboard');
        toast.success("Your property data has been successfully saved!");
        
        console.log("Dashboard: Initial refresh after redirect");
        setHasRefreshedAfterRedirect(true);
      }
    }
  }, [hasRefreshedAfterRedirect, initialLoadComplete]);

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
      await signOut();
      toast.success('Signed out successfully');
      navigate('/', { replace: true });
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
    />
  );
};

export default DashboardPage;
