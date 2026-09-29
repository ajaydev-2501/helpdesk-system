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
  PlusCircle,
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
  const selectedCategory = watch('category');

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

      setSuccessMessage('Ticket submitted successfully! Redirecting...');
      setTimeout(() => {
        navigate(`/tickets/${created.id}`);
      }, 700);
    } catch (err) {
      setApiError(getErrorMessage(err));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Navigation & Header */}
      <div className="space-y-3">
        <Link
          to="/tickets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Tickets</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <PlusCircle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Create Support Ticket
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Submit a technical support request or issue to the helpdesk queue
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-6 sm:p-8 space-y-6">
        {/* Success Alert */}
        {successMessage && (
          <div
            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs sm:text-sm text-emerald-800 animate-fade-in"
            role="alert"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* API Error Alert */}
        {apiError && (
          <div
            className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs sm:text-sm text-rose-800 animate-shake"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{apiError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* Ticket Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="title" className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                Ticket Title <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
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
              className={`w-full px-4 py-3 rounded-xl text-sm border transition-all duration-200 focus:outline-none ${
                errors.title
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15 bg-rose-50/20'
                  : 'border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 bg-slate-50/40 focus:bg-white text-slate-900 placeholder:text-slate-400'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5 mt-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.title.message}</span>
              </p>
            )}
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                placeholder="Select or type category..."
                disabled={isSubmitting || createTicketMutation.isPending}
                {...register('category')}
                className={`w-full px-4 py-3 rounded-xl text-sm border transition-all duration-200 focus:outline-none ${
                  errors.category
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15 bg-rose-50/20'
                    : 'border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 bg-slate-50/40 focus:bg-white text-slate-900 placeholder:text-slate-400'
                }`}
              />
              <datalist id="category-suggestions">
                {CATEGORY_SUGGESTIONS.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>

              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {CATEGORY_SUGGESTIONS.map((cat) => {
                  const isCatSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setValue('category', cat, { shouldValidate: true })}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all duration-200 ${
                        isCatSelected
                          ? 'border-blue-300 bg-blue-50 text-blue-700 font-semibold'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {errors.category && (
                <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5 mt-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{errors.category.message}</span>
                </p>
              )}
            </div>

            {/* Priority Selector */}
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
                      className={`cursor-pointer border rounded-2xl p-3 text-center flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                        isSelected
                          ? level === 'HIGH'
                            ? 'border-rose-300 bg-rose-50/80 text-rose-900 ring-2 ring-rose-500/20 shadow-xs'
                            : level === 'MEDIUM'
                            ? 'border-sky-300 bg-sky-50/80 text-sky-900 ring-2 ring-sky-500/20 shadow-xs'
                            : 'border-slate-300 bg-slate-100 text-slate-900 ring-2 ring-slate-400/20 shadow-xs'
                          : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/70 text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        value={level}
                        {...register('priority')}
                        className="sr-only"
                      />
                      <span className="text-xs font-extrabold capitalize">{level.toLowerCase()}</span>
                      <span className="text-[10px] font-medium text-slate-400">
                        {level === 'HIGH' ? 'Critical' : level === 'MEDIUM' ? 'Standard' : 'Minor'}
                      </span>
                    </label>
                  );
                })}
              </div>
              {errors.priority && (
                <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5 mt-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
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
              <span className="text-[11px] text-slate-400 font-medium">
                {descriptionValue?.length || 0}/5000 (min 10)
              </span>
            </div>
            <textarea
              id="description"
              data-testid="ticket-description-input"
              rows={5}
              placeholder="Describe the issue in detail, including steps to reproduce, error messages, and system impact..."
              disabled={isSubmitting || createTicketMutation.isPending}
              {...register('description')}
              className={`w-full p-4 rounded-2xl text-sm border transition-all duration-200 focus:outline-none ${
                errors.description
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15 bg-rose-50/20'
                  : 'border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 bg-slate-50/40 focus:bg-white text-slate-900 placeholder:text-slate-400'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5 mt-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.description.message}</span>
              </p>
            )}
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100">
            <Link
              to="/tickets"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-center"
            >
              Cancel
            </Link>

            <button
              type="submit"
              data-testid="ticket-submit-button"
              disabled={isSubmitting || createTicketMutation.isPending}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              {isSubmitting || createTicketMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting Ticket...</span>
                </>
              ) : (
                <>
                  <span>Submit Support Ticket</span>
                  <Send className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
