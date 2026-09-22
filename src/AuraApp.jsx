import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  I18nContext, useI18n, translate, detectLang, LANGS, LANG_KEY, SIGN_IDS, SIGN_SYMBOLS, GENDER_IDS,
  DNA_IDS, TONE_IDS, FOLLOWUP_IDS, signName, toSignId, toRiskId, relTime
} from './i18n.js';
import { storage, KEYS } from './storage.js';
import { post, warmUp, ApiError, MAX_TEXT } from './api.js';
import {
  loadPeople, savePeople, loadProfile, saveProfile, newPersonId,
  personName, personStatus, eventText, mockSituation, mockMessage, mockChat, mockCoach
} from './data.js';
import {
  Icon, Btn, Card, Label, Spinner, OfflineBadge, Toast, Chip, SignGlyph, Avatar, ZodiacHalo
} from './ui.jsx';
import { MySignSheet, PersonFormSheet, PrivacySheet } from './sheets.jsx';

/* ============================================================
   AURA — Relationship Intelligence
   ============================================================ */

const NAV = [
  { key: 'home', icon: Icon.home },
  { key: 'people', icon: Icon.people },
  { key: 'messages', icon: Icon.message },
  { key: 'chat', icon: Icon.chat },
  { key: 'coach', icon: Icon.coach }
];

const str = v => (typeof v === 'string' ? v : v == null ? '' : String(v));

