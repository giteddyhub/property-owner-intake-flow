
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { LoadingScreen } from '@/components/dashboard/LoadingScreen';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { toast } from 'sonner';

const DashboardPage = () => {
  const { user, signOut, checkAdminStatus } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('properties');
  
  const [refreshFlag, setRefreshFlag] = useState(0);
  
  const refreshData = useCallback(() => {
    console.log("Dashboard: Manually refreshing data");
    setRefreshFlag(prev => prev + 1);
  }, []);
  
  const { loading, owners, properties, assignments, totalRevenue, error, refetch } = useDashboardData();

  // Set up real-time data updates
  const { isAutoRefreshing, toggleAutoRefresh } = useRealTimeData({
    refetchFn: refetch,
    intervalMs: 30000, // 30 seconds
    enabled: true
  });

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

  // Check for success message from form submission
  useEffect(() => {
    const showSuccess = sessionStorage.getItem('showSuccessMessage') === 'true';
    const redirectToDashboard = sessionStorage.getItem('redirectToDashboard') === 'true';
    
    if (showSuccess || redirectToDashboard) {
      // Clear the flags
      sessionStorage.removeItem('showSuccessMessage');
      sessionStorage.removeItem('redirectToDashboard');
      
      // Show success message
      toast.success("Your property information has been successfully saved!", {
        description: "All your data is now available in your dashboard."
      });
      
      // Refresh data to ensure latest information is displayed
      setTimeout(() => {
        refreshData();
      }, 500);
      
      console.log("Dashboard: Showing success message and refreshing data");
    }
  }, [refreshData]);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    try {
      sessionStorage.clear();
      localStorage.removeItem('supabase.auth.token');
      
      await signOut();
      toast.success('Signed out successfully');
      
      window.location.href = '/';
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
        isAutoRefreshing={isAutoRefreshing}
        onToggleAutoRefresh={toggleAutoRefresh}
        isRefreshing={loading}
      />
    </div>
  );
};

export default DashboardPage;
