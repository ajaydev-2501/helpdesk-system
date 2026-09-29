import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  User as UserIcon,
  CheckCircle2,
  Sparkles,
  Zap,
  LockKeyhole,
  Headphones,
  LifeBuoy,
} from 'lucide-react';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/services/api';

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeDemo, setActiveDemo] = useState<'admin' | 'user' | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine redirection target (default to /dashboard)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setApiError(message);
    }
  };

  // Pre-fill demo accounts for reviewer testing
  const fillDemo = (role: 'admin' | 'user', email: string, pass: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
    setActiveDemo(role);
    setApiError(null);
  };

  return (
    <div className="relative min-h-[78vh] flex flex-col justify-center items-center py-6 sm:py-10">
      {/* Background Subtle Ambient Lighting Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-400/10 via-indigo-500/10 to-purple-400/5 blur-3xl rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-4 right-1/4 w-80 h-80 bg-blue-500/5 blur-3xl rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-fade-in">
        {/* Brand Home Navigation */}
        <div className="flex justify-center">
          <Link to="/" className="flex items-center gap-2.5 group transition-transform hover:scale-105 duration-200">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <LifeBuoy className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              Mini<span className="text-blue-600">Helpdesk</span>
            </span>
          </Link>
        </div>

        {/* Header Title Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-xs">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span>Helpdesk Support Portal</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign in to your account
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
              Access your ticket management console and support workspace
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-900/5 p-6 sm:p-8 space-y-6">
          {/* Quick Demo Autofill selector at top of card */}
          <div className="bg-slate-50 p-1.5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between px-2 py-1 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-indigo-500" />
                Quick Test Autofill
              </span>
              <span className="text-[10px] text-slate-400 font-medium">1-Click Test</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => fillDemo('admin', 'admin@helpdesk.local', 'Admin@123456')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                  activeDemo === 'admin'
                    ? 'bg-white text-indigo-700 shadow-sm border border-indigo-200 ring-1 ring-indigo-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                {activeDemo === 'admin' ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                ) : (
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                )}
                <span>Admin Demo</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('user', 'user@helpdesk.local', 'User@123456')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                  activeDemo === 'user'
                    ? 'bg-white text-blue-700 shadow-sm border border-blue-200 ring-1 ring-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                {activeDemo === 'user' ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                ) : (
                  <UserIcon className="h-3.5 w-3.5 text-blue-500" />
                )}
                <span>Customer Demo</span>
              </button>
            </div>
          </div>

          {/* API Error Alert */}
          {apiError && (
            <div
              data-testid="login-error-alert"
              className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800 animate-shake"
              role="alert"
            >
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{apiError}</div>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 tracking-wide"
              >
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  data-testid="login-email-input"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  disabled={isSubmitting}
                  {...register('email')}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all duration-200 focus:outline-none ${
                    errors.email
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15 bg-rose-50/20'
                      : 'border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 bg-slate-50/40 focus:bg-white text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5 mt-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-700 tracking-wide"
                >
                  Password
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  data-testid="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  {...register('password')}
                  className={`w-full pl-10 pr-11 py-2.5 rounded-xl text-sm border transition-all duration-200 focus:outline-none ${
                    errors.password
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15 bg-rose-50/20'
                      : 'border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 bg-slate-50/40 focus:bg-white text-slate-900 placeholder:text-slate-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:text-blue-600 transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5 mt-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              data-testid="login-submit-button"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer Register Link */}
          <div className="pt-2 text-center">
            <p className="text-xs text-slate-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline underline-offset-2 transition-colors"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Feature Highlights Grid beneath the card */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-white/70 border border-slate-200/60 shadow-xs">
            <Zap className="h-4 w-4 text-blue-600 mb-1" />
            <span className="text-[11px] font-semibold text-slate-800">Fast Triage</span>
            <span className="text-[10px] text-slate-500">Real-time queues</span>
          </div>

          <div className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-white/70 border border-slate-200/60 shadow-xs">
            <LockKeyhole className="h-4 w-4 text-indigo-600 mb-1" />
            <span className="text-[11px] font-semibold text-slate-800">Secure RBAC</span>
            <span className="text-[10px] text-slate-500">Role permissions</span>
          </div>

          <div className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-white/70 border border-slate-200/60 shadow-xs">
            <Headphones className="h-4 w-4 text-purple-600 mb-1" />
            <span className="text-[11px] font-semibold text-slate-800">24/7 Support</span>
            <span className="text-[10px] text-slate-500">Instant routing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
