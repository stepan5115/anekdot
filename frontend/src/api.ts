import type { ApiError, Joke, JokeInput } from './types'
const API_URL = import.meta.env.VITE_API_URL ?? ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } })
  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: 'Ошибка сети', details: [] })) as ApiError
    throw new Error(data.details?.join('. ') || data.error || `HTTP ${response.status}`)
  }
  return response.status === 204 ? undefined as T : response.json()
}
export const api = {
  list: () => request<Joke[]>('/api/jokes'),
  create: (body: JokeInput) => request<Joke>('/api/jokes', { method: 'POST', body: JSON.stringify(body) }),
  replace: (id: number, body: JokeInput) => request<Joke>(`/api/jokes/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (id: number, body: Partial<JokeInput>) => request<Joke>(`/api/jokes/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: number) => request<void>(`/api/jokes/${id}`, { method: 'DELETE' }),
  react: (id: number, reaction: 'LIKE' | 'DISLIKE') => request<Joke>(`/api/jokes/${id}/reaction`, { method: 'POST', body: JSON.stringify({ reaction }) }),
  undoReaction: (id: number, reaction: 'LIKE' | 'DISLIKE') => request<Joke>(`/api/jokes/${id}/reaction`, { method: 'DELETE', body: JSON.stringify({ reaction }) }),
  docsUrl: `${API_URL}/openapi.json`,
}
