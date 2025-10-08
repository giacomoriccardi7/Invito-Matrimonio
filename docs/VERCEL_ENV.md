# Configurazione Environment su Vercel (Frontend)

Su Vercel hai tre ambienti:
- Development: locale, usa `.env.development`.
- Preview: per ogni PR (Branch Deploy).
- Production: su `main` (o branch configurato).

## Variabili necessarie
- `VITE_BACKEND_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Impostazioni
1. Vai su Project Settings → Environment Variables.
2. Crea le variabili duplicate per `Preview` e `Production` (opzionale anche per `Development` se usi Vercel CLI).

### Esempi
- Production
  - `VITE_BACKEND_URL=https://api.tuodominio.com`
  - `VITE_SUPABASE_URL=https://your-prod-supabase.supabase.co`
  - `VITE_SUPABASE_ANON_KEY=prod-anon-key`
- Preview
  - `VITE_BACKEND_URL=https://api-preview.tuodominio.com` (o Render service in preview)
  - `VITE_SUPABASE_URL=https://your-preview-supabase.supabase.co`
  - `VITE_SUPABASE_ANON_KEY=preview-anon-key`

## Note
- Ricostruisci (`Redeploy`) dopo aver cambiato variabili.
- Assicurati che il backend consenta CORS dal dominio Vercel (set `CORS_ORIGIN`).
- Usa domini custom su Vercel per separare chiaramente preview/prod se possibile.