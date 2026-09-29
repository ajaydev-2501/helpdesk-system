import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-slate-500 font-medium">Verifying authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated user to /login and preserve destination in location.state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
