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
  Sparkles,
  TrendingUp,
  Activity,
  Layers,
  FileCode2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '@/lib/utils';
import { StatusBadge, PriorityBadge } from '@/components/TicketBadges';

export function DashboardPage() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  const { data: metrics, isLoading: isMetricsLoading, refetch: refetchMetrics } = useTicketMetrics();
  const { data: recentTicketsData, isLoading: isRecentLoading } = useTickets({
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 md:p-10 text-white shadow-xl shadow-slate-950/10 border border-slate-800/80">
        {/* Subtle Glow & Grid Orbs */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-blue-500/15 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/20 text-blue-300 text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                <span>Support Workspace</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase border ${
                  isAdmin
                    ? 'bg-purple-500/20 text-purple-300 border-purple-400/30'
                    : 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                }`}
              >
                {currentUser?.role} Account
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-300">{currentUser?.name || 'User'}</span>!
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Track active issues, submit technical support requests, and monitor SLA resolution metrics from your central control hub.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/tickets/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all duration-200"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create Ticket</span>
            </Link>

            <Link
              to="/tickets"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-semibold backdrop-blur-sm transition-all duration-200"
            >
              <TicketIcon className="h-4 w-4 text-blue-300" />
              <span>View All Tickets</span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/90 hover:bg-purple-600 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all duration-200"
              >
                <Shield className="h-4 w-4" />
                <span>Admin Console</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Statistics Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Ticket Overview</h2>
          </div>
          <button
            type="button"
            onClick={() => refetchMetrics()}
            className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            <span>Refresh Stats</span>
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Tickets */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Tickets
              </span>
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Layers className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {isMetricsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                ) : (
                  metrics?.total ?? 0
                )}
              </p>
              <span className="text-[11px] font-medium text-slate-400">Lifetime</span>
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
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">
                {isMetricsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                ) : (
                  metrics?.open ?? 0
                )}
              </p>
              <span className="text-[11px] font-medium text-blue-600/80 bg-blue-50 px-2 py-0.5 rounded-full">
                Awaiting
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
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">
                {isMetricsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
                ) : (
                  metrics?.inProgress ?? 0
                )}
              </p>
              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                Active
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
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                {isMetricsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
                ) : (
                  metrics?.resolved ?? 0
                )}
              </p>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Done
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Tickets & User Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tickets Section */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <TicketIcon className="h-4 w-4 text-blue-600" />
                Recent Tickets
              </h3>
              <p className="text-xs text-slate-500">Latest support tickets submitted in your workspace</p>
            </div>
            <Link
              to="/tickets"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100/70 transition-colors group"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {isRecentLoading ? (
            <div className="py-10 space-y-3">
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
                      <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {ticket.title}
                      </span>
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
            <div className="py-12 text-center space-y-3">
              <div className="h-13 w-13 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                <TicketIcon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">No support tickets found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You haven&apos;t opened any tickets yet. Submit a new ticket to get technical assistance.
                </p>
              </div>
              <Link
                to="/tickets/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all duration-200"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Create Your First Ticket</span>
              </Link>
            </div>
          )}
        </div>

        {/* User Account Overview Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            {/* Header User Profile Badge */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-900 truncate">{currentUser?.name}</h3>
                <span
                  className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-0.5 ${
                    isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {currentUser?.role} Account
                </span>
              </div>
            </div>

            {/* Account Info Items */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-0.5">
                <span className="text-slate-400 font-medium flex items-center gap-1.5 text-[11px]">
                  <UserIcon className="h-3.5 w-3.5 text-slate-500" />
                  Full Name
                </span>
                <p className="font-semibold text-slate-800">{currentUser?.name}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-0.5">
                <span className="text-slate-400 font-medium text-[11px]">Email Address</span>
                <p className="font-semibold text-slate-800 break-all">{currentUser?.email}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-0.5">
                <span className="text-slate-400 font-medium flex items-center gap-1.5 text-[11px]">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  Member Since
                </span>
                <p className="font-semibold text-slate-800">
                  {currentUser?.createdAt ? formatDate(currentUser.createdAt) : 'Recently'}
                </p>
              </div>
            </div>

            {/* Developer & Swagger Docs link */}
            <div className="pt-2">
              <a
                href="http://localhost:5000/api/docs"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 text-xs font-medium text-slate-700 group"
              >
                <div className="flex items-center gap-2">
                  <FileCode2 className="h-4 w-4 text-indigo-600" />
                  <span>Swagger API Docs</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
