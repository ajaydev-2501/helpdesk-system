import { useAuth } from '@/hooks/useAuth';
import { useAdminStats, useAdminTickets } from '@/hooks/useAdmin';
import {
  ShieldCheck,
  Ticket as TicketIcon,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge, PriorityBadge } from '@/components/TicketBadges';
import { formatDate } from '@/lib/utils';

export function AdminPage() {
  const { currentUser } = useAuth();
  const { data: stats, isLoading: isStatsLoading, isError: isStatsError, refetch: refetchStats } =
    useAdminStats();

  const {
    data: recentTicketsData,
    isLoading: isRecentLoading,
    isError: isRecentError,
  } = useAdminTickets({
    page: 1,
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/30 border border-purple-400/30 text-purple-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Admin Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Administrative Control Center
            </h1>
            <p className="text-xs sm:text-sm text-purple-100 max-w-xl">
              System-wide oversight, customer ticket triage, and operational performance metrics.
              Logged in as <strong className="text-white">{currentUser?.email}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/tickets"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <TicketIcon className="h-4 w-4" />
              <span>Manage All Tickets</span>
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-colors border border-white/10"
            >
              <span>User Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Dashboard Statistics Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">System-Wide Ticket Statistics</h2>
          <button
            type="button"
            onClick={() => refetchStats()}
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Stats</span>
          </button>
        </div>

        {isStatsError ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-700">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span className="font-medium">Failed to retrieve statistics from the database.</span>
            <button
              type="button"
              onClick={() => refetchStats()}
              className="underline font-semibold ml-auto"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Tickets */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Tickets
                </span>
                <p data-testid="stat-total-tickets" className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {isStatsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  ) : (
                    stats?.total ?? 0
                  )}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <TicketIcon className="h-6 w-6" />
              </div>
            </div>

            {/* Open Tickets */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Open
                </span>
                <p data-testid="stat-open-tickets" className="text-2xl sm:text-3xl font-extrabold text-blue-600">
                  {isStatsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                  ) : (
                    stats?.open ?? 0
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
                <p data-testid="stat-in-progress-tickets" className="text-2xl sm:text-3xl font-extrabold text-amber-600">
                  {isStatsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
                  ) : (
                    stats?.inProgress ?? 0
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
                <p data-testid="stat-resolved-tickets" className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                  {isStatsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
                  ) : (
                    stats?.resolved ?? 0
                  )}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent System Tickets Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Customer Tickets</h3>
            <p className="text-xs text-slate-500">Live stream of tickets filed across all users</p>
          </div>

          <Link
            to="/admin/tickets"
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 group"
          >
            <span>View All in Management Table</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {isRecentLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="h-7 w-7 animate-spin text-purple-600" />
            <span className="text-xs font-medium">Loading system tickets...</span>
          </div>
        ) : isRecentError ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>Failed to load recent tickets.</span>
          </div>
        ) : recentTicketsData && recentTicketsData.data.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentTicketsData.data.map((ticket) => (
              <div
                key={ticket.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-xl transition-colors"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="text-xs font-bold text-slate-900 hover:text-purple-600 transition-colors truncate"
                      title={ticket.title}
                    >
                      {ticket.title}
                    </Link>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {ticket.user?.name || 'Unknown User'} ({ticket.user?.email || 'No email'})
                    </span>
                    <span>•</span>
                    <span className="font-medium text-slate-600">{ticket.category}</span>
                    <span>•</span>
                    <span>{formatDate(ticket.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  <PriorityBadge priority={ticket.priority} size="sm" />
                  <StatusBadge status={ticket.status} size="sm" />
                  <Link
                    to={`/tickets/${ticket.id}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                    title="View details"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center space-y-2">
            <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <TicketIcon className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No tickets found</h4>
            <p className="text-xs text-slate-500">There are currently no tickets in the database.</p>
          </div>
        )}
      </div>
    </div>
  );
}
