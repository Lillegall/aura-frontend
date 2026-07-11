import React, { useState, useEffect, useRef } from 'react';

/* ============================================================
   AURA — Relationship Intelligence
   Motore di analisi collegato all'API Claude (con fallback mock)
   ============================================================ */

const SIGNS = ['Ariete','Toro','Gemelli','Cancro','Leone','Vergine','Bilancia','Scorpione','Sagittario','Capricorno','Acquario','Pesci'];

const ZODIAC_SYMBOLS = {
  Ariete: '♈', Toro: '♉', Gemelli: '♊', Cancro: '♋', Leone: '♌', Vergine: '♍',
  Bilancia: '♎', Scorpione: '♏', Sagittario: '♐', Capricorno: '♑', Acquario: '♒', Pesci: '♓'
};

const EXAMPLE_TEXT = "Ho litigato con la mia ragazza Leone perché dice che la controllo troppo. Vorrei scriverle ma non so come farlo senza peggiorare la situazione.";

const SEED_PEOPLE = [
  {
    id: 'marco', name: 'Marco', sign: 'Ariete', ascendant: 'Leone', gender: 'uomo', relation: 'Amico',
    status: "Stabile, ma comunicazione un po' rada nelle ultime settimane.",
    dna: { autonomia: 78, fiducia: 70, pressione: 30, dialogo: 64 },
    timeline: [
      { date: '2 giorni fa', text: 'Ti ha scritto per organizzare una serata, ancora da confermare.' },
      { date: '2 settimane fa', text: 'Piccolo malinteso su un impegno mancato, chiarito velocemente.' },
      { date: '1 mese fa', text: 'Serata insieme, clima molto positivo.' }
    ]
  },
  {
    id: 'laura', name: 'Laura', sign: 'Leone', ascendant: 'Vergine', gender: 'donna', relation: 'Partner',
    status: 'Tensione recente legata al bisogno di autonomia percepito come controllo.',
    dna: { autonomia: 35, fiducia: 58, pressione: 74, dialogo: 47 },
    timeline: [
      { date: 'Oggi', text: 'Discussione: si è sentita controllata riguardo ai suoi impegni.' },
      { date: '3 giorni fa', text: 'Serata piacevole, buona sintonia.' },
      { date: '1 settimana fa', text: 'Piccola discussione su gestione del tempo libero.' }
    ]
  },
  {
    id: 'papa', name: 'Papà', sign: 'Toro', ascendant: 'Capricorno', gender: 'uomo', relation: 'Familiare',
    status: 'Rapporto solido, dialogo diretto ma a volte poco esplicito sulle emozioni.',
    dna: { autonomia: 60, fiducia: 85, pressione: 20, dialogo: 55 },
    timeline: [
      { date: '1 settimana fa', text: 'Telefonata tranquilla, aggiornamenti di routine.' },
      { date: '1 mese fa', text: 'Confronto su una decisione familiare, risolto con calma.' }
    ]
  }
];

/* ---------- Backend Aura (Render) ---------- */
const BACKEND_URL = 'https://aura-backend-icox.onrender.com';

