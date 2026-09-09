import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi, register as registerApi } from '../api/auth';
import { useToast } from './ToastContext';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AUTH_TOKEN_KEY = 'fluxshare-token';
const AUTH_USER_KEY = 'fluxshare-user';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const storedUser = localStorage.getItem(AUTH_USER_KEY);

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        // Corrupted stored data — clear it
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const persistSession = useCallback(
    (newToken: string, newUser: AuthUser) => {
      localStorage.setItem(AUTH_TOKEN_KEY, newToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
    },
    []
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await loginApi(email, password);
      const newUser: AuthUser = {
        id: '', // user id not returned by login; we'll use token decode later if needed
        email,
      };
      persistSession(response.token, newUser);
      showToast('success', 'Logged in successfully');
      navigate('/');
    },
    [persistSession, showToast, navigate]
  );

  const register = useCallback(
    async (email: string, password: string) => {
      await registerApi(email, password);
      showToast('success', 'Registration successful! Please log in.');
      navigate('/login');
    },
    [showToast, navigate]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setToken(null);
    setUser(null);
    showToast('info', 'Logged out successfully');
    navigate('/login');
  }, [showToast, navigate]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

/**
 * Returns true if the user is authenticated and NOT on the login page.
 * Used to redirect authenticated users away from /login.
 */
export function useAuthRedirect() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return null;
}
