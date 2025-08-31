import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Authentication service methods
export const authService = {
  // Core authentication
  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user } = response.data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    return { user, accessToken, refreshToken };
  },

  async register(data: {
    email: string;
    password: string;
    name_th: string;
    name_en: string;
    phone?: string;
    role?: string;
    restaurant_id: string;
  }) {
    const response = await api.post('/auth/register', data);
    const { accessToken, refreshToken, user } = response.data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    return { user, accessToken, refreshToken };
  },

  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');

    try {
      await api.post('/auth/logout', { refreshToken });
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');

    const response = await api.post('/auth/refresh', { refreshToken });
    const { accessToken } = response.data.data;

    localStorage.setItem('accessToken', accessToken);
    return accessToken;
  },

  // Password reset
  async forgotPassword(email: string) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string) {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },

  // Email verification
  async sendVerificationEmail(email: string) {
    const response = await api.post('/auth/send-verification', { email });
    return response.data;
  },

  async verifyEmail(token: string) {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  // User profile
  async getCurrentUser() {
    const response = await api.get('/auth/profile');
    return response.data.data;
  },

  async updateProfile(data: {
    name_th?: string;
    name_en?: string;
    phone?: string;
  }) {
    const response = await api.put('/auth/profile', data);
    return response.data.data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Utility methods
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },

  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },
};

// Export the api instance for other services to use
export { api };

export default authService;
