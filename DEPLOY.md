# Deploy – Invito Matrimonio

Questa guida descrive come pubblicare online frontend (Vite/React) e backend (Node/Express) in modo chiaro e ripetibile.

## Panoramica
- Frontend: static site build (`vite build`) da pubblicare su Netlify/Vercel/Render static.
- Backend: Node/Express su Render/VPS, espone API su `/api/*`.
- Il frontend punta al backend via `VITE_BACKEND_URL`.

## Prerequisiti
- Account su un host (Netlify/Vercel/Render) per il frontend.
- Account su Render/VPS per il backend Node.
- Supabase progetto e chiavi (URL, ANON o SERVICE ROLE).
- Google Sheets: sheet id e credenziali service account JSON (caricato come file nel backend).
 - Email provider per RSVP: SMTP (es. Gmail con App Password) oppure Resend API.

## Configurazione Variabili
### Frontend (`.env`)
Crea `.env` usando `.env.example`:
```
VITE_BACKEND_URL=https://<backend-host>
VITE_SUPABASE_URL=https://<supabase-url>
VITE_SUPABASE_ANON_KEY=<anon_key>
```

### Backend (`server/.env`)
Crea `server/.env` usando `server/.env.example` e carica il file delle credenziali Google (`credentials.json`) nel backend:
```
PORT=3001
CORS_ORIGIN=https://<frontend-host>
GOOGLE_SHEET_ID=<id>
GOOGLE_KEY_FILE=credentials.json
GOOGLE_SHEET_RANGE=Sheet1!A:H
## Opzione A: SMTP (Gmail consigliato con App Password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=<email>
EMAIL_PASS=<app_password>

## Opzione B: Resend (fallback o sostituto di SMTP)
RESEND_API_KEY=<resend_api_key>
RESEND_FROM="RSVP Wedding <onboarding@resend.dev>"

## Destinatario per notifiche RSVP
RECIPIENT_EMAIL=<destinatario>
SUPABASE_URL=https://<supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

Note:
- È sufficiente configurare uno tra SMTP o Resend. Se SMTP fallisce (es. timeout su Render), il backend usa automaticamente Resend come fallback se `RESEND_API_KEY` è impostata.
- `RESEND_FROM` può essere `onboarding@resend.dev` (senza verifica dominio) oppure un mittente del tuo dominio dopo verifica su Resend.

## Build Frontend
Da root progetto:
```
npm run build
```
Output in `dist/`.

## Deploy Frontend
- Netlify: imposta build `npm run build`, publish dir `dist`. Variabili env come sopra.
- Vercel: framework Vite, build `vite build` o `npm run build`, output `dist`. Variabili env.
- Render (Static): Build `npm run build`, Publish `dist`.

Ricorda di aggiornare `VITE_BACKEND_URL` con l’URL pubblico del backend.

## Deploy Backend (Render consigliato)
- Create New Web Service
- Repository: cartella `server/`
- Runtime: Node
- Start Command: `node index.cjs`
- Environment: `server/.env` variabili
- Add file `credentials.json` (Google) come Secret File e referenziarlo con `GOOGLE_KEY_FILE=credentials.json`
- Port: auto, Render usa `PORT` env. Assicurati CORS: `CORS_ORIGIN=https://<frontend-host>`.
 - Aggiungi variabili email:
   - Se SMTP: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASS`
   - Se Resend: `RESEND_API_KEY`, `RESEND_FROM` (opzionale)
   - Sempre: `RECIPIENT_EMAIL`

### Health Check
- Imposta `healthCheckPath: /healthz` in `render.yaml` o nel pannello di Render.
- L'endpoint `GET /healthz` risponde con JSON e stato `ok` se il server è attivo e le variabili principali sono impostate.

### Rotte esposte
- `GET /api/memories` – lista ricordi
- `GET /api/memories/live` – ricordi approvati
- `GET /api/memories/events` – SSE
- `POST /api/memories/upload` – upload file
- `POST /api/rsvp` – salva su Sheets + email
- `GET /api/moderation/*` – moderazione (standby)

## Verifica Post-Deploy
- Apri frontend pubblico e prova form RSVP.
- Controlla email ricevuta e riga aggiunta su Google Sheet.
- Verifica SSE e gallery se attivate.
- Controlla console del backend per CORS e errori.
 - Verifica health check: apri `https://<backend-host>/healthz` e controlla che risponda con `{ status: "ok" }`.
 - Verifica provider email: chiama `GET https://<backend-host>/api/email/verify` e attendi `{ ok: true }`. Se SMTP non è disponibile ma `RESEND_API_KEY` è impostata, la verifica usa Resend.

## Troubleshooting
- 4xx al `/api/rsvp`: controlla validazione campi e `GOOGLE_SHEET_RANGE`.
- 5xx: verifica credenziali Google o SMTP.
- CORS: imposta `CORS_ORIGIN` corretto.
- Supabase error: verifica `SUPABASE_URL` e chiave.
 - Email timeout su Render: configura `RESEND_API_KEY` per usare l’invio via API come fallback.

## Aggiornamenti
Per nuove modifiche:
1. Aggiorna codice.
2. Ricostruisci frontend e redeploy.
3. Riavvia backend con nuovo start command già configurato (`node index.cjs`).
