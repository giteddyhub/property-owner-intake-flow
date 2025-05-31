
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ijwwnaqprojdczfppxkf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqd3duYXFwcm9qZGN6ZnBweGtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzgyNTcsImV4cCI6MjA1OTg1NDI1N30.Zu3RZXLSz1csaq3uUoKCmGb32MZKYSrourTqg4WNT-Y";

// Create a specialized admin client that includes admin token headers
export const createAdminClient = (adminToken?: string) => {
  console.log('[adminClient] 🔑 Creating admin client with token:', adminToken ? 'YES' : 'NO');
  
  const options = adminToken ? {
    global: {
      headers: {
        'x-admin-token': adminToken,
        'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
      }
    }
  } : {
    global: {
      headers: {
        'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
      }
    }
  };

  const client = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, options);
  
  // Log token usage for debugging
  if (adminToken) {
    console.log('[adminClient] ✅ Creating admin client with token:', adminToken.substring(0, 20) + '...');
  } else {
    console.log('[adminClient] ⚠️ Creating admin client without token');
  }

  return client;
};

// Helper function to get admin token from localStorage
export const getAdminToken = (): string | null => {
  try {
    const adminSessionStr = localStorage.getItem('admin_session');
    if (adminSessionStr) {
      const adminSession = JSON.parse(adminSessionStr);
      const token = adminSession.session?.token || null;
      if (token) {
        console.log('[adminClient] ✅ Retrieved admin token from localStorage:', token.substring(0, 20) + '...');
      } else {
        console.log('[adminClient] ❌ No token found in admin session');
      }
      return token;
    } else {
      console.log('[adminClient] ❌ No admin session found in localStorage');
    }
  } catch (error) {
    console.error('[adminClient] ❌ Error getting admin token:', error);
  }
  return null;
};

// Create admin client with current token
export const getAuthenticatedAdminClient = () => {
  const adminToken = getAdminToken();
  if (!adminToken) {
    console.error('[adminClient] ❌ No admin token available, throwing error');
    throw new Error('No admin token available');
  }
  
  console.log('[adminClient] 🚀 Creating authenticated admin client');
  return createAdminClient(adminToken);
};
