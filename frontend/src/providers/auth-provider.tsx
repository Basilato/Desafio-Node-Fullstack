'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  clearSession,
  login as apiLogin,
  me as apiMe,
  persistSession,
  readStoredUser,
  register as apiRegister,
  type LoggedUser,
  type LoginResponse,
  type RegisterData,
} from '@/lib/api/auth';
import {
  getStoredToken,
  UNAUTHORIZED_EVENT,
} from '@/lib/api/http';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthContextValue {
  user: LoggedUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  register: (data: RegisterData) => Promise<LoginResponse>;
  logout: () => void;
  refreshUser: () => Promise<LoggedUser | null>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function getInitials(user: LoggedUser | null | undefined): string {
  if (!user?.name) return 'TA';
  return initialsOf(user.name);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const [user, setUser] = React.useState<LoggedUser | null>(null);
  const [status, setStatus] = React.useState<AuthStatus>('loading');

  const isAuthenticated = status === 'authenticated' && user !== null;
  const isLoading = status === 'loading';

  const hydrate = React.useCallback(async () => {
    setStatus('loading');
    const token = getStoredToken();
    if (!token) {
      clearSession();
      setUser(null);
      setStatus('anonymous');
      return;
    }
    const cached = readStoredUser();
    if (cached) {
      setUser(cached);
      setStatus('authenticated');
    }
    try {
      const fresh = await apiMe();
      setUser(fresh);
      persistSession(token, fresh);
      setStatus('authenticated');
    } catch {
      clearSession();
      setUser(null);
      setStatus('anonymous');
    }
  }, []);

  const refreshUser = React.useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setStatus('anonymous');
      setUser(null);
      return null;
    }
    try {
      const fresh = await apiMe();
      setUser(fresh);
      persistSession(token, fresh);
      setStatus('authenticated');
      return fresh;
    } catch {
      clearSession();
      setUser(null);
      setStatus('anonymous');
      return null;
    }
  }, []);

  const login = React.useCallback(
    async (email: string, password: string) => {
      const result = await apiLogin(email, password);
      setUser(result.user);
      setStatus('authenticated');
      return result;
    },
    [],
  );

  const register = React.useCallback(async (data: RegisterData) => {
    const result = await apiRegister(data);
    setUser(result.user);
    setStatus('authenticated');
    return result;
  }, []);

  const logout = React.useCallback(() => {
    clearSession();
    setUser(null);
    setStatus('anonymous');
    queryClient.clear();
  }, [queryClient]);

  React.useEffect(() => {
    let mounted = true;
    hydrate().finally(() => {
      if (!mounted) return;
    });
    return () => {
      mounted = false;
    };
  }, [hydrate]);

  React.useEffect(() => {
    const onUnauthorized = () => {
      clearSession();
      setUser(null);
      setStatus('anonymous');
    };
    if (typeof window === 'undefined') return undefined;
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    };
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, status, isAuthenticated, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider />');
  }
  return ctx;
}
