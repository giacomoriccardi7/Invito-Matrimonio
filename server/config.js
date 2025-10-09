const config = {
  port: process.env.PORT || 3001,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  google: {
    sheetId: process.env.GOOGLE_SHEET_ID,
    keyFile: process.env.GOOGLE_KEY_FILE || 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 465),
    secure: String(process.env.EMAIL_SECURE || 'true') === 'true',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    recipient: process.env.RECIPIENT_EMAIL,
    resendApiKey: process.env.RESEND_API_KEY,
    resendFrom: process.env.RESEND_FROM || 'onboarding@resend.dev'
  },
  sheets: {
    range: process.env.GOOGLE_SHEET_RANGE || 'Sheet1!A:H',
    valueInputOption: 'USER_ENTERED'
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
  }
};

function validateConfig() {
  const missing = [];
  if (!config.google.sheetId) missing.push('GOOGLE_SHEET_ID');
  const hasSMTP = Boolean(config.email.host && config.email.user && config.email.pass);
  const hasResend = Boolean(config.email.resendApiKey);
  if (!hasSMTP && !hasResend) {
    // Richiedi almeno un provider email: SMTP o Resend
    if (!config.email.host) missing.push('EMAIL_HOST');
    if (!config.email.user) missing.push('EMAIL_USER');
    if (!config.email.pass) missing.push('EMAIL_PASS');
    if (!config.email.resendApiKey) missing.push('RESEND_API_KEY');
  }
  if (!config.email.recipient) missing.push('RECIPIENT_EMAIL');
  if (!config.supabase.url) missing.push('SUPABASE_URL');
  if (!config.supabase.anonKey) missing.push('SUPABASE_ANON_KEY');
  if (missing.length) {
    console.warn('[config] Variabili mancanti:', missing.join(', '));
  }
}

validateConfig();

module.exports = config;