import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminTickets, useAdminUpdateTicketStatus } from '@/hooks/useAdmin';
import {
  ShieldCheck,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  ArrowLeft,
  Users,
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
  const [limit, setLimit] = useState(10);

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
              <ArrowLeft className="h-3 w-3" />
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
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banners */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between animate-fade-in">
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
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between animate-shake">
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

      {/* Backend Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Keyword Search by Ticket Title */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              id="admin-search-input"
              data-testid="admin-search-input"
              type="text"
              placeholder="Search by ticket title (calls backend API)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-10 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
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
                className="appearance-none pl-3 pr-8 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <Filter className="h-3 w-3" />
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
                className="appearance-none pl-3 pr-8 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <Filter className="h-3 w-3" />
              </div>
            </div>

            <button
              type="submit"
              data-testid="admin-search-button"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            >
              Search
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                data-testid="admin-clear-filters"
                onClick={handleClearFilters}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <p className="text-sm font-semibold text-slate-700">Loading admin ticket queue...</p>
            <p className="text-xs text-slate-400">Fetching records across all registered customers</p>
          </div>
        </div>
      ) : isError ? (
        <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center shadow-xs space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Failed to load admin tickets</h3>
            <p className="text-xs text-rose-600 max-w-md mx-auto">
              {(error as Error)?.message || 'An error occurred while connecting to the admin API.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Retry Query
          </button>
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              {hasActiveFilters ? 'No tickets match your filters' : 'Ticket queue is empty'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'Try clearing the search query or changing your priority/status filters.'
                : 'There are no support tickets in the database yet.'}
            </p>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
            <table data-testid="admin-ticket-table" className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th scope="col" className="py-3.5 pl-6 pr-3">
                    Ticket
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    Customer
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    Category
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    Priority
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3.5 whitespace-nowrap">
                    Created
                  </th>
                  <th scope="col" className="py-3.5 pl-3 pr-6 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {tickets.map((ticket) => {
                  const isUpdating = updatingTicketId === ticket.id;

                  return (
                    <tr key={ticket.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Ticket Column */}
                      <td className="py-4 pl-6 pr-3">
                        <Link
                          to={`/tickets/${ticket.id}`}
                          className="font-bold text-slate-900 hover:text-purple-600 transition-colors block max-w-xs truncate"
                          title={ticket.title}
                        >
                          {ticket.title}
                        </Link>
                        <span className="text-[11px] font-mono text-slate-400">
                          {ticket.id.slice(0, 8)}...
                        </span>
                      </td>

                      {/* Customer Column */}
                      <td className="px-3 py-4 text-slate-700">
                        <div className="font-semibold text-slate-900 truncate max-w-[150px]">
                          {ticket.user?.name || 'Customer'}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          {ticket.user?.email || 'No email'}
                        </div>
                      </td>

                      {/* Category Column */}
                      <td className="px-3 py-4 text-slate-700">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {ticket.category}
                        </span>
                      </td>

                      {/* Priority Column */}
                      <td className="px-3 py-4">
                        <PriorityBadge priority={ticket.priority} size="sm" />
                      </td>

                      {/* Status Column */}
                      <td className="px-3 py-4">
                        <StatusBadge status={ticket.status} size="sm" />
                      </td>

                      {/* Created Column */}
                      <td className="px-3 py-4 text-slate-500 whitespace-nowrap">
                        {formatDate(ticket.createdAt)}
                      </td>

                      {/* Actions Column: Status Selector & Details Link */}
                      <td className="py-4 pl-3 pr-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {isUpdating ? (
                            <div className="flex items-center gap-1 text-purple-600 text-[11px] font-semibold">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Updating...</span>
                            </div>
                          ) : (
                            <select
                              aria-label={`Update status for ${ticket.title}`}
                              value={ticket.status}
                              onChange={(e) =>
                                handleStatusChange(
                                  ticket.id,
                                  ticket.title,
                                  e.target.value as Status,
                                )
                              }
                              className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-[11px] font-semibold text-slate-700 hover:border-purple-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            >
                              <option value="OPEN">Open</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="RESOLVED">Resolved</option>
                            </select>
                          )}

                          <Link
                            to={`/tickets/${ticket.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                            title="View ticket details"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>

          {/* Mobile & Tablet Card View */}
          <div className="md:hidden space-y-3">
            {tickets.map((ticket) => {
              const isUpdating = updatingTicketId === ticket.id;

              return (
                <div
                  key={ticket.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="text-sm font-bold text-slate-900 hover:text-purple-600 transition-colors line-clamp-2"
                      >
                        {ticket.title}
                      </Link>
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="p-1 text-slate-400 hover:text-purple-600 shrink-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-semibold">{ticket.user?.name}</span>
                      <span className="text-slate-400">({ticket.user?.email})</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                      {ticket.category}
                    </span>
                    <PriorityBadge priority={ticket.priority} size="sm" />
                    <StatusBadge status={ticket.status} size="sm" />
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-400 text-[11px]">
                      {formatDate(ticket.createdAt)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isUpdating ? (
                        <div className="flex items-center gap-1 text-purple-600 text-xs">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Saving...</span>
                        </div>
                      ) : (
                        <select
                          aria-label={`Update status for ${ticket.title}`}
                          value={ticket.status}
                          onChange={(e) =>
                            handleStatusChange(
                              ticket.id,
                              ticket.title,
                              e.target.value as Status,
                            )
                          }
                          className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700"
                        >
                          <option value="OPEN">Open</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {meta && meta.totalPages > 1 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 px-4 py-3 sm:px-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Showing{' '}
                <span className="font-semibold text-slate-800">
                  {(meta.page - 1) * meta.limit + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-slate-800">
                  {Math.min(meta.page * meta.limit, meta.total)}
                </span>{' '}
                of <span className="font-semibold text-slate-800">{meta.total}</span> tickets
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!meta.hasPrevPage}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </button>

                <span className="text-xs font-semibold text-slate-700 px-2">
                  Page {meta.page} of {meta.totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={!meta.hasNextPage}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>

                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="ml-2 px-2 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white"
                  title="Items per page"
                >
                  <option value={10}>10 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
