
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';
import { toast } from 'sonner';

export const useSessionValidation = () => {
  const navigate = useNavigate();
  const { adminSession, isAdminAuthenticated, checkAdminSession } = useAdminAuth();

  const validateSession = async (): Promise<boolean> => {
    if (!isAdminAuthenticated || !adminSession?.token) {
      console.log('No valid admin session, checking session...');
      const isValid = await checkAdminSession();
      if (!isValid) {
        toast.error('Admin session expired. Please log in again.');
        navigate('/admin/login');
        return false;
      }
    }
    return true;
  };

  return { validateSession, adminSession };
};
