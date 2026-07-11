# Aura Frontend

L'app Aura come sito web vero — non più dentro un artifact, ma con un
indirizzo pubblico raggiungibile da qualsiasi browser, incluso Safari
su iPhone.

Si collega al backend già pubblicato su:
https://aura-backend-icox.onrender.com

## Come pubblicarlo su Render (stessa procedura del backend)

1. Carica tutti questi file su un nuovo repository GitHub,
   ad esempio chiamato `aura-frontend`

2. Su Render (dashboard.render.com):
   - Clicca "New" → questa volta scegli **"Static Site"**
     (non "Web Service" come per il backend)
   - Collega il repository `aura-frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Clicca "Create Static Site"

3. Dopo 2-3 minuti avrai un indirizzo pubblico tipo:
   `https://aura-frontend-xxxx.onrender.com`

4. Apri quell'indirizzo da Safari su iPhone — è la vera app,
   accessibile da chiunque abbia il link.

## Nota tecnica

A differenza del backend (che è un "Web Service" perché deve girare
un server sempre attivo), il frontend è un "Static Site": Vite lo
trasforma in file HTML/CSS/JS pronti, che Render serve direttamente
senza bisogno di un server Node.js dedicato — più veloce e gratuito
senza limiti di "spin down".
