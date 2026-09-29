import { useAuth } from '@/hooks/useAuth';
import { useTicketMetrics, useTickets } from '@/hooks/useTickets';
import {
  User as UserIcon,
  Shield,
  Calendar,
  Ticket as TicketIcon,
  PlusCircle,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '@/lib/utils';
import { StatusBadge, PriorityBadge } from '@/components/TicketBadges';

export function DashboardPage() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  const { data: metrics, isLoading: isMetricsLoading } = useTicketMetrics();
  const { data: recentTicketsData, isLoading: isRecentLoading } = useTickets({
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-blue-200">
                Support Dashboard
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase border ${
                  isAdmin
                    ? 'bg-purple-500/30 text-purple-200 border-purple-400/40'
                    : 'bg-blue-500/30 text-blue-200 border-blue-400/40'
                }`}
              >
                {currentUser?.role}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Welcome back, {currentUser?.name || 'User'}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
              Track, manage, and submit technical support tickets in one centralized workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/tickets/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create Ticket</span>
            </Link>

            <Link
              to="/tickets"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-semibold hover:bg-blue-50 transition-colors shadow-sm"
            >
              <TicketIcon className="h-4 w-4 text-blue-600" />
              <span>View Tickets</span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors shadow-sm"
              >
                <Shield className="h-4 w-4" />
                <span>Admin Console</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Statistics Section */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">Ticket Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Tickets */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Tickets
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {isMetricsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                ) : (
                  metrics?.total ?? 0
                )}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TicketIcon className="h-6 w-6" />
            </div>
          </div>

          {/* Open Tickets */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                Open
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">
                {isMetricsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                ) : (
                  metrics?.open ?? 0
                )}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
          </div>

          {/* In Progress Tickets */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                In Progress
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">
                {isMetricsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
                ) : (
                  metrics?.inProgress ?? 0
                )}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>

          {/* Resolved Tickets */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                Resolved
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                {isMetricsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
                ) : (
                  metrics?.resolved ?? 0
                )}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Tickets & User Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tickets Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Tickets</h3>
              <p className="text-xs text-slate-500">Your most recently submitted support requests</p>
            </div>
            <Link
              to="/tickets"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {isRecentLoading ? (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-xs font-medium">Loading tickets...</span>
            </div>
          ) : recentTicketsData && recentTicketsData.data.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentTicketsData.data.map((ticket) => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/70 p-2 rounded-xl transition-colors group"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {ticket.title}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span className="font-medium text-slate-600">{ticket.category}</span>
                      <span>•</span>
                      <span>Created {formatDate(ticket.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <PriorityBadge priority={ticket.priority} size="sm" />
                    <StatusBadge status={ticket.status} size="sm" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <TicketIcon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">No tickets yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You haven&apos;t opened any support tickets yet. Need help with something?
                </p>
              </div>
              <Link
                to="/tickets/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Create Your First Ticket</span>
              </Link>
            </div>
          )}
        </div>

        {/* User Information & Quick Links Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Account Overview
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <UserIcon className="h-3.5 w-3.5 text-slate-500" />
                  Full Name
                </span>
                <p className="font-semibold text-slate-800">{currentUser?.name}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                <span className="text-slate-400 font-medium">Email Address</span>
                <p className="font-semibold text-slate-800 break-all">{currentUser?.email}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  Registered
                </span>
                <p className="font-semibold text-slate-800">
                  {currentUser?.createdAt ? formatDate(currentUser.createdAt) : 'Recently'}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="http://localhost:5000/api/docs"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/70 hover:border-slate-400 hover:bg-slate-50 transition-colors text-xs font-medium text-slate-700 group"
              >
                <span>Swagger API Documentation</span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
