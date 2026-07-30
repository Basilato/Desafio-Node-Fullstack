import { apiFetch } from './http';

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

export async function login(email: string, password: string) {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
    skipAuth: true,
  });
}

export async function me() {
  return apiFetch<LoggedUser>('/auth/me');
}

export async function getProfile() {
  return apiFetch<LoggedUser>('/auth/profile', { skipAuth: true });
}
