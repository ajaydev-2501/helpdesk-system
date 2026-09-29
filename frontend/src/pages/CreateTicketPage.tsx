import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateTicket } from '@/hooks/useTickets';
import { createTicketSchema, type CreateTicketFormData } from '@/lib/validations/ticket';
import { getErrorMessage } from '@/services/api';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Send,
  HelpCircle,
} from 'lucide-react';

const CATEGORY_SUGGESTIONS = [
  'Technical Support',
  'Billing & Invoicing',
  'Account & Access',
  'Feature Request',
  'General Inquiry',
];

export function CreateTicketPage() {
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const createTicketMutation = useCreateTicket();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateTicketFormData>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      priority: 'MEDIUM',
    },
  });

  const selectedPriority = watch('priority');
  const titleValue = watch('title');
  const descriptionValue = watch('description');

  const onSubmit = async (data: CreateTicketFormData) => {
    setApiError(null);
    setSuccessMessage(null);

    try {
      const created = await createTicketMutation.mutateAsync({
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
      });

      setSuccessMessage('Ticket created successfully! Redirecting...');
      setTimeout(() => {
        navigate(`/tickets/${created.id}`);
      }, 700);
    } catch (err) {
      setApiError(getErrorMessage(err));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Navigation & Header */}
      <div className="space-y-2">
        <Link
          to="/tickets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Tickets</span>
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Support Ticket
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Submit a new technical request or issue to the helpdesk support team
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/40 p-6 sm:p-8 space-y-6">
        {/* Success Alert */}
        {successMessage && (
          <div
            className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs sm:text-sm text-emerald-800 animate-fade-in"
            role="alert"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* API Error Alert */}
        {apiError && (
          <div
            className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs sm:text-sm text-rose-800 animate-shake"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{apiError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* Ticket Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="title" className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                Ticket Title <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {titleValue?.length || 0}/150
              </span>
            </div>
            <input
              id="title"
              data-testid="ticket-title-input"
              type="text"
              placeholder="e.g. Production API latency spiked above 2 seconds"
              disabled={isSubmitting || createTicketMutation.isPending}
              {...register('title')}
              className={`w-full px-4 py-2.5 rounded-xl text-sm border transition-colors focus:outline-none focus:ring-2 ${
                errors.title
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.title.message}</span>
              </p>
            )}
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label htmlFor="category" className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                Category <span className="text-rose-500">*</span>
              </label>
              <input
                id="category"
                data-testid="ticket-category-input"
                type="text"
                list="category-suggestions"
                placeholder="Select or enter category..."
                disabled={isSubmitting || createTicketMutation.isPending}
                {...register('category')}
                className={`w-full px-4 py-2.5 rounded-xl text-sm border transition-colors focus:outline-none focus:ring-2 ${
                  errors.category
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white'
                }`}
              />
              <datalist id="category-suggestions">
                {CATEGORY_SUGGESTIONS.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {CATEGORY_SUGGESTIONS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setValue('category', cat, { shouldValidate: true })}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {errors.category && (
                <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors.category.message}</span>
                </p>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label htmlFor="priority" className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                Priority Level <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map((level) => {
                  const isSelected = selectedPriority === level;
                  return (
                    <label
                      key={level}
                      className={`cursor-pointer border rounded-xl p-2.5 text-center flex flex-col items-center justify-center gap-1 transition-all ${
                        isSelected
                          ? level === 'HIGH'
                            ? 'border-rose-500 bg-rose-50/80 text-rose-800 ring-2 ring-rose-500/20'
                            : level === 'MEDIUM'
                            ? 'border-sky-500 bg-sky-50/80 text-sky-800 ring-2 ring-sky-500/20'
                            : 'border-slate-500 bg-slate-100 text-slate-800 ring-2 ring-slate-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        value={level}
                        {...register('priority')}
                        className="sr-only"
                      />
                      <span className="text-xs font-bold capitalize">{level.toLowerCase()}</span>
                      <span className="text-[10px] text-slate-400">
                        {level === 'HIGH' ? 'Critical' : level === 'MEDIUM' ? 'Standard' : 'Minor'}
                      </span>
                    </label>
                  );
                })}
              </div>
              {errors.priority && (
                <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors.priority.message}</span>
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="description" className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {descriptionValue?.length || 0}/5000 (min 10)
              </span>
            </div>
            <textarea
              id="description"
              data-testid="ticket-description-input"
              rows={6}
              placeholder="Provide a detailed explanation of the issue, error codes, steps to reproduce, or relevant links..."
              disabled={isSubmitting || createTicketMutation.isPending}
              {...register('description')}
              className={`w-full px-4 py-3 rounded-xl text-sm border transition-colors focus:outline-none focus:ring-2 resize-y ${
                errors.description
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.description.message}</span>
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Tickets are initialized with status <strong>Open</strong></span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Link
                to="/tickets"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 text-center transition-colors"
              >
                Cancel
              </Link>

              <button
                type="submit"
                data-testid="ticket-submit-button"
                disabled={isSubmitting || createTicketMutation.isPending}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 transition-all shadow-md shadow-blue-500/25"
              >
                {isSubmitting || createTicketMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting ticket...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit Ticket</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
