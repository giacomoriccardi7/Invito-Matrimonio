const { google } = require('googleapis');
const fs = require('fs');
const config = require('../config');

function readServiceAccountCredentials() {
  try {
    const raw = fs.readFileSync(config.google.keyFile, 'utf8');
    const json = JSON.parse(raw);
    const { client_email, private_key } = json || {};
    if (!client_email || !private_key) {
      throw new Error('Credenziali Google non valide');
    }
    return { client_email, private_key };
  } catch (err) {
    console.warn('[GoogleAuth] Impossibile leggere le credenziali dal file:', err?.message || err);
    return null;
  }
}

async function getSheetsClient() {
  const credentials = readServiceAccountCredentials();
  const { client_email, private_key } = credentials || {};
  const jwt = new google.auth.JWT({
    email: client_email,
    key: private_key,
    scopes: config.google.scopes,
  });
  await jwt.authorize();
  return google.sheets({ version: 'v4', auth: jwt });
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
    const causeStatus = err?.cause?.status || err?.status;
    const causeMessage = err?.cause?.message || err?.message;
    // Normalizza errori frequenti: range non valido o foglio inesistente
    if (causeMessage?.includes('Unable to parse range')) {
      throw { type: 'range_error', message: 'Intervallo Google Sheets non valido', hint: `Controlla GOOGLE_SHEET_RANGE (attuale: ${config.sheets.range})`, details: { status: causeStatus, message: causeMessage } };
    }
    throw { type: 'sheets_error', message: 'Errore in append su Google Sheets', details: { status: causeStatus, message: causeMessage } };
  }
}

module.exports = { appendRSVPRow };