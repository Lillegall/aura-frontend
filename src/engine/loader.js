/* Frontend-owned (not overwritten by aura-engine/sync.mjs).
   Each sign file becomes its own lazy chunk: only the signs actually needed are downloaded. */
const files = import.meta.glob('./data/signs/*.json');

export function loadSign(id) {
  const f = files[`./data/signs/${id}.json`];
  if (!f) return Promise.reject(new Error(`no bank for ${id}`));
  return f().then(m => (m && m.default) || m);
}
