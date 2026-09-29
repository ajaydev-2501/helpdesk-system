import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTickets, useDeleteTicket } from '@/hooks/useTickets';
import {
  Ticket as TicketIcon,
  PlusCircle,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Trash2,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '@/components/TicketBadges';
import { formatDate } from '@/lib/utils';
import { Status, Priority } from '@/types';

export function TicketsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | ''>('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Ticket to delete modal confirmation state
  const [ticketToDelete, setTicketToDelete] = useState<{ id: string; title: string } | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useTickets({
    page,
    limit,
    search: searchQuery,
    status: statusFilter,
    priority: priorityFilter,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const deleteTicketMutation = useDeleteTicket();

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

  const hasActiveFilters = Boolean(searchQuery || statusFilter || priorityFilter);

  const confirmDelete = async () => {
    if (!ticketToDelete) return;
    try {
      await deleteTicketMutation.mutateAsync(ticketToDelete.id);
      setTicketToDelete(null);
    } catch {
      // Error handled by mutation
    }
  };

  const tickets = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Support Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ticket Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            View, filter, track, and manage all your technical support requests
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-xs"
            title="Refresh tickets list"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            to="/tickets/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Ticket</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-10 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
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
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as Status | '');
                  setPage(1);
                }}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value as Priority | '');
                  setPage(1);
                }}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
            >
              Search
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Content Section */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm font-semibold text-slate-700">Loading your tickets...</p>
            <p className="text-xs text-slate-400">Fetching latest data from backend</p>
          </div>
        </div>
      ) : isError ? (
        <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center shadow-xs space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Failed to load tickets</h3>
            <p className="text-xs text-rose-600 max-w-md mx-auto">
              {(error as Error)?.message || 'An error occurred while connecting to the ticket API.'}
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
          <div className="h-16 w-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <TicketIcon className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              {hasActiveFilters ? 'No matching tickets found' : 'No tickets opened yet'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'Try adjusting your search terms, status filters, or priority selections.'
                : 'Need technical assistance or customer support? Create your first ticket now.'}
            </p>
          </div>
          <div>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
              >
                Clear all filters
              </button>
            ) : (
              <Link
                to="/tickets/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Create First Ticket</span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th scope="col" className="py-3.5 pl-6 pr-3">
                    Ticket Title
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
                  <th scope="col" className="px-3 py-3.5">
                    Created
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    Updated
                  </th>
                  <th scope="col" className="py-3.5 pl-3 pr-6 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    <td className="py-4 pl-6 pr-3">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors block max-w-sm truncate"
                        title={ticket.title}
                      >
                        {ticket.title}
                      </Link>
                      <p className="text-[11px] text-slate-400 font-mono truncate max-w-xs mt-0.5">
                        ID: {ticket.id.slice(0, 8)}...
                      </p>
                    </td>

                    <td className="px-3 py-4 text-slate-700 font-medium">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                        {ticket.category}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      <PriorityBadge priority={ticket.priority} size="sm" />
                    </td>

                    <td className="px-3 py-4">
                      <StatusBadge status={ticket.status} size="sm" />
                    </td>

                    <td className="px-3 py-4 text-slate-500 whitespace-nowrap">
                      {formatDate(ticket.createdAt)}
                    </td>

                    <td className="px-3 py-4 text-slate-500 whitespace-nowrap">
                      {formatDate(ticket.updatedAt)}
                    </td>

                    <td className="py-4 pl-3 pr-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/tickets/${ticket.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View ticket details"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setTicketToDelete({ id: ticket.id, title: ticket.title })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete ticket"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Card View */}
          <div className="md:hidden space-y-3">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2"
                    >
                      {ticket.title}
                    </Link>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">{ticket.category}</span>
                      <span>•</span>
                      <span>{formatDate(ticket.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setTicketToDelete({ id: ticket.id, title: ticket.title })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      aria-label="Delete ticket"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={ticket.priority} size="sm" />
                    <StatusBadge status={ticket.status} size="sm" />
                  </div>

                  <Link
                    to={`/tickets/${ticket.id}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>Details</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
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
                  className="ml-2 px-2 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
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

      {/* Delete Confirmation Modal */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Delete Ticket</h4>
                <p className="text-xs text-slate-500">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600">
              Are you sure you want to permanently delete ticket{' '}
              <strong className="text-slate-900">&quot;{ticketToDelete.title}&quot;</strong>?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setTicketToDelete(null)}
                disabled={deleteTicketMutation.isPending}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteTicketMutation.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm"
              >
                {deleteTicketMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