export default function AuraApp() {
  /* ---------- language ---------- */
  const [lang, setLangState] = useState(detectLang);
  const t = useCallback((key, vars) => translate(lang, key, vars), [lang]);
  const setLang = useCallback(l => {
    if (!LANGS.includes(l)) return;
    setLangState(l);
    storage.set(LANG_KEY, l);
  }, []);
  const i18n = useMemo(() => ({ lang, t, setLang }), [lang, t, setLang]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t('meta.title');
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', t('meta.description'));
  }, [lang, t]);

  /* ---------- persisted data ---------- */
  const [people, setPeople] = useState(loadPeople);
  const [profile, setProfile] = useState(loadProfile);
  useEffect(() => { savePeople(people); }, [people]);
  useEffect(() => { saveProfile(profile); }, [profile]);

  /* Render free tier cold start: wake the backend right away */
  useEffect(() => { warmUp(); }, []);

  /* ---------- navigation / ui ---------- */
  const [screen, setScreen] = useState('home');
  const [sheet, setSheet] = useState(() => (loadProfile().onboarded ? null : { type: 'mySign', firstRun: true }));
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);
  const scrollRef = useRef(null);

  function showToast(text) {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 4500);
  }
  function goTo(s) { setScreen(s); }
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [screen]);

  /* ---------- home / analysis state ---------- */
  const [homeInput, setHomeInput] = useState('');
  const [homeKnownSign, setHomeKnownSign] = useState('');
  const [homePersonId, setHomePersonId] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analysisPersonId, setAnalysisPersonId] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const [genderFilter, setGenderFilter] = useState([]);
  const [signFilter, setSignFilter] = useState([]);
  const [currentPersonId, setCurrentPersonId] = useState(null);

  const [msgInput, setMsgInput] = useState('');
  const [msgResult, setMsgResult] = useState(null);
  const [msgLoading, setMsgLoading] = useState(false);

  const [chatInput, setChatInput] = useState('');
  const [chatResult, setChatResult] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);

  const [coachFollowup, setCoachFollowup] = useState(null);
  const [coachStrategy, setCoachStrategy] = useState(null);
  const [coachLoading, setCoachLoading] = useState(false);

  const homePerson = people.find(p => p.id === homePersonId) || null;

  /* ---------- API helper with localized fallback ---------- */
  async function request(endpoint, payload, fallback) {
    try {
      return await post(endpoint, payload, lang);
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.recoverable && fallback) {
          showToast(t(e.kind === 'timeout' ? 'errors.timeout' : 'errors.network'));
          return fallback();
        }
        if (e.kind === 'rate_limited') showToast(t('errors.rateLimited'));
        else if (e.kind === 'bad_request') showToast(t('errors.badRequest'));
        else showToast(t('errors.unavailable'));
      } else {
        showToast(t('errors.generic'));
      }
      return null;
    }
  }

  function contextLine(extra) {
    const parts = [];
    if (profile.sign) parts.push(t('context.mySign', { sign: signName(lang, profile.sign) }));
    if (homeKnownSign) parts.push(t('context.theirSign', { sign: signName(lang, homeKnownSign) }));
    if (extra) parts.push(extra);
    return parts.join(' ').slice(0, MAX_TEXT) || undefined;
  }

  function reveal(id) {
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function addTimelineEvent(personId, event) {
    setPeople(ps => ps.map(p => (p.id === personId ? { ...p, timeline: [event, ...p.timeline] } : p)));
  }

  /* ---------- situation ---------- */
  async function analyzeSituation() {
    const text = homeInput.trim();
    if (!text) { showToast(t('home.emptyInput')); return; }
    const personId = homePerson ? homePerson.id : null;
    const knownSign = homeKnownSign || undefined;
    setAnalysis(null);
    setAnalysisLoading(true);
    setScreen('analysis');
    const raw = await request('/api/analyze-situation', { text, knownSign }, () => mockSituation(text, knownSign, t, lang));
    setAnalysisLoading(false);
    if (!raw) { setScreen('home'); return; }
    const result = {
      summary: str(raw.summary), whatsHappening: str(raw.whatsHappening), strategy: str(raw.strategy),
      avoid: str(raw.avoid), message: str(raw.message),
      detectedSign: toSignId(raw.detectedSign) || homeKnownSign || '', mock: !!raw.mock
    };
    setAnalysis(result);
    setAnalysisPersonId(personId);
    if (personId) {
      addTimelineEvent(personId, { id: newPersonId(), date: new Date().toISOString(), kind: 'analysis', text: result.summary });
      showToast(t('analysis.addedTimeline', { name: personName(homePerson, t) }));
    }
  }

  async function improveMessage() {
    if (!analysis) return;
    setAnalysisLoading(true);
    const r = await request('/api/improve-message', { message: analysis.message, context: contextLine(homeInput.trim()) });
    setAnalysisLoading(false);
    if (r && r.improved) {
      setAnalysis(a => ({ ...a, message: str(r.improved), mock: a.mock || !!r.mock }));
      showToast(t('analysis.improved'));
    }
  }

  function copyText(text) {
    const ok = () => showToast(t('common.copied'));
    const legacy = () => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        const done = document.execCommand('copy');
        document.body.removeChild(ta);
        showToast(done ? t('common.copied') : t('common.copyFail'));
      } catch { showToast(t('common.copyFail')); }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, legacy);
    else legacy();
  }

  /* ---------- people ---------- */
  function openPerson(id) { setCurrentPersonId(id); setScreen('personDetail'); }

  function openAddPerson(prefill = {}, fromAnalysis = false) {
    setSheet({ type: 'person', personId: null, prefill, fromAnalysis });
  }

  function handleSavePerson(values) {
    const s = sheet;
    if (s.personId) {
      setPeople(ps => ps.map(p => {
        if (p.id !== s.personId) return p;
        const next = { ...p, ...values };
        // Seed people keep a localized name unless the user renamed them
        if (p.seed && !p.name && values.name === t(`seed.${p.seed}.name`)) delete next.name;
        return next;
      }));
      showToast(t('form.updated', { name: values.name }));
    } else {
      const now = new Date().toISOString();
      const timeline = [{ id: newPersonId(), date: now, textKey: 'person.createdEvent' }];
      if (s.fromAnalysis && analysis) {
        timeline.unshift({ id: newPersonId(), date: now, kind: 'analysis', text: analysis.summary });
      }
      const p = {
        id: newPersonId(), ...values,
        statusKey: s.fromAnalysis ? 'person.fromAnalysisStatus' : 'person.defaultStatus',
        dna: { autonomy: 50, trust: 50, pressure: 50, dialogue: 50 },
        timeline
      };
      setPeople(ps => [p, ...ps]);
      if (s.fromAnalysis) setAnalysisPersonId(p.id);
      showToast(t('form.saved', { name: values.name }));
    }
    setSheet(null);
  }

  function handleDeletePerson() {
    const id = sheet.personId;
    const p = people.find(x => x.id === id);
    setPeople(ps => ps.filter(x => x.id !== id));
    if (homePersonId === id) setHomePersonId(null);
    if (analysisPersonId === id) setAnalysisPersonId(null);
    setSheet(null);
    setScreen('people');
    if (p) showToast(t('form.deleted', { name: personName(p, t) }));
  }

  function newAnalysisForPerson(p) {
    const signTxt = p.sign ? signName(lang, p.sign) : t('common.unknownSign');
    setHomeInput(t('person.prefill', { name: personName(p, t), sign: signTxt, status: personStatus(p, t) }));
    setHomeKnownSign(p.sign || '');
    setHomePersonId(p.id);
    setScreen('home');
    showToast(t('person.ready', { name: personName(p, t) }));
  }

  const toggle = (setter, v) => setter(prev => (prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]));
  const filteredPeople = people.filter(p =>
    (genderFilter.length === 0 || genderFilter.includes(p.gender)) &&
    (signFilter.length === 0 || signFilter.includes(p.sign)));

  /* ---------- messages ---------- */
  async function analyzeMessage() {
    const text = msgInput.trim();
    if (!text) { showToast(t('messages.empty')); return; }
    setMsgLoading(true);
    const r = await request('/api/analyze-message', { text }, () => mockMessage(t));
    setMsgLoading(false);
    if (!r) return;
    setMsgResult({ perceived: str(r.perceived), risk: toRiskId(r.risk), improved: str(r.improved), mock: !!r.mock });
    if (!r.mock) showToast(t('messages.analyzed'));
    reveal('msg-result');
  }

  async function changeTone(tone) {
    if (!msgResult) return;
    setMsgLoading(true);
    const r = await request('/api/change-tone', { message: msgResult.improved, tone });
    setMsgLoading(false);
    if (r && r.rewritten) {
      setMsgResult(m => ({ ...m, improved: str(r.rewritten), mock: m.mock || !!r.mock }));
      showToast(t('messages.toneUpdated', { tone: t(`tones.${tone}`) }));
    }
  }

  /* ---------- chat ---------- */
  async function analyzeChat() {
    const text = chatInput.trim();
    if (!text) { showToast(t('chat.empty')); return; }
    setChatLoading(true);
    const r = await request('/api/analyze-chat', { text }, () => mockChat(t));
    setChatLoading(false);
    if (!r) return;
    setChatResult({ invest: str(r.invest), positive: str(r.positive), distance: str(r.distance), nextstep: str(r.nextstep), mock: !!r.mock });
    if (!r.mock) showToast(t('chat.analyzed'));
    reveal('chat-result');
  }

  /* ---------- coach ---------- */
  async function selectFollowup(kind) {
    setCoachFollowup(kind);
    setCoachLoading(true);
    const extra = (analysis && analysis.summary) || homeInput.trim();
    const r = await request('/api/coach-strategy', { followupType: kind, context: contextLine(extra) }, () => mockCoach(kind, t));
    setCoachLoading(false);
    if (r) { setCoachStrategy({ text: str(r.strategy), mock: !!r.mock }); reveal('coach-result'); }
  }

  /* ---------- my sign ---------- */
  function saveMySign(id) {
    setProfile({ sign: id, onboarded: true });
    setSheet(null);
    showToast(t('onboarding.saved', { sign: signName(lang, id) }));
  }
  function skipOnboarding() { setProfile(p => ({ ...p, onboarded: true })); setSheet(null); }
  function clearMySign() { setProfile({ sign: '', onboarded: true }); setSheet(null); showToast(t('onboarding.cleared')); }

  function clearLocalData() {
    storage.remove(KEYS.people);
    storage.remove(KEYS.profile);
    storage.remove(LANG_KEY);
    try { window.location.reload(); } catch { /* noop */ }
  }

  /* ============================================================
     RENDER
     ============================================================ */
  const activeTab = screen === 'analysis' ? 'home' : screen === 'personDetail' ? 'people' : screen;
  const currentPerson = people.find(x => x.id === currentPersonId) || null;
  const isSub = screen === 'analysis' || screen === 'personDetail';

  let subTitle = '';
  let subBack = () => goTo('home');
  let subAction = null;
  if (screen === 'analysis') subTitle = t('analysis.title');
  if (screen === 'personDetail') {
    subBack = () => goTo('people');
    if (currentPerson) {
      subTitle = personName(currentPerson, t);
      subAction = (
        <button type="button" className="icon-btn" aria-label={t('person.editLabel', { name: subTitle })}
          onClick={() => setSheet({ type: 'person', personId: currentPerson.id, prefill: currentPerson })}>
          <Icon.edit />
        </button>
      );
    }
  }

  return (
    <I18nContext.Provider value={i18n}>
      <div className="stage">
        <div className="app">
          {/* ---------- header ---------- */}
          <header className="header">
            {isSub ? (
              <>
                <button type="button" className="icon-btn" onClick={subBack} aria-label={t('header.back')}><Icon.back /></button>
                <h1 className="header-title">{subTitle}</h1>
                {subAction}
              </>
            ) : (
              <>
                <h1 className="logo">{t('brand.name')}</h1>
                <button type="button" className="sign-btn"
                  aria-label={profile.sign ? t('header.yourSign', { sign: signName(lang, profile.sign) }) : t('header.setSign')}
                  onClick={() => setSheet({ type: 'mySign', firstRun: false })}>
                  <span className="glyph" aria-hidden="true">{profile.sign ? SIGN_SYMBOLS[profile.sign] : '✦'}</span>
                  {profile.sign && <span>{signName(lang, profile.sign)}</span>}
                </button>
              </>
            )}
            <div className="lang-toggle" role="group" aria-label={t('header.language')}>
              {LANGS.map(l => (
                <button type="button" key={l} aria-pressed={lang === l ? 'true' : 'false'}
                  aria-label={t('header.switchTo', { lang: t(`langNames.${l}`) })} lang={l}
                  onClick={() => setLang(l)}>{l.toUpperCase()}</button>
              ))}
            </div>
          </header>

          <main className="scroll" ref={scrollRef}>
            {/* ---------- HOME ---------- */}
            {screen === 'home' && (
              <>
                <div className="hero">
                  <ZodiacHalo />
                  <div className="kicker">{t('brand.kicker')}</div>
                  <h2>{t('hero.line1')} <em>{t('hero.line2')}</em></h2>
                </div>

                <Label>{t('home.question')}</Label>
                {homePerson && (
                  <div className="chips" style={{ marginBottom: 10 }}>
                    <Chip className="person" active={false}
                      aria-label={t('home.clearPerson', { name: personName(homePerson, t) })}
                      onClick={() => setHomePersonId(null)}>
                      {t('home.forPerson', { name: personName(homePerson, t) })} <span className="x" aria-hidden="true">×</span>
                    </Chip>
                  </div>
                )}
                <div className="glass composer">
                  <label htmlFor="home-input" className="sr-only">{t('home.inputLabel')}</label>
                  <textarea id="home-input" rows={5} value={homeInput} maxLength={MAX_TEXT}
                    onChange={e => setHomeInput(e.target.value)} placeholder={t('home.placeholder')} />
                  <div className="composer-foot" aria-hidden="true">{t('common.chars', { n: homeInput.length, max: MAX_TEXT })}</div>
                </div>

                <Label>{t('home.theirSign')}</Label>
                <p className="hint">{t('home.theirSignHint')}</p>
                <div className="chips scroll-x" role="group" aria-label={t('home.theirSign')}>
                  <Chip active={!homeKnownSign} onClick={() => setHomeKnownSign('')}>{t('home.anySign')}</Chip>
                  {SIGN_IDS.map(id => (
                    <Chip key={id} active={homeKnownSign === id} onClick={() => setHomeKnownSign(homeKnownSign === id ? '' : id)}>
                      <SignGlyph id={id} />{signName(lang, id)}
                    </Chip>
                  ))}
                </div>

                <div className="row" style={{ marginTop: 18 }}>
                  <Btn variant="secondary" onClick={() => { setHomeInput(t('home.exampleText')); setHomeKnownSign(''); setHomePersonId(null); }}>{t('home.example')}</Btn>
                  <Btn variant="primary" onClick={analyzeSituation} disabled={analysisLoading}><Icon.spark />{t('home.analyze')}</Btn>
                </div>

                <Label action={people.length > 2 ? <button type="button" className="link" onClick={() => goTo('people')}>{t('home.seeAll')}</button> : null}>
                  {t('home.recent')}
                </Label>
                {people.length === 0
                  ? <div className="empty">{t('home.emptyRecent')}</div>
                  : <div className="list">{people.slice(0, 2).map(p => <PersonRow key={p.id} p={p} onClick={() => openPerson(p.id)} />)}</div>}

                <section className="companion" aria-labelledby="companion-title">
                  <span className="tag">{t('companion.tag')}</span>
                  <h3 id="companion-title">{t('companion.title')}</h3>
                  <blockquote>{t('companion.quote')}</blockquote>
                  <ul>
                    {t('companion.features').map(f => <li key={f}><span className="star" aria-hidden="true">✦</span>{f}</li>)}
                  </ul>
                  <Btn variant="gold" onClick={() => showToast(t('companion.soon'))}>{t('companion.cta')}</Btn>
                </section>

                <footer className="footer">
                  <p>{t('home.footerLine')}</p>
                  <button type="button" onClick={() => setSheet({ type: 'privacy' })}>{t('home.footerPrivacy')}</button>
                </footer>
              </>
            )}

            {/* ---------- ANALYSIS ---------- */}
            {screen === 'analysis' && (
              <>
                <div className="kicker" style={{ margin: '4px 0 14px' }}>{t('analysis.kicker')}</div>
                {analysisLoading && !analysis && <Spinner />}
                {!analysisLoading && !analysis && (
                  <div className="empty">
                    <p>{t('analysis.empty')}</p>
                    <Btn variant="primary" onClick={() => goTo('home')}>{t('analysis.startNew')}</Btn>
                  </div>
                )}
                {analysis && (
                  <>
                    <div className="pills" style={{ marginBottom: 12 }}>
                      {analysis.mock && <OfflineBadge />}
                      {analysis.detectedSign && (
                        <span className="pill" style={{ marginBottom: 12 }}>
                          <SignGlyph id={analysis.detectedSign} />{t('analysis.detected')}: {signName(lang, analysis.detectedSign)}
                        </span>
                      )}
                    </div>
                    <Card title={t('analysis.summary')} accent="violet" lead>{analysis.summary}</Card>
                    <Card title={t('analysis.happening')}>{analysis.whatsHappening}</Card>
                    <Card title={t('analysis.strategy')} accent="emerald">{analysis.strategy}</Card>
                    <Card title={t('analysis.avoid')} accent="rose">{analysis.avoid}</Card>

                    <Label>{t('analysis.message')}</Label>
                    <div className="bubble-wrap"><div className="bubble">{analysis.message}</div></div>
                    {analysisLoading && <Spinner />}
                    <div className="row" style={{ marginTop: 14 }}>
                      <Btn variant="secondary" onClick={() => copyText(analysis.message)}><Icon.copy />{t('common.copy')}</Btn>
                      <Btn variant="ghost" onClick={improveMessage} disabled={analysisLoading}><Icon.spark />{t('analysis.improve')}</Btn>
                    </div>
                    <div className="row" style={{ marginTop: 22 }}>
                      {(() => {
                        const ap = people.find(p => p.id === analysisPersonId);
                        return ap
                          ? <Btn variant="secondary" onClick={() => openPerson(ap.id)}>{t('analysis.openProfile', { name: personName(ap, t) })}</Btn>
                          : <Btn variant="secondary" onClick={() => openAddPerson({ sign: analysis.detectedSign }, true)}><Icon.plus />{t('analysis.savePerson')}</Btn>;
                      })()}
                      <Btn variant="primary" onClick={() => goTo('coach')}>{t('analysis.goCoach')}</Btn>
                    </div>
                  </>
                )}
              </>
            )}

            {/* ---------- PEOPLE ---------- */}
            {screen === 'people' && (
              <>
                <div className="page-head">
                  <h2>{t('people.title')}</h2>
                  <p>{t('people.subtitle')}</p>
                </div>
                <Label>{t('people.gender')}</Label>
                <div className="chips" role="group" aria-label={t('people.gender')}>
                  {GENDER_IDS.map(g => (
                    <Chip key={g} active={genderFilter.includes(g)} onClick={() => toggle(setGenderFilter, g)}>{t(`genders.${g}`)}</Chip>
                  ))}
                </div>
                <Label action={(genderFilter.length > 0 || signFilter.length > 0)
                  ? <button type="button" className="link" onClick={() => { setGenderFilter([]); setSignFilter([]); }}>{t('people.clearFilters')}</button>
                  : null}>
                  {t('people.sign')}
                </Label>
                <div className="chips scroll-x" role="group" aria-label={t('people.sign')}>
                  {SIGN_IDS.map(id => (
                    <Chip key={id} active={signFilter.includes(id)} onClick={() => toggle(setSignFilter, id)}>
                      <SignGlyph id={id} />{signName(lang, id)}
                    </Chip>
                  ))}
                </div>

                <div className="list" style={{ marginTop: 20 }}>
                  {people.length === 0 && <div className="empty">{t('people.empty')}</div>}
                  {people.length > 0 && filteredPeople.length === 0 && <div className="empty">{t('people.noMatch')}</div>}
                  {filteredPeople.map(p => <PersonRow key={p.id} p={p} onClick={() => openPerson(p.id)} />)}
                </div>
                <button type="button" className="add-row" onClick={() => openAddPerson()}><Icon.plus />{t('people.add')}</button>
              </>
            )}

            {/* ---------- PERSON DETAIL ---------- */}
            {screen === 'personDetail' && !currentPerson && <div className="empty">{t('person.notFound')}</div>}
            {screen === 'personDetail' && currentPerson && (
              <PersonDetail p={currentPerson} mySign={profile.sign}
                onNewAnalysis={() => newAnalysisForPerson(currentPerson)} />
            )}

            {/* ---------- MESSAGES ---------- */}
            {screen === 'messages' && (
              <>
                <div className="page-head">
                  <h2>{t('messages.title')}</h2>
                  <p>{t('messages.subtitle')}</p>
                </div>
                <Label>{t('messages.paste')}</Label>
                <div className="glass composer">
                  <label htmlFor="msg-input" className="sr-only">{t('messages.paste')}</label>
                  <textarea id="msg-input" rows={5} value={msgInput} maxLength={MAX_TEXT}
                    onChange={e => setMsgInput(e.target.value)} placeholder={t('messages.placeholder')} />
                  <div className="composer-foot" aria-hidden="true">{t('common.chars', { n: msgInput.length, max: MAX_TEXT })}</div>
                </div>
                <Btn variant="primary" style={{ marginTop: 14 }} onClick={analyzeMessage} disabled={msgLoading}><Icon.spark />{t('messages.analyze')}</Btn>

                {msgLoading && !msgResult && <Spinner />}
                {msgResult && (
                  <div id="msg-result" style={{ marginTop: 22, scrollMarginTop: 12 }}>
                    {msgResult.mock && <OfflineBadge />}
                    <Card title={t('messages.perceived')} accent="violet">{msgResult.perceived}</Card>
                    <Card title={t('messages.risk')}>
                      <div className={`risk ${msgResult.risk}`}><i aria-hidden="true" />{t(`risk.${msgResult.risk}`)}</div>
                    </Card>
                    <Label>{t('messages.improved')}</Label>
                    <div className="bubble-wrap"><div className="bubble">{msgResult.improved}</div></div>
                    {msgLoading && <Spinner />}
                    <Btn variant="secondary" style={{ marginTop: 14 }} onClick={() => copyText(msgResult.improved)}><Icon.copy />{t('common.copy')}</Btn>

                    <Label>{t('messages.changeTone')}</Label>
                    <div className="grid2">
                      {TONE_IDS.map(tone => (
                        <Btn key={tone} variant="secondary" size="sm" onClick={() => changeTone(tone)} disabled={msgLoading}>{t(`tones.${tone}`)}</Btn>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ---------- CHAT ---------- */}
            {screen === 'chat' && (
              <>
                <div className="page-head">
                  <h2>{t('chat.title')}</h2>
                  <p>{t('chat.subtitle')}</p>
                </div>
                <Label>{t('chat.paste')}</Label>
                <div className="glass composer">
                  <label htmlFor="chat-input" className="sr-only">{t('chat.paste')}</label>
                  <textarea id="chat-input" rows={7} value={chatInput} maxLength={MAX_TEXT}
                    onChange={e => setChatInput(e.target.value)} placeholder={t('chat.placeholder')} />
                  <div className="composer-foot" aria-hidden="true">{t('common.chars', { n: chatInput.length, max: MAX_TEXT })}</div>
                </div>
                <Btn variant="primary" style={{ marginTop: 14 }} onClick={analyzeChat} disabled={chatLoading}><Icon.spark />{t('chat.analyze')}</Btn>

                {chatLoading && !chatResult && <Spinner />}
                {chatResult && (
                  <div id="chat-result" style={{ marginTop: 22, scrollMarginTop: 12 }}>
                    {chatResult.mock && <OfflineBadge />}
                    <Card title={t('chat.invest')}>{chatResult.invest}</Card>
                    <Card title={t('chat.positive')} accent="emerald">{chatResult.positive}</Card>
                    <Card title={t('chat.distance')} accent="rose">{chatResult.distance}</Card>
                    <Card title={t('chat.nextstep')} accent="violet" lead>{chatResult.nextstep}</Card>
                  </div>
                )}
              </>
            )}

            {/* ---------- COACH ---------- */}
            {screen === 'coach' && (
              <>
                <div className="page-head">
                  <h2>{t('coach.title')}</h2>
                  <p>{t('coach.subtitle')}</p>
                </div>
                <div style={{ height: 16 }} />
                <Card title={t('coach.stateTitle')} accent="violet">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, fontWeight: 700 }}>
                    <span className="status-dot" aria-hidden="true" />{t('coach.waiting')}
                  </div>
                  {t('coach.stateText')}
                </Card>
                <Card title={t('coach.nextTitle')}>{t('coach.nextText')}</Card>

                <Label>{t('coach.after')}</Label>
                <div className="grid2" role="group" aria-label={t('coach.after')}>
                  {FOLLOWUP_IDS.map(f => (
                    <button type="button" key={f} className="choice" aria-pressed={coachFollowup === f ? 'true' : 'false'}
                      onClick={() => selectFollowup(f)} disabled={coachLoading}>{t(`followups.${f}`)}</button>
                  ))}
                </div>

                {coachLoading && <Spinner />}
                {coachStrategy && !coachLoading && (
                  <div id="coach-result" style={{ marginTop: 16, scrollMarginTop: 12 }}>
                    {coachStrategy.mock && <OfflineBadge />}
                    <Card title={t('coach.updated')} accent="gold" lead>{coachStrategy.text}</Card>
                  </div>
                )}
              </>
            )}
          </main>

          {/* ---------- bottom nav: visible on every screen ---------- */}
          <nav className="nav" aria-label={t('nav.label')}>
            {NAV.map(item => {
              const I = item.icon;
              return (
                <button type="button" key={item.key} aria-current={activeTab === item.key ? 'page' : undefined} onClick={() => goTo(item.key)}>
                  <I />
                  <span>{t(`nav.${item.key}`)}</span>
                </button>
              );
            })}
          </nav>

          <Toast text={toast} />

          {sheet && sheet.type === 'mySign' && (
            <MySignSheet firstRun={sheet.firstRun} value={profile.sign}
              onSave={saveMySign} onSkip={skipOnboarding} onClear={clearMySign} onClose={() => setSheet(null)} />
          )}
          {sheet && sheet.type === 'person' && (() => {
            const editing = sheet.personId ? people.find(p => p.id === sheet.personId) : null;
            return (
              <PersonFormSheet
                key={sheet.personId || 'new'}
                initial={editing || sheet.prefill || {}}
                displayName={editing ? personName(editing, t) : ''}
                isEdit={!!editing}
                onSave={handleSavePerson}
                onDelete={handleDeletePerson}
                onClose={() => setSheet(null)} />
            );
          })()}
          {sheet && sheet.type === 'privacy' && (
            <PrivacySheet onClose={() => setSheet(null)} onClearData={clearLocalData} />
          )}
        </div>
      </div>
    </I18nContext.Provider>
  );
}

/* ---------- sub components (read i18n from context) ---------- */

function PersonRow({ p, onClick }) {
  const { t, lang } = useI18n();
  const name = personName(p, t);
  return (
    <button type="button" className="person-row" onClick={onClick} aria-label={t('people.open', { name })}>
      <Avatar name={name} sign={p.sign} />
      <div className="meta">
        <div className="name">{name}</div>
        <div className="sub">
          {p.sign ? signName(lang, p.sign) : t('common.unknownSign')} · {t(`relations.${p.relation}`)}
        </div>
      </div>
      <span className="chev" aria-hidden="true">›</span>
    </button>
  );
}

function PersonDetail({ p, mySign, onNewAnalysis }) {
  const { t, lang } = useI18n();
  const name = personName(p, t);
  const events = [...p.timeline].sort((a, b) => new Date(b.date) - new Date(a.date));
  return (
    <>
      <div className="profile-hero">
        <Avatar name={name} sign={p.sign} large />
        <div style={{ minWidth: 0 }}>
          <h2>{name}</h2>
          <div className="pills">
            <span className="pill"><SignGlyph id={p.sign} />{p.sign ? signName(lang, p.sign) : t('common.unknownSign')}</span>
            {p.ascendant && <span className="pill violet"><SignGlyph id={p.ascendant} />{t('person.asc')} {signName(lang, p.ascendant)}</span>}
          </div>
          <div className="muted" style={{ marginTop: 8 }}>{t(`relations.${p.relation}`)} · {t(`genders.${p.gender}`)}</div>
        </div>
      </div>

      {mySign && p.sign && (
        <div className="pairing" aria-label={t('person.pairing')}>
          <div className="side"><div className="g" aria-hidden="true">{SIGN_SYMBOLS[mySign]}</div><div className="n">{t('person.you')}</div></div>
          <div className="x" aria-hidden="true">&amp;</div>
          <div className="side"><div className="g" aria-hidden="true">{SIGN_SYMBOLS[p.sign]}</div><div className="n">{name}</div></div>
        </div>
      )}

      <Card title={t('person.status')} accent="gold">{personStatus(p, t)}</Card>

      <Label>{t('person.dna')}</Label>
      <div className="glass dna">
        {DNA_IDS.map(k => (
          <div className="dna-row" key={k}>
            <div className="dna-head"><span>{t(`dna.${k}`)}</span><b>{p.dna[k]}%</b></div>
            <div className="bar" role="meter" aria-label={t(`dna.${k}`)} aria-valuemin={0} aria-valuemax={100} aria-valuenow={p.dna[k]}>
              <i style={{ width: `${p.dna[k]}%` }} />
            </div>
          </div>
        ))}
      </div>

      <Label>{t('person.timeline')}</Label>
      <div className="glass timeline">
        {events.length === 0 ? <div className="muted">{t('person.emptyTimeline')}</div> : (
          <ol className="tl" style={{ listStyle: 'none', margin: 0 }}>
            {events.map(e => (
              <li key={e.id || e.date} className={`tl-item ${e.kind === 'analysis' ? 'analysis' : ''}`}>
                <div className="tl-date">
                  <time dateTime={e.date}>{relTime(e.date, lang)}</time>
                  {e.kind === 'analysis' && <span className="tl-tag">✦ {t('person.analysisEvent')}</span>}
                </div>
                <div className="tl-text">{eventText(e, t)}</div>
              </li>
            ))}
          </ol>
        )}
      </div>

      <Btn variant="primary" style={{ marginTop: 22 }} onClick={onNewAnalysis}><Icon.spark />{t('person.newAnalysis')}</Btn>
    </>
  );
}
