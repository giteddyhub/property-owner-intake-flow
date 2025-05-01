
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
  const refreshData = useCallback(() => {
    setRefreshFlag(prev => prev + 1);
  }, []);
  
  const { loading, owners, properties, assignments } = useDashboardData({ 
    userId: user?.id,
    refreshFlag 
  });

  // Detect if we're coming back from form submission
  useEffect(() => {
    const isComingFromSubmission = sessionStorage.getItem('contactId');
    if (isComingFromSubmission && user) {
      // Clear the flag to avoid showing the message again
      sessionStorage.removeItem('contactId');
      
      // Show the welcome message
      toast.success("Welcome to your dashboard!", {
        description: "Your property information has been saved and is now available in your account.",
        duration: 5000,
      });
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user && !loading) {
      navigate('/');
    }
  }, [user, navigate, loading]);

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
