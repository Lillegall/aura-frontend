# Aura — contratto API condiviso (v2)

Base URL: `VITE_BACKEND_URL` (default `https://aura-backend-icox.onrender.com`).

Ogni POST accetta `lang: "it" | "en"` (default `"it"`). Tutto il testo generato torna nella lingua richiesta.
Ogni risposta può includere `mock: true` quando l'AI non è disponibile (niente chiave, errore, timeout): la risposta è comunque valida e localizzata.

## Identificativi canonici
- Segni: `aries taurus gemini cancer leo virgo libra scorpio sagittarius capricorn aquarius pisces`
- Rischio: `low | medium | high`
- Toni: `sweet | direct | short | confident`
- Follow-up: `replied | seen | unread | called` (il backend accetta anche i vecchi `risposto visualizzato nonletto chiamato`)

## Endpoint
| POST | body | risposta |
|---|---|---|
| /api/analyze-situation | `{text, knownSign?, lang}` | `{summary, whatsHappening, strategy, avoid, message, detectedSign}` (detectedSign = id canonico o "") |
| /api/improve-message | `{message, context?, lang}` | `{improved}` |
| /api/analyze-message | `{text, lang}` | `{perceived, risk, improved}` |
| /api/change-tone | `{message, tone, lang}` | `{rewritten}` |
| /api/analyze-chat | `{text, lang}` | `{invest, positive, distance, nextstep}` |
| /api/coach-strategy | `{followupType, context?, lang}` | `{strategy}` |

GET `/api/health` → `{status:"ok", version:"2.0.0", ai:boolean, model}`

Errori: 400 `{error, code:"bad_request"}` · 429 `{error, code:"rate_limited"}` · testo max 6000 caratteri.
