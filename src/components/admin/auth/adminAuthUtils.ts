
/**
 * Generate a secure random password
 * @returns A strong random password
 */
export const generateSecurePassword = (): string => {
  const length = 16;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
};

/**
 * Creates a Supabase client with service role permissions for admin operations
 * Should only be used for specific admin-related checks that need elevated permissions
 */
const getServiceRoleClient = async () => {
  try {
    // Import the base client to use the same URL
    const { supabase } = await import('@/integrations/supabase/client');
    const { createClient } = await import('@supabase/supabase-js');
    
    // For client-side code, we'll use the normal client
    // In a production environment, this would need to be handled via a secure API endpoint
    return supabase;
  } catch (err) {
    console.error("Failed to create service role client:", err);
    const { supabase } = await import('@/integrations/supabase/client');
    return supabase;
  }
};

/**
 * Checks if admin setup has been completed
 * @returns Promise resolving to true if setup is complete, false otherwise
 */
export const checkAdminSetupStatus = async (): Promise<boolean> => {
  let attempts = 0;
  const maxAttempts = 2;
  
  while (attempts < maxAttempts) {
    attempts++;
    try {
      console.log(`[AdminAuth] Checking admin setup status (attempt ${attempts})...`);
      
      // Use the standard client first
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Query the admin_users table directly with a count
      const { count, error } = await supabase
        .from('admin_credentials')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error(`[AdminAuth] Error checking admin setup (attempt ${attempts}):`, error);
        
        // If first attempt failed, try again with a small delay
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        return false;
      }
      
      const adminExists = count !== null && count > 0;
      console.log(`[AdminAuth] Admin count: ${count}, Admin exists: ${adminExists}`);
      
      // Cache the result in sessionStorage to prevent repeated checking
      try {
        sessionStorage.setItem('adminSetupComplete', adminExists ? 'true' : 'false');
        sessionStorage.setItem('adminSetupCheckedAt', Date.now().toString());
      } catch (e) {
        // Ignore storage errors
      }
      
      return adminExists;
    } catch (err) {
      console.error(`[AdminAuth] Exception checking admin setup (attempt ${attempts}):`, err);
      
      // If first attempt failed, try again with a small delay
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      return false;
    }
  }
  
  return false;
};

/**
 * Force refresh the admin setup status by clearing the cache and rechecking
 */
export const refreshAdminSetupStatus = async (): Promise<boolean> => {
  try {
    // Clear the cached status
    sessionStorage.removeItem('adminSetupComplete');
    sessionStorage.removeItem('adminSetupCheckedAt');
    
    // Perform a fresh check
    return await checkAdminSetupStatus();
  } catch (err) {
    console.error("[AdminAuth] Error refreshing admin setup status:", err);
    return false;
  }
};
