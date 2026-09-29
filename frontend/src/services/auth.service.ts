import { apiClient, AUTH_TOKEN_KEY } from './api';
import type { AuthResponse, SafeUser } from '@/types';
import type { LoginFormData } from '@/lib/validations/auth';

export const authService = {
  /**
   * Submits user credentials to POST /api/auth/login.
   * Stores the returned token in localStorage and receives the HTTP-only cookie.
   */
  login: async (credentials: LoginFormData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    if (response.data.accessToken) {
      localStorage.setItem(AUTH_TOKEN_KEY, response.data.accessToken);
    }
    return response.data;
  },

  /**
   * Registers a new user account through POST /api/auth/register.
   */
  register: async (data: {
    name: string;
    email: string;
    password: string;
  }): Promise<SafeUser> => {
    const response = await apiClient.post<SafeUser>('/auth/register', data);
    return response.data;
  },

  /**
   * Fetches the current authenticated user's profile from GET /api/auth/me.
   */
  getCurrentUser: async (): Promise<SafeUser> => {
    const response = await apiClient.get<SafeUser>('/auth/me');
    return response.data;
  },

  /**
   * Logs out the user by clearing the backend session cookie and local storage.
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  },
};
