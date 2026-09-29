import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  UserPlus,
  LifeBuoy,
} from 'lucide-react';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/services/api';

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const currentPassword = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);
    try {
      await registerAuth(data.name, data.email, data.password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setApiError(message);
    }
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
            <UserPlus className="h-4 w-4 text-blue-600" />
            <span>Join Support Portal</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Create an account
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
              Sign up to open, track, and manage customer support tickets
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-900/5 p-6 sm:p-8 space-y-6">
          {/* API Error Alert */}
          {apiError && (
            <div
              data-testid="register-error-alert"
              className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800 animate-shake"
              role="alert"
            >
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{apiError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Full Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="block text-xs font-semibold text-slate-700 tracking-wide"
              >
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  id="name"
                  data-testid="register-name-input"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  disabled={isSubmitting}
                  {...register('name')}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all duration-200 focus:outline-none ${
                    errors.name
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15 bg-rose-50/20'
                      : 'border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 bg-slate-50/40 focus:bg-white text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5 mt-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{errors.name.message}</span>
                </p>
              )}
            </div>

            {/* Email Address */}
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
                  data-testid="register-email-input"
                  type="email"
                  autoComplete="email"
                  placeholder="jane.doe@example.com"
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

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 tracking-wide"
              >
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  data-testid="register-password-input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
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
              {currentPassword && currentPassword.length >= 8 && (
                <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Password meets length requirement</span>
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-slate-700 tracking-wide"
              >
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="confirmPassword"
                  data-testid="register-confirm-password-input"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-type your password"
                  disabled={isSubmitting}
                  {...register('confirmPassword')}
                  className={`w-full pl-10 pr-11 py-2.5 rounded-xl text-sm border transition-all duration-200 focus:outline-none ${
                    errors.confirmPassword
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15 bg-rose-50/20'
                      : 'border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 bg-slate-50/40 focus:bg-white text-slate-900 placeholder:text-slate-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:text-blue-600 transition-colors focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5 mt-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{errors.confirmPassword.message}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              data-testid="register-submit-button"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer Login Link */}
          <div className="pt-2 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline underline-offset-2 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
            <span>Safe &amp; Secure Account Registration</span>
          </p>
        </div>
      </div>
    </div>
  );
}
