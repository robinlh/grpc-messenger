import { create } from 'zustand';
import { AuthState } from '../types/auth';
import { AuthService } from '../services/auth';

interface AuthStore extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  login: async (username: string, password: string) => {
    try {
      const authState = await AuthService.login(username, password);
      set(authState);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  logout: () => {
    AuthService.logout();
    set({
      token: null,
      user: null,
      isAuthenticated: false
    });
  },

  initializeAuth: () => {
    const storedAuth = AuthService.getStoredAuth();
    set(storedAuth);
  }
}));