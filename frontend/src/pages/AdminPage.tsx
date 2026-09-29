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
  TrendingUp,
  Activity,
  Layers,
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
  } = useAdminTickets({
    page: 1,
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 p-6 sm:p-8 md:p-10 text-white shadow-xl shadow-purple-950/10 border border-purple-900/40">
        {/* Subtle Glow & Grid Orbs */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-purple-500/15 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold">
              <ShieldCheck className="h-4 w-4 text-purple-400" />
              <span>System Admin Console</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              Administrative Control Center
            </h1>

            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed max-w-xl">
              System-wide ticket oversight, user queue management, and resolution SLAs. Logged in as{' '}
              <strong className="text-white font-semibold">{currentUser?.email}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/admin/tickets"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/25 active:scale-[0.99] transition-all duration-200"
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">System-Wide Metrics</h2>
          </div>

          <button
            type="button"
            onClick={() => refetchStats()}
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Stats</span>
          </button>
        </div>

        {isStatsError ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-800">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span className="font-medium">Failed to retrieve admin statistics from the database.</span>
            <button
              type="button"
              onClick={() => refetchStats()}
              className="underline font-semibold ml-auto"
            >
              Retry Query
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Tickets */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total System Tickets
                </span>
                <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Layers className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <p data-testid="stat-total-tickets" className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {isStatsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  ) : (
                    stats?.total ?? 0
                  )}
                </p>
                <span className="text-[11px] font-medium text-slate-400">System Total</span>
              </div>
            </div>

            {/* Open Tickets */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-blue-200 transition-all duration-200 group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Open Queue
                </span>
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <p data-testid="stat-open-tickets" className="text-2xl sm:text-3xl font-extrabold text-blue-600">
                  {isStatsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                  ) : (
                    stats?.open ?? 0
                  )}
                </p>
                <span className="text-[11px] font-medium text-blue-600/80 bg-blue-50 px-2 py-0.5 rounded-full">
                  Unassigned
                </span>
              </div>
            </div>

            {/* In Progress Tickets */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-amber-200 transition-all duration-200 group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                  In Progress
                </span>
                <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <p data-testid="stat-in-progress-tickets" className="text-2xl sm:text-3xl font-extrabold text-amber-600">
                  {isStatsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
                  ) : (
                    stats?.inProgress ?? 0
                  )}
                </p>
                <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  Active Triage
                </span>
              </div>
            </div>

            {/* Resolved Tickets */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all duration-200 group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                  Resolved
                </span>
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <p data-testid="stat-resolved-tickets" className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                  {isStatsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
                  ) : (
                    stats?.resolved ?? 0
                  )}
                </p>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Resolved
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent System Tickets Feed */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TicketIcon className="h-4 w-4 text-purple-600" />
              Recent Customer Tickets
            </h3>
            <p className="text-xs text-slate-500">Live stream of support tickets across all users</p>
          </div>

          <Link
            to="/admin/tickets"
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100/70 transition-colors group"
          >
            <span>View Management Table</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {isRecentLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-slate-100/70 animate-pulse" />
            ))}
          </div>
        ) : recentTicketsData && recentTicketsData.data.length > 0 ? (
          <div className="space-y-2.5">
            {recentTicketsData.data.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors truncate">
                      {ticket.title}
                    </span>
                    {ticket.user && (
                      <span className="text-[11px] text-slate-400 font-normal truncate">
                        by {ticket.user.name} ({ticket.user.email})
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700 px-2 py-0.5 rounded-md bg-slate-200/60">
                      {ticket.category}
                    </span>
                    <span>•</span>
                    <span>Created {formatDate(ticket.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
                  <PriorityBadge priority={ticket.priority} size="sm" />
                  <StatusBadge status={ticket.status} size="sm" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center space-y-2">
            <p className="text-xs text-slate-500">No recent tickets registered in the database.</p>
          </div>
        )}
      </div>
    </div>
  );
}
