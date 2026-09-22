/* ============================================================
   AURA — backend client (see CONTRACT.md v2)
   ============================================================ */
export const BACKEND_URL = String(
  import.meta.env.VITE_BACKEND_URL || 'https://aura-backend-icox.onrender.com'
).replace(/\/+$/, '');

export const MAX_TEXT = 6000;
const TIMEOUT_MS = 30000;

/* kind: network | timeout | server | bad_request | rate_limited */
export class ApiError extends Error {
  constructor(kind, message, status) {
    super(message || kind);
    this.kind = kind;
    this.status = status || 0;
  }
  /* Errors where a local fallback answer makes sense */
  get recoverable() {
    return this.kind === 'network' || this.kind === 'timeout' || this.kind === 'server';
  }
}

export async function post(endpoint, payload, lang) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(BACKEND_URL + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, lang }),
      signal: ctrl.signal
    });
  } catch (err) {
    throw new ApiError(err && err.name === 'AbortError' ? 'timeout' : 'network', err && err.message);
  } finally {
    clearTimeout(timer);
  }

  let body = null;
  try { body = await res.json(); } catch { body = null; }

  if (!res.ok) {
    const code = body && body.code;
    if (res.status === 429 || code === 'rate_limited') throw new ApiError('rate_limited', body && body.error, res.status);
    if (res.status === 400 || code === 'bad_request') throw new ApiError('bad_request', body && body.error, res.status);
    throw new ApiError('server', body && body.error, res.status);
  }
  if (!body || typeof body !== 'object') throw new ApiError('server', 'invalid body', res.status);
  return body;
}

/* Render free tier cold-starts in ~50s: ping health as soon as the app loads. */
let warmPromise = null;
export function warmUp() {
  if (warmPromise) return warmPromise;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 70000);
  warmPromise = fetch(BACKEND_URL + '/api/health', { signal: ctrl.signal })
    .then(r => (r.ok ? r.json() : null))
    .catch(() => null)
    .finally(() => clearTimeout(timer));
  return warmPromise;
}
