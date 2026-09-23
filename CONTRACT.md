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
| /api/analyze-situation | `{text, knownSign?, userSign?, seed?, lang}` | `{summary, whatsHappening, strategy, avoid, message, detectedSign, situation, relation, pairing}` (detectedSign = id canonico o "") |
| /api/improve-message | `{message, context?, lang}` | `{improved}` |
| /api/analyze-message | `{text, lang}` | `{perceived, risk, improved}` |
| /api/change-tone | `{message, tone, lang}` | `{rewritten}` |
| /api/analyze-chat | `{text, lang}` | `{invest, positive, distance, nextstep}` |
| /api/coach-strategy | `{followupType, context?, sign?, seed?, lang}` | `{strategy}` |

### Campi aggiunti (v2.1, retrocompatibili)
- `userSign` (opzionale): segno dell'utente (id o nome IT/EN). Serve per `pairing`.
- `seed` (opzionale, numero o stringa ≤64): variante della risposta offline. Stesso testo + stesso seed = stessa risposta; seed diverso = "un'altra versione". Con l'AI attiva, un seed non nullo aggiunge al prompt un suggerimento di variazione (angolo diverso, parole nuove); seed assente/0 = risposta standard.
- `sign` su coach-strategy (opzionale, id o nome IT/EN): segno dell'altra persona, per una strategia calibrata (mock: banca coach del segno; AI: tratti del segno nel prompt). Anche `seed` è accettato.
- Risposta di analyze-situation, sempre presenti (anche con AI):
  - `situation`: una delle 24 situazioni canoniche (`fight jealousy_control silence_ghosting coldness_distance ex_back breakup betrayal apology first_move new_relationship commitment_future cohabitation money family_boundaries parent_child friendship_rift work_conflict asking_need hard_feedback support_hard_time neglect_attention affection_closeness disagreement_decision reconnect`)
  - `relation`: `partner | ex | crush | friend | family | work | unknown`
  - `pairing`: una frase sulla dinamica tra gli elementi del segno dell'utente e dell'altra persona, oppure `""` se uno dei due segni non è noto.
- `strategy` può contenere un secondo paragrafo separato da `\n\n` (chiave del segno): il client lo mostra con `white-space: pre-line`.
- Con l'AI attiva, il backend aggiunge al prompt la situazione rilevata e i tratti del segno (dal motore offline) come contesto.

GET `/api/health` → `{status:"ok", version:"2.0.0", ai:boolean, model}`

Errori: 400 `{error, code:"bad_request"}` · 429 `{error, code:"rate_limited"}` · testo max 6000 caratteri.
