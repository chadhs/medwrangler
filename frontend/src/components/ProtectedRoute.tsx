import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from './LoginForm';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="loading-container">
          <div className="loading-spinner large">⏳</div>
          <p>Loading MedWrangler...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Render protected content if authenticated
  return <>{children}</>;
}