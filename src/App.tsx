import React from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { PracticeProvider } from '@/context/PracticeContext';
import Navbar from '@/components/Navbar';
import WorkspaceView from '@/pages/WorkspaceView';
import LoginPage from '@/pages/LoginPage';

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      <main className="flex-1 min-w-0">
        <WorkspaceView />
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <PracticeProvider>
        <AppContent />
      </PracticeProvider>
    </AuthProvider>
  );
};

export default App;
