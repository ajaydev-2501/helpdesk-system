import {
  Server,
  Layers,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Terminal,
  Activity,
} from 'lucide-react';
import { useSystemStatus } from '@/hooks/useSystemStatus';

export function HomePage() {
  const { data: systemInfo, isLoading, isError, refetch, isFetching } = useSystemStatus();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-8 sm:p-10 text-white shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/30 border border-blue-400/30 text-blue-100 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Project Initialized &amp; Ready
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Mini Helpdesk &amp; Support Ticket System
          </h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed max-w-2xl">
            Clean enterprise architecture featuring a high-performance React 19 frontend,
            modular NestJS backend, Prisma ORM, and comprehensive testing infrastructure.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="http://localhost:5000/api/docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-semibold hover:bg-blue-50 transition-colors shadow-sm"
            >
              <span>Explore Swagger API Docs</span>
              <ExternalLink className="h-4 w-4 text-blue-600" />
            </a>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/60 hover:bg-blue-600/80 text-white text-sm font-medium border border-blue-400/30 backdrop-blur-sm transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              <span>Ping Backend API</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backend Connectivity Status Card */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Backend Communication Status</h2>
              <p className="text-xs text-slate-500">Live communication check between React and NestJS API</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                isLoading
                  ? 'bg-amber-100 text-amber-800'
                  : isError
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isLoading
                    ? 'bg-amber-500 animate-pulse'
                    : isError
                    ? 'bg-rose-500'
                    : 'bg-emerald-500'
                }`}
              />
              {isLoading
                ? 'Testing Connection...'
                : isError
                ? 'Connection Failed'
                : 'API Connected & Responding'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-500 font-medium">Configured API Base URL:</span>
            <p className="font-mono font-semibold text-slate-800 mt-1 break-all">
              {import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-500 font-medium">API Response Name:</span>
            <p className="font-mono font-semibold text-slate-800 mt-1">
              {systemInfo?.name || (isLoading ? 'Waiting...' : 'N/A')}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-500 font-medium">Swagger Endpoint:</span>
            <p className="font-mono font-semibold text-blue-600 mt-1">
              /api/docs
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Frontend Pillar */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-blue-200 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Frontend Stack</h3>
              <span className="text-xs text-slate-500">React 19 &amp; Vite</span>
            </div>
          </div>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>React 19 with strict TypeScript</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Tailwind CSS with responsive layout</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>React Router v7 client navigation</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>TanStack Query &amp; configured Axios</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>React Hook Form &amp; Zod validation</span>
            </li>
          </ul>
        </div>

        {/* Backend Pillar */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Backend Stack</h3>
              <span className="text-xs text-slate-500">NestJS &amp; TypeScript</span>
            </div>
          </div>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>NestJS with strict TypeScript &amp; aliases</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Prisma ORM &amp; PostgreSQL schemas</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Global prefix (/api) &amp; Swagger (/api/docs)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Global ValidationPipe &amp; CORS enabled</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>JWT &amp; Passport authentication modules</span>
            </li>
          </ul>
        </div>

        {/* Testing Pillar */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-purple-200 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Testing &amp; Tooling</h3>
              <span className="text-xs text-slate-500">Playwright &amp; Jest</span>
            </div>
          </div>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Playwright configured for E2E tests</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Jest for backend unit and e2e testing</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Clean monorepo root npm commands</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Path aliases (@/*) configured across apps</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Zero business logic implemented (Phase 1)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Useful Commands Reference Card */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Root Development Commands</h3>
            <p className="text-xs text-slate-500">Convenient commands to operate the entire workspace</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-900 text-slate-100 flex flex-col justify-between">
            <span className="text-emerald-400 font-semibold mb-1">npm run dev</span>
            <span className="text-[11px] text-slate-400 font-sans">Runs backend &amp; frontend together</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 text-slate-100 flex flex-col justify-between">
            <span className="text-cyan-400 font-semibold mb-1">npm run build</span>
            <span className="text-[11px] text-slate-400 font-sans">Compiles backend &amp; frontend bundles</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 text-slate-100 flex flex-col justify-between">
            <span className="text-amber-400 font-semibold mb-1">npm run test</span>
            <span className="text-[11px] text-slate-400 font-sans">Runs backend Jest tests</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 text-slate-100 flex flex-col justify-between">
            <span className="text-purple-400 font-semibold mb-1">npm run test:e2e</span>
            <span className="text-[11px] text-slate-400 font-sans">Runs Playwright E2E suite</span>
          </div>
        </div>
      </div>
    </div>
  );
}
