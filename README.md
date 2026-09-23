# Aura — Frontend

Coach di comunicazione per le relazioni: racconti la situazione, Aura usa il segno zodiacale
come lente interpretativa e restituisce analisi + messaggio pronto da inviare.
Vite + React 18, nessuna libreria UI. Interfaccia in italiano e inglese.

## Avvio in locale

```bash
npm install
cp .env.example .env      # opzionale
npm run dev               # http://localhost:5173
npm run build && npm run preview   # build di produzione su http://localhost:4173
```

## Variabili d'ambiente

| Variabile | Default | Note |
|---|---|---|
| `VITE_BACKEND_URL` | `https://aura-backend-icox.onrender.com` | URL del backend, senza slash finale. Viene letta **al momento della build**. |

## Struttura

- `src/AuraApp.jsx` — stato dell'app e schermate
- `src/i18n.js` — dizionari `it` / `en` (tutti i testi visibili), segni, helper
- `src/api.js` — client del backend (contratto v2: `lang` su ogni chiamata, timeout 30 s, warm-up `/api/health`)
- `src/data.js` — persone di esempio, salvataggio in localStorage, risposte di riserva offline (via motore)
- `src/engine/` — motore offline (situazione + segno + banca frasi). **Generato** da `aura-engine/sync.mjs`,
  tranne `loader.js` (carica ogni `data/signs/<segno>.json` come chunk lazy separato)
- `src/ui.jsx`, `src/sheets.jsx` — componenti e pannelli (segno, persona, privacy)
- `src/styles.css` — design system
- `public/` — favicon e manifest PWA

Lingua: rilevata da `navigator.language` (it* → italiano, altrimenti inglese),
selettore IT/EN in alto, scelta salvata nel browser.
Persone, timeline e il tuo segno restano solo sul dispositivo (localStorage).

## Deploy su Render

Il file `render.yaml` definisce uno Static Site:

- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Rewrite `/*` → `/index.html` (SPA)
- Env var `VITE_BACKEND_URL`

Da dashboard: **New → Blueprint** sul repository, oppure **New → Static Site** con gli stessi
valori. Se cambi `VITE_BACKEND_URL` serve un nuovo deploy (è incorporata nella build).

Il backend sul piano gratuito di Render si addormenta: l'app lo "sveglia" all'apertura e,
se non risponde in tempo, mostra una risposta di riserva con il badge "Modalità offline".

## Motore offline e contenuti

Senza backend (o con backend senza AI) le analisi e il coach usano il motore in `src/engine/`:
risposte specifiche per segno × situazione (24 situazioni, 12 segni + neutro, IT/EN).
"Un'altra versione" ripete l'analisi con un nuovo `seed`.
I contenuti si modificano **solo** in `/home/claude/aura-engine` (mai qui):

```bash
cd ../aura-engine
# modifica data/signs/<segno>.json (vedi SPEC.md)
npm run validate && npm test
npm run sync          # copia motore + JSON in aura-backend/engine e aura-frontend/src/engine
```
