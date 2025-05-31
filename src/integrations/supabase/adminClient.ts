
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ijwwnaqprojdczfppxkf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqd3duYXFwcm9qZGN6ZnBweGtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzgyNTcsImV4cCI6MjA1OTg1NDI1N30.Zu3RZXLSz1csaq3uUoKCmGb32MZKYSrourTqg4WNT-Y";

// Create a specialized admin client that includes admin token headers
export const createAdminClient = (adminToken?: string) => {
  const options = adminToken ? {
    global: {
      headers: {
        'x-admin-token': adminToken
      }
    }
  } : undefined;

  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, options);
};

// Helper function to get admin token from localStorage
export const getAdminToken = (): string | null => {
  try {
    const adminSessionStr = localStorage.getItem('admin_session');
    if (adminSessionStr) {
      const adminSession = JSON.parse(adminSessionStr);
      return adminSession.session?.token || null;
    }
  } catch (error) {
    console.error('Error getting admin token:', error);
  }
  return null;
};

// Create admin client with current token
export const getAuthenticatedAdminClient = () => {
  const adminToken = getAdminToken();
  if (!adminToken) {
    throw new Error('No admin token available');
  }
  return createAdminClient(adminToken);
};
