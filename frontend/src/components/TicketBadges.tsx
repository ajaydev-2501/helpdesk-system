import { Priority, Status } from '@/types';
import { AlertTriangle, Clock, CheckCircle2, ArrowUpCircle, MinusCircle, ArrowDownCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const isSm = size === 'sm';
  const sizeClasses = isSm
    ? 'px-2.5 py-0.5 text-xs font-semibold'
    : 'px-3 py-1 text-sm font-semibold';
  const iconSize = isSm ? 'h-3.5 w-3.5' : 'h-4 w-4';

  switch (status) {
    case 'OPEN':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 ${sizeClasses}`}
        >
          <Clock className={iconSize} />
          <span>Open</span>
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 ${sizeClasses}`}
        >
          <AlertTriangle className={iconSize} />
          <span>In Progress</span>
        </span>
      );
    case 'RESOLVED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses}`}
        >
          <CheckCircle2 className={iconSize} />
          <span>Resolved</span>
        </span>
      );
  }
}

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

export function PriorityBadge({ priority, size = 'sm' }: PriorityBadgeProps) {
  const isSm = size === 'sm';
  const sizeClasses = isSm
    ? 'px-2 py-0.5 text-xs font-medium'
    : 'px-2.5 py-1 text-sm font-medium';
  const iconSize = isSm ? 'h-3 w-3' : 'h-3.5 w-3.5';

  switch (priority) {
    case 'LOW':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}
        >
          <ArrowDownCircle className={iconSize} />
          <span>Low</span>
        </span>
      );
    case 'MEDIUM':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-md bg-sky-50 text-sky-700 border border-sky-200 ${sizeClasses}`}
        >
          <MinusCircle className={iconSize} />
          <span>Medium</span>
        </span>
      );
    case 'HIGH':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}
        >
          <ArrowUpCircle className={iconSize} />
          <span>High</span>
        </span>
      );
  }
}
