import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTicket, useUpdateTicket, useDeleteTicket } from '@/hooks/useTickets';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowLeft,
  Calendar,
  User as UserIcon,
  Tag,
  Loader2,
  AlertCircle,
  Trash2,
  Edit3,
  Check,
  Clock,
  Shield,
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '@/components/TicketBadges';
import { formatDate } from '@/lib/utils';
import { Status, Priority } from '@/types';
import { getErrorMessage } from '@/services/api';

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const { data: ticket, isLoading, isError, error, refetch } = useTicket(id || '');
  const updateTicketMutation = useUpdateTicket();
  const deleteTicketMutation = useDeleteTicket();

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('MEDIUM');
  const [editError, setEditError] = useState<string | null>(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Status updating indicator
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const startEditing = () => {
    if (!ticket) return;
    setEditTitle(ticket.title);
    setEditDescription(ticket.description);
    setEditCategory(ticket.category);
    setEditPriority(ticket.priority);
    setEditError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;
    setEditError(null);

    if (editTitle.trim().length < 3) {
      setEditError('Title must be at least 3 characters long');
      return;
    }
    if (editDescription.trim().length < 10) {
      setEditError('Description must be at least 10 characters long');
      return;
    }
    if (editCategory.trim().length < 2) {
      setEditError('Category must be at least 2 characters long');
      return;
    }

    try {
      await updateTicketMutation.mutateAsync({
        id: ticket.id,
        data: {
          title: editTitle.trim(),
          description: editDescription.trim(),
          category: editCategory.trim(),
          priority: editPriority,
        },
      });
      setIsEditing(false);
    } catch (err) {
      setEditError(getErrorMessage(err));
    }
  };

  const handleStatusChange = async (newStatus: Status) => {
    if (!ticket || ticket.status === newStatus) return;
    setIsUpdatingStatus(true);
    try {
      await updateTicketMutation.mutateAsync({
        id: ticket.id,
        data: { status: newStatus },
      });
    } catch {
      // Error handled by query/mutation state
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!ticket) return;
    try {
      await deleteTicketMutation.mutateAsync(ticket.id);
      navigate('/tickets', { replace: true });
    } catch {
      // Handled by delete mutation
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-700">Loading ticket details...</p>
      </div>
    );
  }

  if (isError || !ticket) {
    const message = error ? getErrorMessage(error) : 'Ticket could not be found or you do not have permission to view it.';
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Unable to view ticket</h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">{message}</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
          >
            Retry
          </button>
          <Link
            to="/tickets"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
          >
            Back to Tickets
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = currentUser?.id === ticket.userId;
  const isAdmin = currentUser?.role === 'ADMIN';
  const canModify = isOwner || isAdmin;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <Link
          to="/tickets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Tickets</span>
        </Link>

        {canModify && (
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                type="button"
                data-testid="ticket-edit-button"
                onClick={startEditing}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-colors"
              >
                <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                <span>Edit Ticket</span>
              </button>
            )}

            <button
              type="button"
              data-testid="ticket-delete-button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Ticket Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Ticket Title & Badges */}
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            {editError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="edit-title" className="text-xs font-bold text-slate-700 uppercase">
                Title
              </label>
              <input
                id="edit-title"
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-base font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="edit-category" className="text-xs font-bold text-slate-700 uppercase">
                  Category
                </label>
                <input
                  id="edit-category"
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="edit-priority" className="text-xs font-bold text-slate-700 uppercase">
                  Priority
                </label>
                <select
                  id="edit-priority"
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl bg-white"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="edit-desc" className="text-xs font-bold text-slate-700 uppercase">
                Description
              </label>
              <textarea
                id="edit-desc"
                rows={6}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={cancelEditing}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateTicketMutation.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
              >
                {updateTicketMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span data-testid="ticket-detail-status">
                  <StatusBadge status={ticket.status} size="md" />
                </span>
                <PriorityBadge priority={ticket.priority} size="md" />
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                Ticket ID: {ticket.id}
              </span>
            </div>

            <h1 data-testid="ticket-detail-title" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {ticket.title}
            </h1>
          </div>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-slate-100 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Tag className="h-3 w-3" /> Category
            </span>
            <p className="font-semibold text-slate-800">{ticket.category}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Created
            </span>
            <p className="font-semibold text-slate-800">{formatDate(ticket.createdAt)}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" /> Last Updated
            </span>
            <p className="font-semibold text-slate-800">{formatDate(ticket.updatedAt)}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <UserIcon className="h-3 w-3" /> Submitter
            </span>
            <p className="font-semibold text-slate-800 truncate" title={ticket.user?.name || 'User'}>
              {ticket.user?.name || (isOwner ? currentUser?.name : 'Ticket Owner')}
            </p>
          </div>
        </div>

        {/* Status Workflow Action Selector */}
        {canModify && (
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800">Ticket Status Workflow</span>
              <p className="text-[11px] text-slate-500">
                Update status as work progresses on this ticket
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(['OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map((s) => {
                const isActive = ticket.status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    data-testid={`ticket-status-${s.toLowerCase()}`}
                    onClick={() => handleStatusChange(s)}
                    disabled={isUpdatingStatus || isActive}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? s === 'OPEN'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : s === 'IN_PROGRESS'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {s === 'OPEN' ? 'Open' : s === 'IN_PROGRESS' ? 'In Progress' : 'Resolved'}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Ticket Description */}
        {!isEditing && (
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Description &amp; Reproduction Context
            </h3>
            <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-100 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
              {ticket.description}
            </div>
          </div>
        )}

        {/* Admin notice if viewed by admin */}
        {isAdmin && !isOwner && (
          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-700 flex items-center gap-2">
            <Shield className="h-4 w-4 shrink-0 text-purple-600" />
            <span>Viewing as System Administrator. You have permissions to inspect, update, and manage this ticket.</span>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Confirm Ticket Deletion</h4>
                <p className="text-xs text-slate-500">Irreversible operation</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600">
              Are you sure you want to delete <strong className="text-slate-900">&quot;{ticket.title}&quot;</strong>? This ticket and its complete history will be permanently deleted.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteTicketMutation.isPending}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="ticket-confirm-delete-button"
                onClick={handleDelete}
                disabled={deleteTicketMutation.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60"
              >
                {deleteTicketMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Yes, Delete Ticket</span>
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
