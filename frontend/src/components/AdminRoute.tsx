import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';

export function AdminRoute() {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-slate-500 font-medium">Verifying administrator permissions...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div data-testid="access-restricted-card" className="max-w-lg mx-auto my-12 p-8 bg-white border border-rose-200 rounded-2xl shadow-xs text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          Access Restricted
        </span>
        <h2 className="text-xl font-bold text-slate-900">Administrator Privileges Required</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          You are signed in as <strong className="text-slate-900">{currentUser?.email}</strong> with role{' '}
          <span className="font-semibold text-blue-600">{currentUser?.role}</span>. This administrative area is
          restricted to users with the <span className="font-semibold text-rose-600">ADMIN</span> role.
        </p>
        <div className="pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
