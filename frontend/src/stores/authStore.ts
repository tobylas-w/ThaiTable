import { create } from 'zustand';
import { authService } from '../services/auth.service';

interface User {
  id: string;
  email: string;
  name_th: string;
  name_en: string;
  role: string;
  restaurant_id: string;
  phone?: string;
  isEmailVerified: boolean;
  emailVerifiedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
  restaurant?: {
    id: string;
    name_th: string;
    name_en: string;
  };
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name_th: string;
  name_en: string;
  phone?: string;
  role?: string;
  restaurant_id: string;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,

  // Actions
  login: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });

      const { user, accessToken, refreshToken } = await authService.login(email, password);

      set({
        isAuthenticated: true,
        user,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        loading: false,
        error: error.response?.data?.message || 'Login failed',
      });
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    try {
      set({ loading: true, error: null });

      const { user, accessToken, refreshToken } = await authService.register(data);

      set({
        isAuthenticated: true,
        user,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        loading: false,
        error: error.response?.data?.message || 'Registration failed',
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Ignore logout errors, just clear local state
      console.error('Logout error:', error);
    } finally {
      set({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
    }
  },

  setUser: (user: User | null) => {
    set({ user });
  },

  setAuthenticated: (authenticated: boolean) => {
    set({ isAuthenticated: authenticated, loading: false });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  refreshUser: async () => {
    try {
      if (authService.isAuthenticated()) {
        const user = await authService.getCurrentUser();
        set({ user });
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // Don't throw here, just log the error
    }
  },
}));

// Initialize auth state on app start
const initializeAuth = async () => {
  const { setUser, setAuthenticated, setLoading } = useAuthStore.getState();

  try {
    if (authService.isAuthenticated()) {
      const user = await authService.getCurrentUser();
      setUser(user);
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
    }
  } catch (error) {
    console.error('Auth initialization error:', error);
    setAuthenticated(false);
  } finally {
    setLoading(false);
  }
};

// Call initialization
initializeAuth();

export type { RegisterData, User };
