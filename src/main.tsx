
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthRoutes } from './components/routing/AuthRoutes';
import { AdminRoutes } from './components/routing/AdminRoutes';
import { AdminErrorBoundary } from './components/admin/error/AdminErrorBoundary';
import { AppRoutes } from './components/routing/AppRoutes';
import { Toaster as SonnerToaster } from 'sonner';
import './index.css';

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <Router>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthRoutes>
          <AdminRoutes>
            <AdminErrorBoundary>
              <div className="min-h-screen bg-background">
                <AppRoutes />
                <Toaster />
                <SonnerToaster />
              </div>
            </AdminErrorBoundary>
          </AdminRoutes>
        </AuthRoutes>
      </ThemeProvider>
    </Router>
  </QueryClientProvider>
);
