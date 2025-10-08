# Sicurezza e gestione dei segreti

Queste linee guida aiutano a evitare la pubblicazione accidentale di segreti.

## Principi chiave
- Non committare mai file di segreti: `.env`, `server/.env`, `server/credentials.json`.
- Non committare artefatti di build (`dist/`): la build deve essere eseguita dalla piattaforma (Vercel/Netlify/Render).
- Le credenziali del Service Account Google devono esistere **solo** nel backend, come Secret File o variabili ambientali.
- Nel frontend usare esclusivamente variabili `VITE_*`.

## Rotazione delle chiavi
Se un segreto finisce nel repository (anche solo per errore), **ruota immediatamente** la chiave:
1. Google Cloud Console → IAM & Admin → Service Accounts → Keys.
2. Genera una nuova chiave (`JSON`) e conserva il file in un luogo sicuro sul backend.
3. Elimina la chiave precedente.
4. Aggiorna la variabile `GOOGLE_KEY_FILE` se necessario.

## Controlli
- Il workflow CI in `.github/workflows/prevent-dist-and-secrets.yml` fallisce la build se:
  - `dist/` è presente nel commit.
  - Esistono pattern di segreti in `src/`, `public/`, `dist/`, `index.html`.

## Pulizia della storia (opzionale)
Se `dist/` o un segreto sono stati committati in passato, valuta la rimozione dalla storia con `git filter-repo` o BFG, quindi force-push.