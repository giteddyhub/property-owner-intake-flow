
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
 * Checks if admin setup has been completed
 * @returns Promise resolving to true if setup is complete, false otherwise
 */
export const checkAdminSetupStatus = async (): Promise<boolean> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Query the admin_users table directly
    const { data, error, count } = await supabase
      .from('admin_users')
      .select('*', { count: 'exact' });
    
    if (error) {
      console.error("Error checking admin setup:", error);
      return false;
    }
    
    // If we have any admin users, setup is complete
    return (count !== null && count > 0);
  } catch (err) {
    console.error("Exception checking admin setup:", err);
    return false;
  }
};
