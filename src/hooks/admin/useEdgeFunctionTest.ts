
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useEdgeFunctionTest = () => {
  const [loading, setLoading] = useState(false);

  const testAdminDeleteFunction = async () => {
    setLoading(true);
    try {
      console.log('[EdgeFunctionTest] Testing admin-delete-user function availability...');
      
      // Try to call the function with invalid parameters to test if it's deployed
      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          // Send empty body to trigger validation error (proves function is running)
        },
      });

      console.log('[EdgeFunctionTest] Function response:', { data, error });
      
      if (error) {
        // If we get a proper error response, the function is deployed
        if (error.message?.includes('Admin token required') || 
            error.message?.includes('Target user ID is required')) {
          console.log('[EdgeFunctionTest] ✅ Function is deployed and responding correctly');
          return { deployed: true, responding: true, message: 'Function is working' };
        } else {
          console.log('[EdgeFunctionTest] ❌ Function deployed but has issues:', error);
          return { deployed: true, responding: false, message: error.message };
        }
      }
      
      // If no error, check the response
      if (data && !data.success && data.error) {
        console.log('[EdgeFunctionTest] ✅ Function is deployed and validating correctly');
        return { deployed: true, responding: true, message: 'Function validation working' };
      }
      
      console.log('[EdgeFunctionTest] ⚠️ Unexpected response from function');
      return { deployed: true, responding: false, message: 'Unexpected response' };
      
    } catch (error: any) {
      console.error('[EdgeFunctionTest] ❌ Function test failed:', error);
      
      if (error.message?.includes('404') || error.message?.includes('Not Found')) {
        return { deployed: false, responding: false, message: 'Function not deployed' };
      }
      
      return { deployed: false, responding: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    testAdminDeleteFunction,
    loading
  };
};
