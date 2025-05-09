
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/auth/AuthContext';
import { AppRoutes } from './components/routing/AppRoutes';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <AppRoutes />
          <Toaster position="top-right" closeButton={true} richColors />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
