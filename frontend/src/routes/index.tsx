import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { TicketsPage } from '@/pages/TicketsPage';
import { CreateTicketPage } from '@/pages/CreateTicketPage';
import { TicketDetailPage } from '@/pages/TicketDetailPage';
import { AdminPage } from '@/pages/AdminPage';
import { AdminTicketsPage } from '@/pages/AdminTicketsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminRoute } from '@/components/AdminRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },

      // Authenticated Protected Routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
          {
            path: 'tickets',
            element: <TicketsPage />,
          },
          {
            path: 'tickets/new',
            element: <CreateTicketPage />,
          },
          {
            path: 'tickets/:id',
            element: <TicketDetailPage />,
          },
        ],
      },

      // Admin Only Protected Routes
      {
        element: <AdminRoute />,
        children: [
          {
            path: 'admin',
            element: <AdminPage />,
          },
          {
            path: 'admin/tickets',
            element: <AdminTicketsPage />,
          },
        ],
      },

      // Fallback 404 Route
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
