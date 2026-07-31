import { apiFetch, setStoredToken, USER_STORAGE_KEY } from './http';
import { SESSION_COOKIE } from '@/middleware';

export interface LoggedUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'ATTENDANT';
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: LoggedUser;
}

export type RegisterData = {
  name: string;
  email: string;
  password: string;
  role?: LoggedUser['role'];
};

function setSessionCookie(present: boolean) {
  if (typeof document === 'undefined') return;
  try {
    const expires = present
      ? `; expires=${new Date(Date.now() + 12 * 60 * 60 * 1000).toUTCString()}`
      : `; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `${SESSION_COOKIE}=${present ? '1' : '0'}; path=/${expires}; SameSite=lax`;
  } catch {
    /* ignore */
  }
}

export async function login(email: string, password: string) {
  const result = await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
    skipAuth: true,
  });
  persistSession(result.accessToken, result.user);
  return result;
}

export async function register(data: RegisterData) {
  const result = await apiFetch<LoginResponse>('/auth/register', {
    method: 'POST',
    body: data,
    skipAuth: true,
  });
  persistSession(result.accessToken, result.user);
  return result;
}

export async function me() {
  return apiFetch<LoggedUser>('/auth/me');
}

export async function getProfile() {
  return apiFetch<LoggedUser>('/auth/profile', { skipAuth: true });
}

export function persistSession(token: string, user: LoggedUser) {
  setStoredToken(token);
  setSessionCookie(true);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch {
      /* ignore */
    }
  }
}

export function readStoredUser(): LoggedUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LoggedUser;
  } catch {
    return null;
  }
}

export function clearSession() {
  setStoredToken(null);
  setSessionCookie(false);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}


