/* ============================================================
   AURA — local data: seed people, persistence, mock fallbacks
   ============================================================ */
import { storage, KEYS } from './storage.js';
import { findSignInText, signName, toSignId, SIGN_IDS, GENDER_IDS, RELATION_IDS, DNA_IDS } from './i18n.js';

const DAY = 86400000;
const ago = ms => new Date(Date.now() - ms).toISOString();

/* Seed people keep i18n keys (not text) so they follow the active language. */
function buildSeed() {
  return [
    {
      id: 'marco', seed: 'marco', sign: 'aries', ascendant: 'leo', gender: 'man', relation: 'friend',
      dna: { autonomy: 78, trust: 70, pressure: 30, dialogue: 64 },
      timeline: [
        { id: 'm0', date: ago(2 * DAY), textKey: 'seed.marco.timeline.0' },
        { id: 'm1', date: ago(14 * DAY), textKey: 'seed.marco.timeline.1' },
        { id: 'm2', date: ago(31 * DAY), textKey: 'seed.marco.timeline.2' }
      ]
    },
    {
      id: 'laura', seed: 'laura', sign: 'leo', ascendant: 'virgo', gender: 'woman', relation: 'partner',
      dna: { autonomy: 35, trust: 58, pressure: 74, dialogue: 47 },
      timeline: [
        { id: 'l0', date: ago(3 * 3600000), textKey: 'seed.laura.timeline.0' },
        { id: 'l1', date: ago(3 * DAY), textKey: 'seed.laura.timeline.1' },
        { id: 'l2', date: ago(7 * DAY), textKey: 'seed.laura.timeline.2' }
      ]
    },
    {
      id: 'dad', seed: 'dad', sign: 'taurus', ascendant: 'capricorn', gender: 'man', relation: 'family',
      dna: { autonomy: 60, trust: 85, pressure: 20, dialogue: 55 },
      timeline: [
        { id: 'd0', date: ago(7 * DAY), textKey: 'seed.dad.timeline.0' },
        { id: 'd1', date: ago(32 * DAY), textKey: 'seed.dad.timeline.1' }
      ]
    }
  ];
}

function sanitizePerson(p) {
  if (!p || typeof p !== 'object' || !p.id) return null;
  const dna = {};
  DNA_IDS.forEach(k => {
    const raw = p.dna ? p.dna[k] : undefined;
    const n = raw === null || raw === undefined || raw === '' || typeof raw === 'boolean' ? NaN : Number(raw);
    dna[k] = Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 50;
  });
  return {
    ...p,
    sign: toSignId(p.sign) || '',
    ascendant: toSignId(p.ascendant) || '',
    gender: GENDER_IDS.includes(p.gender) ? p.gender : 'other',
    relation: RELATION_IDS.includes(p.relation) ? p.relation : 'other',
    dna,
    timeline: Array.isArray(p.timeline) ? p.timeline.filter(e => e && e.date) : []
  };
}

/* Seeds only on first run (key absent). An empty saved list stays empty. */
export function loadPeople() {
  const saved = storage.getJSON(KEYS.people, null);
  if (Array.isArray(saved)) return saved.map(sanitizePerson).filter(Boolean);
  const seed = buildSeed();
  storage.setJSON(KEYS.people, seed);
  return seed;
}
export function savePeople(people) { storage.setJSON(KEYS.people, people); }

export function loadProfile() {
  const p = storage.getJSON(KEYS.profile, null);
  if (!p || typeof p !== 'object') return { sign: '', onboarded: false };
  return { sign: toSignId(p.sign), onboarded: !!p.onboarded };
}
export function saveProfile(profile) { storage.setJSON(KEYS.profile, profile); }

export function newPersonId() { return 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

/* ---------- display helpers (localized) ---------- */
export function personName(p, t) {
  if (p.name) return p.name;
  if (p.seed) return t(`seed.${p.seed}.name`);
  return '?';
}
export function personStatus(p, t) {
  if (p.status) return p.status;
  if (p.seed) return t(`seed.${p.seed}.status`);
  return t(p.statusKey || 'person.defaultStatus');
}
export function eventText(e, t) {
  if (e.text) return e.text;
  if (e.textKey) return t(e.textKey);
  return '';
}

/* ---------- localized mock fallbacks ---------- */
export function mockSituation(text, knownSign, t, lang) {
  const id = toSignId(knownSign) || findSignInText(text) || '';
  const m = t('mock.situation');
  return {
    summary: m.summary,
    whatsHappening: id
      ? t('mock.situation.whatsHappening', { sign: signName(lang, id) })
      : m.whatsHappeningNoSign,
    strategy: m.strategy,
    avoid: m.avoid,
    message: m.message,
    detectedSign: id,
    mock: true
  };
}
export function mockMessage(t) {
  return { perceived: t('mock.message.perceived'), risk: 'medium', improved: t('mock.message.improved'), mock: true };
}
export function mockChat(t) {
  const m = t('mock.chat');
  return { invest: m.invest, positive: m.positive, distance: m.distance, nextstep: m.nextstep, mock: true };
}
export function mockCoach(kind, t) {
  return { strategy: t(`mock.coach.${kind}`), mock: true };
}

export { SIGN_IDS };
