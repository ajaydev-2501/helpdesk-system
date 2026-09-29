import {
  Server,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Terminal,
  Activity,
  ArrowRight,
  Ticket as TicketIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSystemStatus } from '@/hooks/useSystemStatus';
import { useAuth } from '@/hooks/useAuth';

export function HomePage() {
  const { data: systemInfo, isLoading, isError, refetch, isFetching } = useSystemStatus();
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-12 text-white shadow-xl shadow-slate-950/10 border border-slate-800/80">
        {/* Ambient Glow & Radial Lighting */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/15 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/15 border border-blue-400/20 text-blue-300 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Helpdesk Support System Online
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15]">
            Modern Technical Support &amp;{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              Ticket Management
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
            Streamlined enterprise support platform featuring real-time ticket tracking,
            role-based admin access, and comprehensive REST API services built with React 19 &amp; NestJS.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all duration-200"
              >
                <TicketIcon className="h-4 w-4" />
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all duration-200"
              >
                <span>Get Started — Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            <a
              href="http://localhost:5000/api/docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all duration-200 border border-white/10"
            >
              <span>Explore Swagger API Docs</span>
              <ExternalLink className="h-4 w-4 text-blue-300" />
            </a>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/60 backdrop-blur-sm transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin text-blue-400' : ''}`} />
              <span>Ping Backend API</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backend Communication Status Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Backend API Health Status</h2>
              <p className="text-xs text-slate-500">Live API communication status between React &amp; NestJS backend</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
                isLoading
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : isError
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
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
                ? 'Checking Connection...'
                : isError
                ? 'API Offline'
                : 'API Connected & Responding'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-medium text-[11px]">Configured API Base URL:</span>
            <p className="font-mono font-semibold text-slate-800 break-all">
              {import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-medium text-[11px]">API Service Name:</span>
            <p className="font-mono font-semibold text-slate-800">
              {systemInfo?.name || (isLoading ? 'Checking...' : 'N/A')}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-medium text-[11px]">Swagger OpenAPI Endpoint:</span>
            <p className="font-mono font-semibold text-blue-600">
              http://localhost:5000/api/docs
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Frontend Pillar */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-blue-200 hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Frontend Stack</h3>
              <span className="text-xs text-slate-500 font-medium">React 19 &amp; Vite</span>
            </div>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>React 19 with strict TypeScript</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Tailwind CSS with responsive layout</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>React Router v7 client navigation</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>TanStack Query &amp; Axios API client</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>React Hook Form &amp; Zod validation</span>
            </li>
          </ul>
        </div>

        {/* Backend Pillar */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Backend Architecture</h3>
              <span className="text-xs text-slate-500 font-medium">NestJS &amp; Prisma ORM</span>
            </div>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>NestJS with strict TypeScript modules</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Prisma ORM with SQLite / Postgres</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Global prefix (/api) &amp; Swagger docs</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Global ValidationPipe &amp; CORS protection</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>JWT &amp; Passport Auth Guard system</span>
            </li>
          </ul>
        </div>

        {/* Testing Pillar */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-purple-200 hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Testing &amp; Tooling</h3>
              <span className="text-xs text-slate-500 font-medium">Playwright &amp; Jest</span>
            </div>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Playwright for End-to-End E2E suite</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Jest for backend unit testing</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Clean workspace root npm scripts</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Path aliases (@/*) across monorepo</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Role-Based Access Control (RBAC)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Development Commands Reference Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Workspace CLI Commands</h3>
            <p className="text-xs text-slate-500">Essential npm commands for building and testing the system</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-100 flex flex-col justify-between space-y-2">
            <span className="text-emerald-400 font-semibold">npm run dev</span>
            <span className="text-[11px] text-slate-400 font-sans">Runs backend &amp; frontend simultaneously</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-100 flex flex-col justify-between space-y-2">
            <span className="text-cyan-400 font-semibold">npm run build</span>
            <span className="text-[11px] text-slate-400 font-sans">Compiles production bundles</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-100 flex flex-col justify-between space-y-2">
            <span className="text-amber-400 font-semibold">npm run test</span>
            <span className="text-[11px] text-slate-400 font-sans">Runs NestJS unit tests</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-100 flex flex-col justify-between space-y-2">
            <span className="text-purple-400 font-semibold">npm run test:e2e</span>
            <span className="text-[11px] text-slate-400 font-sans">Runs Playwright E2E browser tests</span>
          </div>
        </div>
      </div>
    </div>
  );
}
