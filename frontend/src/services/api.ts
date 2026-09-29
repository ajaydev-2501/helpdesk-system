import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { HealthInfo, SystemInfo } from '@/types';

export const AUTH_TOKEN_KEY = 'auth_token';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true, // Enables HTTP-only cookies transmission
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach Bearer token and sanitize duplicate /api prefixes
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // If the request path begins with /api/ and baseURL already ends with /api, normalize it
    if (config.url?.startsWith('/api/')) {
      config.url = config.url.replace(/^\/api/, '');
    }

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response Interceptor: Uniform error formatting & 401 session expiration handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const originalRequest = error.config;

    // If unauthorized on protected routes (excluding login/register attempts)
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register')
    ) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    return Promise.reject(error);
  },
);

/**
 * Extracts a user-friendly error message from any caught API exception.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data) {
      if (Array.isArray(data.message)) {
        return data.message.join('. ');
      }
      if (typeof data.message === 'string') {
        return data.message;
      }
      if (typeof data.error === 'string') {
        return data.error;
      }
    }
    if (error.message === 'Network Error') {
      return 'Cannot reach the backend server. Please verify the API is running.';
    }
    return error.message || 'An error occurred during communication.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred.';
}

// System API Service
export const systemService = {
  getSystemInfo: async (): Promise<SystemInfo> => {
    const response = await apiClient.get<SystemInfo>('/');
    return response.data;
  },

  getHealth: async (): Promise<HealthInfo> => {
    const response = await apiClient.get<HealthInfo>('/health');
    return response.data;
  },
};
