
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
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
    console.log("Dashboard: Manually refreshing data");
    setRefreshFlag(prev => prev + 1);
  }, []);
  
  const { loading, owners, properties, assignments, totalRevenue, error, refetch } = useDashboardData();

  // Trigger refetch when refreshFlag changes
  useEffect(() => {
    if (refreshFlag > 0) {
      refetch();
    }
  }, [refreshFlag, refetch]);

  // Handle errors from useDashboardData
  useEffect(() => {
    if (error && !loading) {
      console.error('Dashboard data error:', error);
      if (!error.includes('JWT') && !error.includes('auth')) {
        toast.error(`Failed to load dashboard data: ${error}`);
      }
    }
  }, [error, loading]);

  // Clean up any legacy session storage flags without showing duplicate toasts
  useEffect(() => {
    const showSuccess = sessionStorage.getItem('showSuccessMessage') === 'true';
    const redirectToDashboard = sessionStorage.getItem('redirectToDashboard') === 'true';
    
    if (showSuccess || redirectToDashboard) {
      // Clear the flags to prevent future issues
      sessionStorage.removeItem('showSuccessMessage');
      sessionStorage.removeItem('redirectToDashboard');
      
      console.log("Dashboard: Clearing legacy session storage flags");
      
      // Refresh data to ensure latest information is displayed
      setTimeout(() => {
        refreshData();
      }, 500);
    }
  }, [refreshData]);

  const handleSignOut = async () => {
    try {
      sessionStorage.clear();
      localStorage.removeItem('supabase.auth.token');
      
      await signOut();
      toast.success('Signed out successfully');
      
      // Navigate to home instead of forcing window location
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="animate-in fade-in duration-300">
      <DashboardLayout
        owners={owners}
        properties={properties}
        assignments={assignments}
        totalRevenue={totalRevenue}
        onSignOut={handleSignOut}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        onRefresh={refreshData}
        userId={user?.id || ''}
      />
    </div>
  );
};

export default DashboardPage;
