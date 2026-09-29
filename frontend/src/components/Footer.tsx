import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span>Mini Helpdesk &amp; Support Ticket System</span>
          <span>•</span>
          <span>Technical Assessment Foundation</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            Built with React 19 &amp; NestJS
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 inline ml-0.5" />
          </span>
          <span>•</span>
          <a
            href="http://localhost:5000/api/docs"
            target="_blank"
            rel="noreferrer"
            className="hover:text-blue-600 underline font-medium transition-colors"
          >
            Swagger Docs
          </a>
        </div>
      </div>
    </footer>
  );
}
