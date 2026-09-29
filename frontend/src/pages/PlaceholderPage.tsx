import { LucideIcon, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  phase: string;
}

export function PlaceholderPage({ title, description, icon: Icon, phase }: PlaceholderPageProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xs">
      <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
        <Icon className="h-7 w-7" />
      </div>
      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 mb-3">
        {phase}
      </span>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
      <p className="text-sm text-slate-500 mb-6">{description}</p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Overview</span>
      </Link>
    </div>
  );
}
