const { google } = require('googleapis');
const fs = require('fs');
const config = require('../config');

// Cache per ridurre la latenza: evita rilettura credenziali e ri-autenticazione
let cachedCredentials = null;
let cachedJwt = null;
let cachedSheets = null;

function readServiceAccountCredentials() {
  if (cachedCredentials) return cachedCredentials;
  try {
    const raw = fs.readFileSync(config.google.keyFile, 'utf8');
    const json = JSON.parse(raw);
    const { client_email, private_key } = json || {};
    if (!client_email || !private_key) {
      throw new Error('Credenziali Google non valide');
    }
    cachedCredentials = { client_email, private_key };
    return cachedCredentials;
  } catch (err) {
    console.warn('[GoogleAuth] Impossibile leggere le credenziali dal file:', err?.message || err);
    return null;
  }
}

async function getSheetsClient() {
  if (cachedSheets) return cachedSheets;
  const credentials = readServiceAccountCredentials();
  if (!credentials || !credentials.client_email || !credentials.private_key) {
    throw {
      type: 'config_error',
      message: 'File credenziali Google mancante o non valido',
      hint: `Assicurati che '${config.google.keyFile}' esista e contenga 'client_email' e 'private_key'. Aggiorna GOOGLE_KEY_FILE se necessario.`,
      details: { keyFile: config.google.keyFile }
    };
  }
  try {
    cachedJwt = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: config.google.scopes,
    });
    await cachedJwt.authorize();
    cachedSheets = google.sheets({ version: 'v4', auth: cachedJwt });
    return cachedSheets;
  } catch (e) {
    // Reset cache su errore di auth
    cachedJwt = null;
    cachedSheets = null;
    throw e;
  }
}

function assertSheetsConfig() {
  if (!config.google.sheetId) {
    throw { type: 'config_error', message: 'GOOGLE_SHEET_ID mancante', hint: 'Imposta GOOGLE_SHEET_ID in server/.env' };
  }
  if (!config.sheets.range || !config.sheets.range.includes('!')) {
    throw { type: 'range_error', message: 'GOOGLE_SHEET_RANGE non valido', hint: "Imposta GOOGLE_SHEET_RANGE come 'NomeFoglio!A:E'" };
  }
}

async function appendRSVPRow({ nomeCognome, partecipazione, nomiPartecipanti, intolleranze, messaggio, adulti, bambini }) {
  assertSheetsConfig();
  const sheets = await getSheetsClient();
  const newRow = [
    new Date().toISOString(),
    String(nomeCognome || ''),
    String(partecipazione || ''),
    String(nomiPartecipanti || ''),
    String(intolleranze || ''),
    String(messaggio || ''),
    // Campi numerici
    String(typeof adulti !== 'undefined' ? adulti : ''),
    String(typeof bambini !== 'undefined' ? bambini : ''),
  ];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: config.google.sheetId,
      range: config.sheets.range,
      valueInputOption: config.sheets.valueInputOption,
      resource: { values: [newRow] },
    });
  } catch (err) {
    const causeStatus = err?.response?.status || err?.cause?.status || err?.status;
    const causeMessage = err?.response?.data?.error?.message || err?.cause?.message || err?.message;
    const sheetTitle = (config.sheets.range || '').split('!')[0] || 'Sheet1';
    const creds = readServiceAccountCredentials();
    const serviceEmail = creds?.client_email;
    // Normalizza errori frequenti: range non valido o foglio inesistente
    if (causeMessage?.includes('Unable to parse range')) {
      throw { type: 'range_error', message: 'Intervallo Google Sheets non valido', hint: `Controlla GOOGLE_SHEET_RANGE (attuale: ${config.sheets.range})`, details: { status: causeStatus, message: causeMessage } };
    }
    if (String(causeStatus) === '404' || /Requested entity was not found/i.test(String(causeMessage))) {
      throw {
        type: 'sheets_error',
        message: 'Foglio non trovato o accesso negato',
        hint: `Verifica GOOGLE_SHEET_ID e condividi il documento con ${serviceEmail || 'il Service Account'} (Editor). Assicurati che il tab '${sheetTitle}' esista o aggiorna GOOGLE_SHEET_RANGE.`,
        details: { status: causeStatus, message: causeMessage }
      };
    }
    throw { type: 'sheets_error', message: 'Errore in append su Google Sheets', details: { status: causeStatus, message: causeMessage } };
  }
}

module.exports = { appendRSVPRow };