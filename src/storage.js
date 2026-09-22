/* Safe localStorage wrapper: every access can throw (private mode, blocked storage). */
export const storage = {
  get(key) {
    try { return window.localStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try { window.localStorage.setItem(key, value); return true; } catch { return false; }
  },
  remove(key) {
    try { window.localStorage.removeItem(key); } catch { /* noop */ }
  },
  getJSON(key, fallback = null) {
    const raw = this.get(key);
    if (raw == null) return fallback;
    try { return JSON.parse(raw); } catch { return fallback; }
  },
  setJSON(key, value) {
    try { return this.set(key, JSON.stringify(value)); } catch { return false; }
  }
};

export const KEYS = {
  people: 'aura.v2.people',
  profile: 'aura.v2.profile'
};
