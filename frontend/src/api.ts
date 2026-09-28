import type { ApiError, Joke, JokeInput } from './types'
const API_URL = import.meta.env.VITE_API_URL ?? ''
const TOKEN_KEY = 'laughder-admin-token'

export const authToken = {
  get: () => sessionStorage.getItem(TOKEN_KEY),
  set: (token: string) => sessionStorage.setItem(TOKEN_KEY, token),
  clear: () => sessionStorage.removeItem(TOKEN_KEY),
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = authToken.get()
  const response = await fetch(`${API_URL}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers } })
  if (!response.ok) {
    if (response.status === 401 && path !== '/api/auth/login') {
      authToken.clear()
      window.dispatchEvent(new Event('admin-unauthorized'))
    }
    const data = await response.json().catch(() => ({ error: 'Ошибка сети', details: [] })) as ApiError
    throw new Error(data.details?.join('. ') || data.error || `HTTP ${response.status}`)
  }
  return response.status === 204 ? undefined as T : response.json()
}
export const api = {
  login: (login: string, password: string) => request<{ token: string; tokenType: string; expiresIn: number }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ login, password }) }),
  verify: () => request<void>('/api/auth/verify'),
  list: () => request<Joke[]>('/api/jokes'),
  create: (body: JokeInput) => request<Joke>('/api/jokes', { method: 'POST', body: JSON.stringify(body) }),
  replace: (id: number, body: JokeInput) => request<Joke>(`/api/jokes/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (id: number, body: Partial<JokeInput>) => request<Joke>(`/api/jokes/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: number) => request<void>(`/api/jokes/${id}`, { method: 'DELETE' }),
  react: (id: number, reaction: 'LIKE' | 'DISLIKE') => request<Joke>(`/api/jokes/${id}/reaction`, { method: 'POST', body: JSON.stringify({ reaction }) }),
  undoReaction: (id: number, reaction: 'LIKE' | 'DISLIKE') => request<Joke>(`/api/jokes/${id}/reaction`, { method: 'DELETE', body: JSON.stringify({ reaction }) }),
  docsUrl: `${API_URL}/openapi.json`,
}
