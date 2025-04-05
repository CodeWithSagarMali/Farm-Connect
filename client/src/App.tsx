
import { useState } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { Toaster } from './components/ui/toaster';
import { Loader2 } from 'lucide-react';

// Pages
import Login from './pages/login';
import Register from './pages/register';
import Dashboard from './pages/dashboard';
import KnowledgeBasePage from './pages/knowledge-base';
import AIAssistantPage from './pages/ai-assistant';
import ScheduleAppointmentPage from './pages/schedule-appointment';
import NotFoundPage from './pages/not-found';

// Layout components
import Header from './components/layout/header';
import Sidebar from './components/layout/sidebar';

// Auth
import ProtectedRoute from './components/auth/protected-route';
import { AuthProvider, useAuth } from './hooks/use-auth';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-border" />
  </div>
);

// The main app component that uses authentication
function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutUser, isLoading } = useAuth();

  // If auth is still loading, show a spinner
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Check if we're on a public route
  const isPublicRoute = location === '/login' || location === '/register';
  
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {user && !isPublicRoute && (
        <Header 
          user={user} 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          onLogout={logoutUser}
        />
      )}

      <div className="flex flex-1 relative">
        {user && !isPublicRoute && (
          <Sidebar 
            user={user}
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        <main className={`flex-1 transition-all duration-300 ${
          user && !isPublicRoute ? 'md:ml-64' : ''
        }`}>
          <Switch>
            <Route path="/login">
              <Login />
            </Route>
            
            <Route path="/register">
              <Register />
            </Route>
            
            <ProtectedRoute path="/knowledge-base">
              <KnowledgeBasePage />
            </ProtectedRoute>
            
            <ProtectedRoute path="/ai-assistant">
              <AIAssistantPage />
            </ProtectedRoute>
            
            <ProtectedRoute path="/schedule-appointment">
              <ScheduleAppointmentPage />
            </ProtectedRoute>
            
            <ProtectedRoute path="/">
              <Dashboard />
            </ProtectedRoute>
            
            <Route>
              <NotFoundPage />
            </Route>
          </Switch>
        </main>
      </div>

      <Toaster />
    </div>
  );
}

// The root App component that provides auth context
export default function App() {
  // The entire app needs to be wrapped in our own AuthProvider
  // AuthProvider is also used in main.tsx but we need to ensure
  // our Login and Register components are inside the AuthProvider
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
