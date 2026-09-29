import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminTickets, useAdminUpdateTicketStatus } from '@/hooks/useAdmin';
import {
  ShieldCheck,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  SlidersHorizontal,
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '@/components/TicketBadges';
import { formatDate } from '@/lib/utils';
import { Status, Priority } from '@/types';
import { getErrorMessage } from '@/services/api';

export function AdminTicketsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | ''>('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Status updating state and feedback
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAdminTickets({
    page,
    limit,
    search: searchQuery,
    status: statusFilter,
    priority: priorityFilter,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const updateStatusMutation = useAdminUpdateTicketStatus();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setStatusFilter('');
    setPriorityFilter('');
    setPage(1);
  };

  const handleStatusChange = async (ticketId: string, ticketTitle: string, newStatus: Status) => {
    setUpdatingTicketId(ticketId);
    setActionSuccess(null);
    setActionError(null);

    try {
      await updateStatusMutation.mutateAsync({ id: ticketId, status: newStatus });
      setActionSuccess(`Status for "${ticketTitle}" updated to ${newStatus}.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setUpdatingTicketId(null);
    }
  };

  const hasActiveFilters = Boolean(searchQuery || statusFilter || priorityFilter);
  const tickets = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Admin Console</span>
            </Link>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-purple-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              All Support Tickets
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ticket Management Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Triage, monitor, and update the status of customer tickets across the organization
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-purple-600' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banners */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            className="text-emerald-600 hover:text-emerald-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between animate-shake">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-rose-600 hover:text-rose-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              id="admin-search-input"
              data-testid="admin-search-input"
              type="text"
              placeholder="Search by ticket title..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 focus:outline-none focus:ring-4 focus:ring-purple-500/15 focus:border-purple-600 transition-all bg-slate-50/40 focus:bg-white"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearchQuery('');
                  setPage(1);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="relative">
              <select
                data-testid="admin-status-filter"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as Status | '');
                  setPage(1);
                }}
                className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-purple-500/15 focus:border-purple-600"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <select
                data-testid="admin-priority-filter"
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value as Priority | '');
                  setPage(1);
                }}
                className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-purple-500/15 focus:border-purple-600"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </div>
            </div>

            <button
              type="submit"
              data-testid="admin-search-button"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            >
              Search
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                data-testid="admin-clear-filters"
                onClick={handleClearFilters}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Content Section */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white border border-slate-200/60 p-4 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center shadow-xs space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Failed to load admin queue</h3>
            <p className="text-xs text-rose-600 max-w-md mx-auto">
              {(error as Error)?.message || 'An error occurred while connecting to the admin API.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors"
          >
            Retry Query
          </button>
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No admin tickets found</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              No tickets match your filter criteria or no customer tickets have been submitted.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                data-testid={`admin-ticket-row-${ticket.id}`}
                className="p-4 sm:p-5 hover:bg-slate-50/70 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors truncate"
                    >
                      {ticket.title}
                    </Link>
                    {ticket.user && (
                      <span className="text-xs text-slate-400 font-normal truncate">
                        by {ticket.user.name} ({ticket.user.email})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{ticket.description}</p>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 pt-0.5">
                    <span className="font-semibold text-slate-700 px-2 py-0.5 rounded-md bg-slate-100">
                      {ticket.category}
                    </span>
                    <span>•</span>
                    <span>Created {formatDate(ticket.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
                  <PriorityBadge priority={ticket.priority} size="sm" />
                  <StatusBadge status={ticket.status} size="sm" />

                  {/* Admin Status Quick Action Dropdown */}
                  <div className="pl-2 border-l border-slate-100 flex items-center gap-2">
                    <div className="relative">
                      <select
                        data-testid={`admin-ticket-status-select-${ticket.id}`}
                        disabled={updatingTicketId === ticket.id}
                        value={ticket.status}
                        onChange={(e) =>
                          handleStatusChange(ticket.id, ticket.title, e.target.value as Status)
                        }
                        className="appearance-none pl-3 pr-7 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50"
                      >
                        <option value="OPEN">Set Open</option>
                        <option value="IN_PROGRESS">Set In Progress</option>
                        <option value="RESOLVED">Set Resolved</option>
                      </select>
                      {updatingTicketId === ticket.id && (
                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                          <Loader2 className="h-3 w-3 animate-spin text-purple-600" />
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-600 hover:bg-purple-50 transition-colors"
                    >
                      Inspect
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Bar */}
          {meta && meta.totalPages > 1 && (
            <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>
                Showing page <strong className="text-slate-900">{meta.page}</strong> of{' '}
                <strong className="text-slate-900">{meta.totalPages}</strong> ({meta.total} total)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 font-semibold"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 font-semibold"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
