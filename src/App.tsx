
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/auth/AuthContext';
import { AppRoutes } from './components/routing/AppRoutes';
import { AdminRoutes } from './components/routing/AdminRoutes';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AdminRoutes>
          <div className="min-h-screen bg-background">
            <AppRoutes />
            <Toaster position="top-right" closeButton={true} richColors />
          </div>
        </AdminRoutes>
      </Router>
    </AuthProvider>
  );
}

export default App;
