import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';

export function MainLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].some(
    (path) => location.pathname === path || location.pathname.startsWith(`${path}/`)
  );
  const showHeader = isAuthenticated && !isAuthPage;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white">
      {/* Sticky Header with navigation & live API status - only visible when logged in */}
      {showHeader && <Header />}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <Outlet />
      </main>

      {/* Footer - omitted on authentication pages */}
      {!isAuthPage && <Footer />}
    </div>
  );
}
