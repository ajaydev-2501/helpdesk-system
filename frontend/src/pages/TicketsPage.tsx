import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTickets, useDeleteTicket } from '@/hooks/useTickets';
import {
  Ticket as TicketIcon,
  PlusCircle,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
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
  const [limit] = useState(10);

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
    <div className="space-y-6 animate-fade-in pb-16">
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
            View, filter, track, and manage technical support requests
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-xs"
            title="Refresh tickets list"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            to="/tickets/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Ticket</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3">
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
              className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-600 transition-all bg-slate-50/40 focus:bg-white"
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
                className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-600"
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
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value as Priority | '');
                  setPage(1);
                }}
                className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-600"
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
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
            >
              Search
            </button>

            {hasActiveFilters && (
              <button
                type="button"
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
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <TicketIcon className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              {hasActiveFilters ? 'No matching tickets found' : 'No tickets opened yet'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'Try adjusting your search query or clear filters to see more results.'
                : 'Need technical assistance? Create your first ticket to get started.'}
            </p>
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Clear Filters
            </button>
          ) : (
            <Link
              to="/tickets/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create Your First Ticket</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 sm:p-5 hover:bg-slate-50/70 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate"
                    >
                      {ticket.title}
                    </Link>
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

                  <div className="flex items-center gap-1 pl-2 border-l border-slate-100">
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      View Details
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

      {/* Delete Confirmation Modal */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Support Ticket</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-900 font-semibold">"{ticketToDelete.title}"</strong>?
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setTicketToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteTicketMutation.isPending}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm flex items-center gap-1.5"
              >
                {deleteTicketMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                <span>Delete Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