async function callBackend(endpoint, payload) {
  let res;
  try {
    res = await fetch(BACKEND_URL + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (networkErr) {
    throw new Error('Impossibile contattare il server Aura: ' + networkErr.message);
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || ('Errore server: HTTP ' + res.status));
  }

  return res.json();
}

/* ---------- Mock fallbacks (used if API fails) ---------- */
function mockSituationAnalysis(text) {
  const sign = SIGNS.find(s => text.toLowerCase().includes(s.toLowerCase())) || 'Bilancia';
  return {
    summary: "Sembra che tu stia vivendo un momento di tensione dove il bisogno di spazio e quello di sicurezza non sono ancora allineati.",
    whatsHappening: `Con un segno di ${sign}, il punto sensibile è spesso l'autonomia. Una domanda diretta sui suoi impegni può essere percepita come una messa in discussione della sua libertà, più che come interesse.`,
    strategy: "Lascia passare qualche ora prima di scrivere. Riconosci il suo punto di vista prima di esprimere il tuo, e proponi un momento per parlarne di persona.",
    avoid: "Evita di giustificarti troppo o di inviare più messaggi di fila se non risponde subito.",
    message: "Ci ho pensato e capisco perché ti sei sentita così. Non voglio controllarti, voglio solo stare bene insieme. Ti va se ne parliamo con calma stasera?",
    detectedSign: sign
  };
}
function mockMessageAnalysis() {
  return {
    perceived: "Il tono generale potrebbe risultare un po' intenso, anche se il contenuto è ragionevole.",
    risk: "medio",
    improved: "Volevo dirti come mi sento, senza puntare il dito: mi piacerebbe trovare un momento per parlarne con calma insieme."
  };
}
function mockChatAnalysis() {
  return {
    invest: "Il bilanciamento nella conversazione appare piuttosto equilibrato tra le due parti.",
    positive: "Ci sono risposte relativamente rapide e un uso di toni informali, segno di un canale ancora aperto.",
    distance: "Si notano alcune risposte brevi o ritardate, e una minore iniziativa nel proporre incontri.",
    nextstep: "Lascia spazio per un giorno, poi proponi qualcosa di concreto e leggero."
  };
}

/* ---------- Small UI atoms ---------- */
function Spinner() {
  return (
    <div style={{display:'flex', alignItems:'center', gap:10, padding:'6px 0'}}>
      <div style={{
        width:16, height:16, borderRadius:'50%',
        border:'2px solid rgba(139,124,246,0.25)', borderTopColor:'#8b7cf6',
        animation:'spin 0.8s linear infinite'
      }}/>
      <span style={{fontSize:13, color:'#a8a6b3'}}>Aura sta pensando…</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function Card({ title, children, accent }) {
  const accents = {
    violet: { border:'rgba(139,124,246,0.35)', bg:'linear-gradient(180deg, rgba(139,124,246,0.15), #161821)' },
    gold: { border:'rgba(212,175,106,0.35)', bg:'linear-gradient(180deg, rgba(212,175,106,0.15), #161821)' },
    emerald: { border:'rgba(79,184,138,0.35)', bg:'linear-gradient(180deg, rgba(79,184,138,0.15), #161821)' },
    danger: { border:'rgba(224,116,138,0.35)', bg:'linear-gradient(180deg, rgba(224,116,138,0.12), #161821)' }
  };
  const style = accent ? accents[accent] : { border:'rgba(255,255,255,0.08)', bg:'#161821' };
  return (
    <div style={{
      background: style.bg, border:`1px solid ${style.border}`, borderRadius:16,
      padding:16, marginBottom:12
    }}>
      <div style={{
        fontSize:12.5, textTransform:'uppercase', letterSpacing:'0.06em',
        color:'#6b6976', fontWeight:700, marginBottom:8
      }}>{title}</div>
      <div style={{fontSize:14.5, lineHeight:1.55, color:'#f2f1ee'}}>{children}</div>
    </div>
  );
}

function Btn({ children, onClick, variant='secondary', style={}, disabled }) {
  const base = {
    display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
    padding:'14px 20px', borderRadius:14, fontSize:15, fontWeight:700,
    border:'none', cursor: disabled ? 'default':'pointer', width:'100%',
    fontFamily:'inherit', opacity: disabled ? 0.6 : 1
  };
  const variants = {
    primary: { background:'linear-gradient(135deg, #8b7cf6, #6a5ce0)', color:'#fff', boxShadow:'0 8px 20px rgba(139,124,246,0.35)' },
    secondary: { background:'#161821', color:'#f2f1ee', border:'1px solid rgba(255,255,255,0.08)' },
    ghost: { background:'transparent', color:'#8b7cf6', border:'1px solid rgba(139,124,246,0.35)' },
    gold: { background:'linear-gradient(135deg, #d4af6a, #b98f4b)', color:'#1a1204' }
  };
  return (
    <button disabled={disabled} onClick={onClick} style={{...base, ...variants[variant], ...style}}
      onMouseDown={e => !disabled && (e.currentTarget.style.transform='scale(0.98)')}
      onMouseUp={e => e.currentTarget.style.transform='scale(1)'}>
      {children}
    </button>
  );
}

function Toast({ text }) {
  if (!text) return null;
  return (
    <div style={{
      position:'absolute', left:'50%', bottom:100, transform:'translateX(-50%)',
      background:'#fff', color:'#111', padding:'12px 18px', borderRadius:16,
      fontSize:12.5, fontWeight:600, boxShadow:'0 10px 30px rgba(0,0,0,0.4)', zIndex:200,
      maxWidth:320, wordBreak:'break-word', lineHeight:1.4
    }}>{text}</div>
  );
}

const NAV_ITEMS = [
  { key:'home', label:'Home', icon:'⌂' },
  { key:'people', label:'Persone', icon:'☺' },
  { key:'messages', label:'Messaggi', icon:'✉' },
  { key:'chat', label:'Chat', icon:'💬' },
  { key:'coach', label:'Coach', icon:'✦' }
];

function BottomNav({ active, onNavigate }) {
  return (
    <div style={{
      display:'flex', justifyContent:'space-around', alignItems:'center',
      padding:'10px 6px 16px 6px', background:'rgba(17,19,25,0.9)',
      backdropFilter:'blur(10px)', borderTop:'1px solid rgba(255,255,255,0.08)'
    }}>
      {NAV_ITEMS.map(item => (
        <button key={item.key} onClick={() => onNavigate(item.key)} style={{
          background:'none', border:'none', color: active===item.key ? '#8b7cf6' : '#6b6976',
          display:'flex', flexDirection:'column', alignItems:'center', gap:4,
          fontSize:10, fontWeight:600, cursor:'pointer', padding:'4px 8px'
        }}>
          <span style={{fontSize:19, lineHeight:1}}>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ============================================================ */
export default function AuraApp() {
  const [screen, setScreen] = useState('home'); // home, analysis, people, personDetail, messages, chat, coach
  const [homeInput, setHomeInput] = useState('');
  const [homeKnownSign, setHomeKnownSign] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [people, setPeople] = useState(SEED_PEOPLE);
  const [genderFilter, setGenderFilter] = useState([]); // array di stringhe selezionate
  const [signFilter, setSignFilter] = useState([]);
  const [currentPersonId, setCurrentPersonId] = useState(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);

  const [msgInput, setMsgInput] = useState('');
  const [msgResult, setMsgResult] = useState(null);
  const [msgLoading, setMsgLoading] = useState(false);

  const [chatInput, setChatInput] = useState('');
  const [chatResult, setChatResult] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);

  const [coachFollowup, setCoachFollowup] = useState(null);
  const [coachStrategy, setCoachStrategy] = useState(null);
  const [coachLoading, setCoachLoading] = useState(false);

  function showToast(text) {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 8000);
  }

  function goTo(s) { setScreen(s); }

  /* ---------- Situazione ---------- */
  async function analyzeSituation() {
    const text = homeInput.trim();
    if (!text) { showToast('Scrivi prima cosa sta succedendo'); return; }
    setAnalysisLoading(true);
    setScreen('analysis');
    try {
      const result = await callBackend('/api/analyze-situation', { text, knownSign: homeKnownSign || undefined });
      setAnalysis(result);
    } catch (e) {
      setAnalysis(mockSituationAnalysis(text));
      showToast('Errore: ' + e.message);
    }
    setAnalysisLoading(false);
  }

  async function improveMessage() {
    if (!analysis) return;
    setAnalysisLoading(true);
    try {
      const result = await callBackend('/api/improve-message', { message: analysis.message, context: homeInput });
      setAnalysis(a => ({ ...a, message: result.improved }));
      showToast('Messaggio migliorato');
    } catch (e) {
      showToast('Errore: ' + e.message);
    }
    setAnalysisLoading(false);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => showToast('Copiato negli appunti')).catch(() => showToast('Copiato negli appunti'));
    } else {
      showToast('Copiato negli appunti');
    }
  }

  function savePersonFromAnalysis() {
    const sign = (analysis && analysis.detectedSign) || 'Bilancia';
    const name = 'Persona da situazione ' + (people.length + 1);
    const newPerson = {
      id: 'p_' + Date.now(), name, sign, ascendant: '', gender: 'altro', relation: 'Da definire',
      status: 'Situazione recente in corso di gestione.',
      dna: { autonomia:50, fiducia:50, pressione:50, dialogo:50 },
      timeline: [{ date:'Ora', text:'Analisi creata dalla situazione descritta.' }]
    };
    setPeople(p => [newPerson, ...p]);
    showToast(`${name} salvata tra le Persone`);
  }

  /* ---------- Persone ---------- */
  function openPerson(id) { setCurrentPersonId(id); setScreen('personDetail'); }

  function toggleGenderFilter(g) {
    setGenderFilter(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  }
  function toggleSignFilter(s) {
    setSignFilter(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }
  const filteredPeople = people.filter(p => {
    const genderOk = genderFilter.length === 0 || genderFilter.includes(p.gender);
    const signOk = signFilter.length === 0 || signFilter.includes(p.sign);
    return genderOk && signOk;
  });

  function quickAddPerson() {
    const sign = SIGNS[Math.floor(Math.random()*SIGNS.length)];
    const ascendant = SIGNS[Math.floor(Math.random()*SIGNS.length)];
    const gender = ['uomo','donna','altro'][Math.floor(Math.random()*3)];
    const name = 'Nuova persona ' + (people.length + 1);
    const newPerson = {
      id:'p_'+Date.now(), name, sign, ascendant, gender, relation:'Da definire',
      status:'Nessuna informazione ancora raccolta su questa relazione.',
      dna:{ autonomia:50, fiducia:50, pressione:50, dialogo:50 },
      timeline:[{ date:'Ora', text:'Persona creata manualmente dalla lista Persone.' }]
    };
    setPeople(p => [newPerson, ...p]);
    showToast(`${name} aggiunta`);
  }
  function newAnalysisForPerson() {
    const p = people.find(x => x.id === currentPersonId);
    if (!p) return;
    setHomeInput(`Vorrei capire come comunicare meglio con ${p.name} (${p.sign}) riguardo alla situazione attuale: ${p.status}`);
    setHomeKnownSign(p.sign);
    setScreen('home');
    showToast(`Pronto per una nuova analisi su ${p.name}`);
  }

  /* ---------- Messaggi ---------- */
  async function analyzeMessage() {
    const text = msgInput.trim();
    if (!text) { showToast('Incolla prima un messaggio'); return; }
    setMsgLoading(true);
    try {
      const result = await callBackend('/api/analyze-message', { text });
      setMsgResult(result);
      showToast('Messaggio analizzato');
    } catch (e) {
      setMsgResult(mockMessageAnalysis());
      showToast('Errore: ' + e.message);
    }
    setMsgLoading(false);
  }

  async function changeTone(tone) {
    if (!msgResult) return;
    setMsgLoading(true);
    try {
      const result = await callBackend('/api/change-tone', { message: msgResult.improved, tone });
      setMsgResult(r => ({ ...r, improved: result.rewritten }));
      showToast('Tono aggiornato: ' + tone);
    } catch (e) {
      showToast('Errore: ' + e.message);
    }
    setMsgLoading(false);
  }

  /* ---------- Chat ---------- */
  async function analyzeChat() {
    const text = chatInput.trim();
    if (!text) { showToast('Incolla prima una conversazione'); return; }
    setChatLoading(true);
    try {
      const result = await callBackend('/api/analyze-chat', { text });
      setChatResult(result);
      showToast('Chat analizzata');
    } catch (e) {
      setChatResult(mockChatAnalysis());
      showToast('Errore: ' + e.message);
    }
    setChatLoading(false);
  }

  /* ---------- Coach ---------- */
  async function selectFollowup(kind) {
    setCoachFollowup(kind);
    setCoachLoading(true);
    try {
      const result = await callBackend('/api/coach-strategy', { followupType: kind, context: homeInput });
      setCoachStrategy(result.strategy);
    } catch (e) {
      const fallback = {
        risposto: 'Ottimo segnale. Rispondi con un tono naturale, senza affrettarti a chiudere il discorso.',
        visualizzato: 'Ha letto ma non ha risposto: probabilmente sta elaborando. Evita di scrivere di nuovo per alcune ore.',
        nonletto: 'Non ha ancora letto: resisti all\'impulso di controllare ripetutamente.',
        chiamato: 'Un buon segnale: mantieni un tono calmo, ascolta più di quanto parli.'
      };
      setCoachStrategy(fallback[kind]);
      showToast('Errore: ' + e.message);
    }
    setCoachLoading(false);
  }

  /* ============================================================
     RENDER
     ============================================================ */
  const phoneStyle = {
    width:390, maxWidth:'100%', height:844, maxHeight:'92vh',
    background:'#0b0c10', borderRadius:46, border:'10px solid #050505',
    boxShadow:'0 30px 80px rgba(0,0,0,0.6)', position:'relative', overflow:'hidden',
    display:'flex', flexDirection:'column', margin:'24px auto', fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color:'#f2f1ee'
  };

  const contentStyle = { padding:'4px 20px 24px 20px', flex:'1 1 auto', overflowY:'auto' };

  return (
    <div style={{ background:'#000', minHeight:'100vh', padding:'24px 12px', display:'flex', justifyContent:'center' }}>
      <div style={phoneStyle}>
        <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:120, height:26, background:'#050505', borderBottomLeftRadius:16, borderBottomRightRadius:16, zIndex:50 }}/>
        <div style={{ height:46, flex:'0 0 auto', display:'flex', alignItems:'flex-end', justifyContent:'space-between', padding:'0 26px 8px 26px', fontSize:13, fontWeight:600 }}>
          <span>9:41</span><span>●●●●  Wi-Fi  🔋</span>
        </div>

        {/* HOME */}
        {screen === 'home' && (
          <>
            <div style={{ padding:'18px 20px 10px 20px' }}>
              <div style={{ fontSize:28, fontWeight:800, letterSpacing:'0.02em', background:'linear-gradient(135deg, #8b7cf6, #d4af6a)', WebkitBackgroundClip:'text', backgroundClip:'text', color:'transparent' }}>Aura</div>
              <div style={{ color:'#a8a6b3', fontSize:13, marginBottom:14 }}>Dì la cosa giusta, nel momento giusto.</div>
              <ZodiacRibbon />
            </div>
            <div style={contentStyle}>
              <div style={{ fontSize:12.5, textTransform:'uppercase', letterSpacing:'0.06em', color:'#6b6976', fontWeight:700, marginBottom:10, marginTop:6 }}>Cosa sta succedendo?</div>
              <textarea rows={6} value={homeInput} onChange={e=>{ setHomeInput(e.target.value); setHomeKnownSign(''); }} placeholder="Raccontami cosa sta succedendo…"
                style={{ width:'100%', background:'#161821', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, color:'#f2f1ee', padding:16, fontSize:15, lineHeight:1.45, fontFamily:'inherit', resize:'none' }}/>
              <div style={{ display:'flex', gap:10, marginTop:10 }}>
                <Btn variant="secondary" onClick={()=>setHomeInput(EXAMPLE_TEXT)}>Esempio</Btn>
                <Btn variant="primary" onClick={analyzeSituation}>Analizza</Btn>
              </div>

              <div style={{ fontSize:12.5, textTransform:'uppercase', letterSpacing:'0.06em', color:'#6b6976', fontWeight:700, margin:'20px 0 10px 0' }}>Persone recenti</div>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {people.slice(0,2).map(p => <PersonRow key={p.id} p={p} onClick={()=>openPerson(p.id)} />)}
              </div>

              <div style={{ background:'linear-gradient(135deg, rgba(139,124,246,0.14), rgba(212,175,106,0.10))', border:'1px solid rgba(212,175,106,0.3)', borderRadius:22, padding:20, marginTop:20 }}>
                <div style={{ fontSize:15, fontWeight:800, color:'#d4af6a', marginBottom:6 }}>✦ Aura Companion</div>
                <div style={{ fontSize:13.5, fontStyle:'italic', color:'#a8a6b3', marginBottom:14, lineHeight:1.5 }}>"Rimango con te finché questa situazione non si risolve."</div>
                {['Follow-up nei giorni successivi','Memoria delle relazioni','Analisi chat avanzata','Simulazione risposta','Messaggi illimitati'].map(f => (
                  <div key={f} style={{ fontSize:13, display:'flex', alignItems:'center', gap:8, padding:'6px 0' }}><span style={{color:'#d4af6a'}}>•</span>{f}</div>
                ))}
                <Btn variant="gold" style={{ marginTop:14 }} onClick={()=>showToast('Aura Companion — presto disponibile')}>Scopri Aura Companion</Btn>
              </div>
            </div>
          </>
        )}

        {/* ANALISI */}
        {screen === 'analysis' && (
          <>
            <TopBar title="Analisi della situazione" onBack={()=>goTo('home')} />
            <div style={contentStyle}>
              {analysisLoading && !analysis && <Spinner/>}
              {analysis && (
                <>
                  <Card title="Riassunto" accent="violet">{analysis.summary}</Card>
                  <Card title="🔎 Cosa probabilmente sta succedendo">{analysis.whatsHappening}</Card>
                  <Card title="✅ Strategia consigliata" accent="emerald">{analysis.strategy}</Card>
                  <Card title="⚠️ Cosa evitare" accent="danger">{analysis.avoid}</Card>

                  <div style={{ fontSize:12.5, textTransform:'uppercase', letterSpacing:'0.06em', color:'#6b6976', fontWeight:700, margin:'8px 0 10px 0' }}>Messaggio consigliato</div>
                  <div style={{ background:'#0e2318', border:'1px solid rgba(79,184,138,0.35)', borderRadius:16, padding:16, fontSize:14.5, lineHeight:1.55, color:'#eafff3' }}>
                    {analysis.message}
                  </div>
                  {analysisLoading && <div style={{marginTop:8}}><Spinner/></div>}
                  <div style={{ display:'flex', gap:10, marginTop:10 }}>
                    <Btn variant="secondary" onClick={()=>copyText(analysis.message)}>Copia</Btn>
                    <Btn variant="ghost" onClick={improveMessage} disabled={analysisLoading}>Migliora messaggio</Btn>
                  </div>
                  <div style={{ display:'flex', gap:10, marginTop:20 }}>
                    <Btn variant="secondary" onClick={savePersonFromAnalysis}>Salva persona</Btn>
                    <Btn variant="primary" onClick={()=>goTo('coach')}>Vai al Coach</Btn>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* PERSONE */}
        {screen === 'people' && (
          <>
            <div style={{ padding:'18px 20px 10px 20px' }}><h1 style={{fontSize:20, margin:0, fontWeight:700}}>Persone</h1></div>
            <div style={contentStyle}>
              <div style={{ fontSize:11.5, textTransform:'uppercase', letterSpacing:'0.06em', color:'#6b6976', fontWeight:700, marginBottom:8 }}>Genere</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
                {['uomo','donna','altro'].map(g => (
                  <FilterChip key={g} label={g.charAt(0).toUpperCase()+g.slice(1)} active={genderFilter.includes(g)} onClick={()=>toggleGenderFilter(g)} />
                ))}
              </div>

              <div style={{ fontSize:11.5, textTransform:'uppercase', letterSpacing:'0.06em', color:'#6b6976', fontWeight:700, marginBottom:8 }}>Segno</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
                {SIGNS.map(s => (
                  <FilterChip key={s} label={ZODIAC_SYMBOLS[s] + ' ' + s} active={signFilter.includes(s)} onClick={()=>toggleSignFilter(s)} />
                ))}
              </div>

              {(genderFilter.length > 0 || signFilter.length > 0) && (
                <div onClick={()=>{ setGenderFilter([]); setSignFilter([]); }} style={{ fontSize:12.5, color:'#8b7cf6', fontWeight:700, cursor:'pointer', marginBottom:16 }}>
                  Cancella filtri
                </div>
              )}

              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {filteredPeople.length === 0 && (
                  <div style={{ textAlign:'center', padding:'30px 20px', color:'#6b6976', fontSize:13.5 }}>Nessuna persona corrisponde ai filtri</div>
                )}
                {filteredPeople.map(p => <PersonRow key={p.id} p={p} onClick={()=>openPerson(p.id)} />)}
              </div>
              <div onClick={quickAddPerson} style={{ display:'flex', alignItems:'center', gap:10, justifyContent:'center', padding:14, border:'1px dashed rgba(255,255,255,0.08)', borderRadius:16, color:'#a8a6b3', fontSize:13.5, fontWeight:600, cursor:'pointer', marginTop:12 }}>
                + Aggiungi persona
              </div>
            </div>
            <BottomNav active="people" onNavigate={goTo} />
          </>
        )}

        {/* PERSON DETAIL */}
        {screen === 'personDetail' && (() => {
          const p = people.find(x => x.id === currentPersonId);
          if (!p) return null;
          const dims = [
            { key:'autonomia', label:'Autonomia' },
            { key:'fiducia', label:'Fiducia' },
            { key:'pressione', label:'Pressione percepita' },
            { key:'dialogo', label:'Disponibilità al dialogo' }
          ];
          return (
            <>
              <TopBar title={p.name} onBack={()=>goTo('people')} />
              <div style={contentStyle}>
                <div style={{ display:'flex', gap:14, alignItems:'center', marginBottom:18 }}>
                  <div style={{ width:60, height:60, borderRadius:'50%', background:'linear-gradient(135deg, #8b7cf6, #d4af6a)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:22, color:'#0b0c10' }}>{p.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      <div style={{ display:'inline-flex', background:'#1c1f2b', border:'1px solid rgba(212,175,106,0.3)', borderRadius:999, padding:'6px 12px', fontSize:12.5, fontWeight:600, color:'#d4af6a' }}>{ZODIAC_SYMBOLS[p.sign] || '✦'} {p.sign}</div>
                      {p.ascendant && (
                        <div style={{ display:'inline-flex', background:'#1c1f2b', border:'1px solid rgba(139,124,246,0.3)', borderRadius:999, padding:'6px 12px', fontSize:12.5, fontWeight:600, color:'#c9bfff' }}>{ZODIAC_SYMBOLS[p.ascendant] || '✦'} Asc. {p.ascendant}</div>
                      )}
                    </div>
                    <div style={{ fontSize:12.5, color:'#a8a6b3', marginTop:6 }}>{p.relation}{p.gender ? ' · ' + p.gender.charAt(0).toUpperCase()+p.gender.slice(1) : ''}</div>
                  </div>
                </div>
                <Card title="Stato relazione">{p.status}</Card>
                <div style={{ fontSize:12.5, textTransform:'uppercase', letterSpacing:'0.06em', color:'#6b6976', fontWeight:700, margin:'20px 0 10px 0' }}>Relationship DNA</div>
                <div style={{ background:'#161821', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:16 }}>
                  {dims.map(d => (
                    <div key={d.key} style={{ marginBottom:12 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12.5, color:'#a8a6b3', marginBottom:6, fontWeight:600 }}>
                        <span>{d.label}</span><span>{p.dna[d.key]}%</span>
                      </div>
                      <div style={{ height:8, borderRadius:6, background:'#1c1f2b', overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${p.dna[d.key]}%`, borderRadius:6, background:'linear-gradient(90deg, #8b7cf6, #d4af6a)' }}/>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize:12.5, textTransform:'uppercase', letterSpacing:'0.06em', color:'#6b6976', fontWeight:700, margin:'20px 0 10px 0' }}>Timeline eventi</div>
                <div style={{ background:'#161821', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:16 }}>
                  <div style={{ position:'relative', paddingLeft:18 }}>
                    <div style={{ position:'absolute', left:4, top:4, bottom:4, width:2, background:'rgba(255,255,255,0.08)' }}/>
                    {p.timeline.map((t,i) => (
                      <div key={i} style={{ position:'relative', paddingBottom: i===p.timeline.length-1 ? 0 : 16 }}>
                        <div style={{ position:'absolute', left:-18, top:3, width:9, height:9, borderRadius:'50%', background:'#8b7cf6', boxShadow:'0 0 0 3px rgba(139,124,246,0.2)' }}/>
                        <div style={{ fontSize:11.5, color:'#6b6976', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em' }}>{t.date}</div>
                        <div style={{ fontSize:14, color:'#f2f1ee', marginTop:2 }}>{t.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <Btn variant="primary" style={{ marginTop:20 }} onClick={newAnalysisForPerson}>Nuova analisi su questa persona</Btn>
              </div>
            </>
          );
        })()}

        {/* MESSAGGI */}
        {screen === 'messages' && (
          <>
            <div style={{ padding:'18px 20px 10px 20px' }}><h1 style={{fontSize:20, margin:0, fontWeight:700}}>Messaggi</h1></div>
            <div style={contentStyle}>
              <div style={{ fontSize:12.5, textTransform:'uppercase', letterSpacing:'0.06em', color:'#6b6976', fontWeight:700, marginBottom:10 }}>Incolla un messaggio</div>
              <textarea rows={5} value={msgInput} onChange={e=>setMsgInput(e.target.value)} placeholder="Incolla qui il messaggio da analizzare…"
                style={{ width:'100%', background:'#161821', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, color:'#f2f1ee', padding:16, fontSize:15, lineHeight:1.45, fontFamily:'inherit', resize:'none' }}/>
              <Btn variant="primary" style={{ marginTop:12 }} onClick={analyzeMessage} disabled={msgLoading}>Analizza messaggio</Btn>

              {msgLoading && !msgResult && <div style={{marginTop:16}}><Spinner/></div>}

              {msgResult && (
                <div style={{ marginTop:20 }}>
                  <Card title="Come potrebbe essere percepito">{msgResult.perceived}</Card>
                  <Card title="Rischio di fraintendimento">
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:10, height:10, borderRadius:'50%', background: msgResult.risk==='alto' ? '#e0748a' : msgResult.risk==='medio' ? '#d4af6a' : '#4fb88a' }}/>
                      <div style={{ fontWeight:700 }}>Rischio {msgResult.risk}</div>
                    </div>
                  </Card>
                  <div style={{ fontSize:12.5, textTransform:'uppercase', letterSpacing:'0.06em', color:'#6b6976', fontWeight:700, margin:'8px 0 10px 0' }}>Versione migliorata</div>
                  <div style={{ background:'#0e2318', border:'1px solid rgba(79,184,138,0.35)', borderRadius:16, padding:16, fontSize:14.5, lineHeight:1.55, color:'#eafff3' }}>
                    {msgResult.improved}
                  </div>
                  {msgLoading && <div style={{marginTop:8}}><Spinner/></div>}
                  <Btn variant="secondary" style={{ marginTop:10 }} onClick={()=>copyText(msgResult.improved)}>Copia</Btn>

                  <div style={{ fontSize:12.5, textTransform:'uppercase', letterSpacing:'0.06em', color:'#6b6976', fontWeight:700, margin:'20px 0 10px 0' }}>Cambia tono</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {['dolce','diretto','breve','sicuro'].map(t => (
                      <Btn key={t} variant="secondary" style={{ padding:'9px 14px', fontSize:12.5 }} onClick={()=>changeTone(t)} disabled={msgLoading}>
                        {t==='dolce'?'Più dolce':t==='diretto'?'Più diretto':t==='breve'?'Più breve':'Più sicuro'}
                      </Btn>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <BottomNav active="messages" onNavigate={goTo} />
          </>
        )}

        {/* CHAT */}
        {screen === 'chat' && (
          <>
            <div style={{ padding:'18px 20px 10px 20px' }}><h1 style={{fontSize:20, margin:0, fontWeight:700}}>Chat</h1></div>
            <div style={contentStyle}>
              <div style={{ fontSize:12.5, textTransform:'uppercase', letterSpacing:'0.06em', color:'#6b6976', fontWeight:700, marginBottom:10 }}>Incolla una conversazione</div>
              <textarea rows={6} value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Incolla qui la chat da analizzare…"
                style={{ width:'100%', background:'#161821', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, color:'#f2f1ee', padding:16, fontSize:15, lineHeight:1.45, fontFamily:'inherit', resize:'none' }}/>
              <Btn variant="primary" style={{ marginTop:12 }} onClick={analyzeChat} disabled={chatLoading}>Analizza chat</Btn>

              {chatLoading && !chatResult && <div style={{marginTop:16}}><Spinner/></div>}

              {chatResult && (
                <div style={{ marginTop:20 }}>
                  <Card title="Chi investe di più">{chatResult.invest}</Card>
                  <Card title="Segnali positivi" accent="emerald">{chatResult.positive}</Card>
                  <Card title="Segnali di distanza" accent="danger">{chatResult.distance}</Card>
                  <Card title="Cosa fare ora" accent="violet">{chatResult.nextstep}</Card>
                </div>
              )}
            </div>
            <BottomNav active="chat" onNavigate={goTo} />
          </>
        )}

        {/* COACH */}
        {screen === 'coach' && (
          <>
            <div style={{ padding:'18px 20px 10px 20px' }}><h1 style={{fontSize:20, margin:0, fontWeight:700}}>✦ Coach</h1></div>
            <div style={contentStyle}>
              <Card title="Stato attuale" accent="violet">
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <div style={{ width:9, height:9, borderRadius:'50%', background:'#4fb88a', boxShadow:'0 0 0 4px rgba(79,184,138,0.18)' }}/>
                  <span style={{ fontWeight:700 }}>In attesa di risposta</span>
                </div>
                Hai inviato un messaggio recentemente e sei in una fase di attesa. È normale sentirsi in ansia in questo momento, ma agire con calma ora paga nel tempo.
              </Card>
              <Card title="Prossima azione consigliata">
                Non inviare altri messaggi per almeno qualche ora. Nel frattempo, dedicati a qualcosa che ti distragga.
              </Card>

              <div style={{ fontSize:12.5, textTransform:'uppercase', letterSpacing:'0.06em', color:'#6b6976', fontWeight:700, margin:'20px 0 10px 0' }}>Cosa è successo dopo?</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  { key:'risposto', label:'Ha risposto' },
                  { key:'visualizzato', label:'Ha visualizzato' },
                  { key:'nonletto', label:'Non ha letto' },
                  { key:'chiamato', label:'Mi ha chiamato' }
                ].map(f => (
                  <button key={f.key} onClick={()=>selectFollowup(f.key)} style={{
                    background: coachFollowup===f.key ? 'rgba(139,124,246,0.15)' : '#161821',
                    border: coachFollowup===f.key ? '1px solid #8b7cf6' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius:16, padding:'14px 10px', color:'#f2f1ee', fontSize:13, fontWeight:700, cursor:'pointer', textAlign:'center'
                  }}>{f.label}</button>
                ))}
              </div>

              {coachLoading && <div style={{marginTop:16}}><Spinner/></div>}
              {coachStrategy && !coachLoading && (
                <Card title="Strategia aggiornata" accent="gold">{coachStrategy}</Card>
              )}
            </div>
            <BottomNav active="coach" onNavigate={goTo} />
          </>
        )}

        {screen === 'home' && <BottomNav active="home" onNavigate={goTo} />}
        {screen === 'analysis' && null}

        <Toast text={toast} />
      </div>
    </div>
  );
}

function TopBar({ title, onBack }) {
  return (
    <div style={{ padding:'18px 20px 10px 20px', display:'flex', alignItems:'center', gap:12 }}>
      <button onClick={onBack} style={{ width:34, height:34, borderRadius:'50%', background:'#161821', border:'1px solid rgba(255,255,255,0.08)', color:'#f2f1ee', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, cursor:'pointer' }}>←</button>
      <h1 style={{ fontSize:20, margin:0, fontWeight:700 }}>{title}</h1>
    </div>
  );
}

function ZodiacRibbon() {
  return (
    <div style={{
      display:'flex', gap:0, justifyContent:'space-between',
      padding:'10px 2px', borderTop:'1px solid rgba(255,255,255,0.06)', borderBottom:'1px solid rgba(255,255,255,0.06)',
      opacity:0.55
    }}>
      {SIGNS.map(s => (
        <span key={s} title={s} style={{ fontSize:13, color:'#d4af6a', lineHeight:1 }}>{ZODIAC_SYMBOLS[s]}</span>
      ))}
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <div onClick={onClick} style={{
      padding:'7px 13px', borderRadius:999, fontSize:12.5, fontWeight:600, cursor:'pointer',
      background: active ? 'rgba(139,124,246,0.18)' : '#161821',
      border: active ? '1px solid #8b7cf6' : '1px solid rgba(255,255,255,0.08)',
      color: active ? '#c9bfff' : '#a8a6b3',
      transition:'all 0.15s ease'
    }}>{label}</div>
  );
}

function PersonRow({ p, onClick }) {
  return (
    <div onClick={onClick} style={{ display:'flex', alignItems:'center', gap:12, background:'#161821', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'12px 14px', cursor:'pointer' }}>
      <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg, #8b7cf6, #d4af6a)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:16, color:'#0b0c10' }}>{p.name.charAt(0).toUpperCase()}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:15, fontWeight:700 }}>{p.name}</div>
        <div style={{ fontSize:12.5, color:'#a8a6b3', marginTop:2 }}>{ZODIAC_SYMBOLS[p.sign] || ''} {p.sign} · {p.relation}</div>
      </div>
      <div style={{ color:'#6b6976', fontSize:18 }}>›</div>
    </div>
  );
}
