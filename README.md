# Invito Matrimonio – Frontend & Backend

Progetto completo per invito matrimonio con frontend (Vite/React) e backend (Node/Express). Include upload ricordi su Supabase, RSVP con Google Sheets + Email, e live feed via SSE.

## Requisiti
- Node 18+
- Account Supabase
- Google Service Account (Sheets)
- SMTP per email RSVP
 - Resend (opzionale) per email RSVP in produzione

## Struttura
- `src/` Frontend React
- `server/` Backend Express
- `supabase/` Migrazioni e metadata
- `docs/` Guide (Vercel env)

## Setup rapido
1. Clona o crea repo GitHub
2. Frontend: copia `.env.development.example` in `.env.development` e `.env.production.example` in `.env.production` (solo locale, non committato). In produzione configura le stesse variabili nella piattaforma di deploy.
   - In sviluppo: `VITE_BACKEND_URL=http://localhost:3001`
   - In produzione: `VITE_BACKEND_URL=https://invito-matrimonio.onrender.com` (Render Web Service)
   - `VITE_SUPABASE_URL=...`
   - `VITE_SUPABASE_ANON_KEY=...`
3. Backend: crea `server/.env` con variabili da `server/.env.example` e aggiungi `server/credentials.json` (Google)
4. Installazione dipendenze:
   - Frontend: `npm install`
   - Backend: `cd server && npm install`

## Comandi
- Sviluppo frontend: `npm run dev`
- Build frontend: `npm run build`
- Preview produzione: `npm run preview`
- Avvio backend: `cd server && npm start`

## Variabili ambiente
Frontend (Vite):
- `VITE_BACKEND_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Backend:
- `PORT`, `CORS_ORIGIN`
- `GOOGLE_SHEET_ID`, `GOOGLE_KEY_FILE`, `GOOGLE_SHEET_RANGE`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASS`, `RECIPIENT_EMAIL`
 - `RESEND_API_KEY`, `RESEND_FROM` (fallback/alternativa a SMTP)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` o `SUPABASE_ANON_KEY`

## Deploy
Vedi `DEPLOY.md` per una guida completa. Per Vercel (frontend) consulta `docs/VERCEL_ENV.md`.

Backend su Render:
- Service name: `invito-matrimonio`
- URL: `https://invito-matrimonio.onrender.com`

## Sicurezza
- `.gitignore` esclude `.env`, `server/.env`, `server/credentials.json`, directory temporanee Supabase.
- Non committare chiavi reali.
- Non committare `dist/`: lascia che la piattaforma di deploy esegua la build.
- Vedi `docs/SECURITY.md` per dettagli e rotazione chiavi.

## .env.production (solo locale)
- Crea `./.env.production` solo in locale (mai committato). Usa come riferimento `./.env.production.example`.
- Variabili richieste:
  - `VITE_BACKEND_URL=https://invito-matrimonio.onrender.com`
  - `VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co`
  - `VITE_SUPABASE_ANON_KEY=<la_tua_anon_key>`
- In produzione, imposta le stesse variabili nella piattaforma di deploy (Vercel/Netlify/Render) nella sezione Environment Variables.
- Verifica localmente con `npm run build` che le variabili siano lette correttamente.

## Note
- Alcuni bundle superano 500 kB: valuta code splitting o ottimizzazione immagini.