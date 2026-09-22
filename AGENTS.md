# Sistema di agenti Aura

| Agente | Ruolo | Tocca |
|---|---|---|
| aura-backend | API bilingue, prompt, sicurezza | aura-backend/ |
| aura-frontend | UI, i18n IT/EN, persistenza | aura-frontend/ |
| aura-qa | build, test API, e2e IT/EN | solo lettura + qa/ |
| aura-release | deploy Render, checklist lancio | config e docs |

Flusso: backend ∥ frontend (entrambi vincolati da CONTRACT.md) → qa → fix → release.
Per riusarli in Claude Code: copia `.claude/agents/` nella cartella che contiene i due repo e chiedi ad es. "usa aura-qa per verificare la build".
