import axios, { AxiosInstance, AxiosError } from 'axios';
import { env } from '../env';
import { getAccessToken, getRefreshToken, setAccessToken, clearTokens, getCompanyId } from '../cookies';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${env.API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token and company filter
apiClient.interceptors.request.use(
  (config) => {
    // Get token from cookies and add to Authorization header
    if (typeof window !== 'undefined') {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // For GET requests to company-scoped endpoints, add company_id filter
      const COMPANY_SCOPED_PATHS = new Set(['/users', '/accounts', '/contacts', '/deals', '/tasks']);
      
      const needsCompanyFilter = (url: string | undefined): boolean => {
        if (!url) return false;
        try {
          const pathname = new URL(url, 'http://dummy').pathname;
          const firstSegment = pathname.split('/').filter(Boolean)[0];
          return COMPANY_SCOPED_PATHS.has(`/${firstSegment}`);
        } catch {
          // Fallback to simple string matching
          return COMPANY_SCOPED_PATHS.has(url.split('?')[0].split('/')[1] || '');
        }
      };

      if (config.method === 'get' && needsCompanyFilter(config.url)) {
        const companyId = getCompanyId();
        if (companyId) {
          // Add company_id as query parameter
          const separator = config.url?.includes('?') ? '&' : '?';
          config.url = `${config.url}${separator}company_id=${companyId}`;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and automatic token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh if the request was to the refresh endpoint itself
      const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh');
      if (isRefreshEndpoint) {
        // Refresh token is invalid, clear everything and redirect to login
        clearTokens();
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        if (typeof window !== 'undefined' && !currentPath.includes('/login')) {
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
        return Promise.reject(error);
      }
      
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${env.API_BASE_URL}/api/auth/refresh`, {
            refreshToken,
          });
          
          if (response.data.success) {
            // Update access token
            setAccessToken(response.data.data.accessToken);
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        clearTokens();
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        if (typeof window !== 'undefined' && !currentPath.includes('/login')) {
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
        return Promise.reject(refreshError);
      }
      
      // No refresh token available, redirect to login
      clearTokens();
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      if (typeof window !== 'undefined' && !currentPath.includes('/login')) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

