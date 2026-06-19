const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function apiRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API Error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const authAPI = {
  register: (data: { email: string; name: string; password: string }) =>
    apiRequest('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  getCurrentUser: () =>
    apiRequest('/api/auth/me', { method: 'GET' }),

  logout: () =>
    apiRequest('/api/auth/logout', { method: 'POST' }),
};
