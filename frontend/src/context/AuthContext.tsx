import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { authService } from '@/services/auth.service';
import type { AuthContextType, SafeUser } from '@/types';
import { queryClient } from '@/lib/queryClient';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Refreshes the current user profile from GET /api/auth/me.
   */
  const refreshUser = useCallback(async (): Promise<SafeUser | null> => {
    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
      return user;
    } catch {
      setCurrentUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * On initial load or page refresh, verify existing session cookie or token.
   */
  useEffect(() => {
    refreshUser();

    // Listen for 401 unauthorized events dispatched by Axios interceptor
    const handleUnauthorized = () => {
      setCurrentUser(null);
      queryClient.clear();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [refreshUser]);

  /**
   * Logs in with email and password, setting user state and session.
   */
  const login = async (email: string, pass: string): Promise<SafeUser> => {
    setIsLoading(true);
    try {
      const { user } = await authService.login({ email, password: pass });
      setCurrentUser(user);
      queryClient.invalidateQueries();
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Registers a new user and automatically logs them into the session.
   */
  const register = async (
    name: string,
    email: string,
    pass: string,
  ): Promise<SafeUser> => {
    setIsLoading(true);
    try {
      // 1. Create account
      await authService.register({ name, email, password: pass });
      // 2. Automatically log in to establish cookie session
      const { user } = await authService.login({ email, password: pass });
      setCurrentUser(user);
      queryClient.invalidateQueries();
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logs out the user and clears all cached state.
   */
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setCurrentUser(null);
      queryClient.clear();
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to consume the authentication context throughout the application.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
