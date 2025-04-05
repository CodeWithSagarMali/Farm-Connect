import { ReactNode } from 'react';
import { Route, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import Login from '@/pages/login';

interface ProtectedRouteProps {
  path: string;
  children: ReactNode;
}

export default function ProtectedRoute({ path, children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <Route path={path}>
      {(params) => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-border" />
            </div>
          );
        }
        
        if (!user) {
          // Save the intended location for redirecting after login
          sessionStorage.setItem('redirectAfterLogin', path);
          return <Login />;
        }
        
        // Render children if authenticated
        return children;
      }}
    </Route>
  );
}