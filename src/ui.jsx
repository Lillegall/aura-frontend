import React, { useEffect, useRef, useState } from 'react';
import { useI18n, SIGN_IDS, SIGN_SYMBOLS, signName } from './i18n.js';

/* ---------- inline icons (no icon lib) ---------- */
const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };
export const Icon = {
  home: () => <svg viewBox="0 0 24 24" aria-hidden="true" {...P}><path d="M3.5 10.5 12 4l8.5 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-4v-6h-6v6H5A1.5 1.5 0 0 1 3.5 19z"/></svg>,
  people: () => <svg viewBox="0 0 24 24" aria-hidden="true" {...P}><circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M15.5 5.2a3.3 3.3 0 0 1 0 6.6M17.5 14.8c2.2.6 3.6 2.4 4 5.2"/></svg>,
  message: () => <svg viewBox="0 0 24 24" aria-hidden="true" {...P}><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>,
  chat: () => <svg viewBox="0 0 24 24" aria-hidden="true" {...P}><path d="M20 11.5a7.5 7.5 0 0 1-11 6.6L4 19.5l1.4-4.3A7.5 7.5 0 1 1 20 11.5z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" strokeWidth="2.4"/></svg>,
  coach: () => <svg viewBox="0 0 24 24" aria-hidden="true" {...P}><path d="M12 3c.6 4.6 3.4 7.4 8 8-4.6.6-7.4 3.4-8 8-.6-4.6-3.4-7.4-8-8 4.6-.6 7.4-3.4 8-8z"/></svg>,
  back: () => <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...P}><path d="M15 5l-7 7 7 7"/></svg>,
  close: () => <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...P}><path d="M6 6l12 12M18 6 6 18"/></svg>,
  info: () => <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...P}><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6h.01" strokeWidth="2.2"/></svg>,
  edit: () => <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" {...P}><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/></svg>,
  copy: () => <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" {...P}><rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"/></svg>,
  spark: () => <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" {...P}><path d="M12 4c.4 3.4 2.6 5.6 6 6-3.4.4-5.6 2.6-6 6-.4-3.4-2.6-5.6-6-6 3.4-.4 5.6-2.6 6-6zM19 16c.2 1.4 1 2.2 2.4 2.4-1.4.2-2.2 1-2.4 2.4-.2-1.4-1-2.2-2.4-2.4 1.4-.2 2.2-1 2.4-2.4z"/></svg>,
  plus: () => <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...P}><path d="M12 5v14M5 12h14"/></svg>
};

export function Btn({ children, variant = 'secondary', size, className = '', ...rest }) {
  return (
    <button type="button" className={`btn ${variant} ${size || ''} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function Card({ title, icon, accent = '', lead, children }) {
  return (
    <section className={`card ${accent} ${lead ? 'lead' : ''}`}>
      <h3 className="card-title">{icon}{title}</h3>
      <div className="card-body">{children}</div>
    </section>
  );
}

export function Label({ children, action }) {
  return <div className="label"><span>{children}</span>{action}</div>;
}

export function Spinner() {
  const { t } = useI18n();
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setSlow(true), 7000);
    return () => clearTimeout(id);
  }, []);
  return (
    <div className="spinner" role="status" aria-live="polite">
      <div className="spinner-ring" aria-hidden="true" />
      <span>{slow ? t('spinner.waking') : t('spinner.thinking')}</span>
    </div>
  );
}

export function OfflineBadge() {
  const { t } = useI18n();
  return <div className="badge-offline" title={t('common.offlineHint')}>{t('common.offline')}</div>;
}

export function Toast({ text }) {
  if (!text) return null;
  return <div className="toast" role="status" aria-live="polite">{text}</div>;
}

export function Chip({ active, onClick, children, className = '', ...rest }) {
  return (
    <button type="button" className={`chip ${className}`} aria-pressed={active ? 'true' : 'false'} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}

export function SignGlyph({ id }) {
  return <span className="glyph" aria-hidden="true">{SIGN_SYMBOLS[id] || '✦'}</span>;
}

export function SignGrid({ value, onChange }) {
  const { lang } = useI18n();
  return (
    <div className="sign-grid">
      {SIGN_IDS.map(id => (
        <button type="button" key={id} className="sign-tile" aria-pressed={value === id ? 'true' : 'false'} onClick={() => onChange(id)}>
          <SignGlyph id={id} />
          <span>{signName(lang, id)}</span>
        </button>
      ))}
    </div>
  );
}

export function Avatar({ name, sign, large }) {
  return (
    <div className={`avatar ${large ? 'lg' : ''}`} aria-hidden="true">
      {(name || '?').trim().charAt(0).toUpperCase()}
      {sign && <span className="badge">{SIGN_SYMBOLS[sign]}</span>}
    </div>
  );
}

export function ZodiacHalo() {
  return (
    <div className="halo" aria-hidden="true">
      <div className="halo-orb" />
      <div className="halo-ring">
        {SIGN_IDS.map((id, i) => (
          <span key={id} style={{ transform: `rotate(${i * 30}deg) translateY(-95px) rotate(${-i * 30}deg)` }}>{SIGN_SYMBOLS[id]}</span>
        ))}
      </div>
      <div className="halo-ring inner" />
    </div>
  );
}

/* Accessible bottom sheet: dialog role, Escape to close, focus moved inside and restored. */
export function Sheet({ title, kicker, onClose, children, dismissable = true }) {
  const { t } = useI18n();
  const ref = useRef(null);
  const titleId = useRef('sheet-' + Math.random().toString(36).slice(2, 8)).current;
  useEffect(() => {
    const prev = document.activeElement;
    const el = ref.current;
    if (el) el.focus();
    function onKey(e) {
      if (e.key === 'Escape' && dismissable) onClose();
      if (e.key === 'Tab' && el) {
        const f = el.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (prev && prev.focus) prev.focus();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="sheet-backdrop" onMouseDown={e => { if (dismissable && e.target === e.currentTarget) onClose(); }}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} ref={ref}>
        <div className="sheet-grip" aria-hidden="true" />
        <div className="sheet-head">
          <div style={{ flex: 1 }}>
            {kicker && <div className="kicker">{kicker}</div>}
            <h2 id={titleId}>{title}</h2>
          </div>
          {dismissable && (
            <button type="button" className="icon-btn" onClick={onClose} aria-label={t('common.close')}><Icon.close /></button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
