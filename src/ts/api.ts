import { API_BASE, WS_BASE } from '../lib/constants';

export async function request(method: string, path: string, body?: object) {
  const res = await fetch(API_BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  register: (email: string, password: string, name: string) => request('POST', '/api/register', { email, password, name }),
  login:    (email: string, password: string)               => request('POST', '/api/login',    { email, password }),
  getProfile:     (id: string)                              => request('GET',  `/api/profile/${id}`),
  updateProfile:  (id: string, name: string)                => request('PATCH', `/api/profile/${id}`, { name }),
  changePassword: (id: string, cur: string, next: string)   => request('POST', `/api/profile/${id}/change-password`, { currentPassword: cur, newPassword: next }),
  matchHistory:   (id: string, limit = 20)                  => request('GET',  `/api/profile/${id}/match-history?limit=${limit}`),
  leaderboard:    (limit = 20)                              => request('GET',  `/api/leaderboard?limit=${limit}`),
  playerRank:     (id: string)                              => request('GET',  `/api/leaderboard/player/${id}`),
  problems:       ()                                        => request('GET',  '/api/problems'),
};

export function createSocket(onMessage: (msg: any) => void) {
  const ws = new WebSocket(WS_BASE);
  ws.addEventListener('message', e => onMessage(JSON.parse(e.data)));
  return ws;
}

export function getSession() {
  try { return JSON.parse(localStorage.getItem('session')!); } catch { return null; }
}

export function setSession(user: object) {
  localStorage.setItem('session', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('session');
}

export function requireAuth() {
  const s = getSession();
  if (!s) { location.href = '/auth.html'; return null; }
  return s;
}
