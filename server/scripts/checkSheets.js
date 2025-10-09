const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const config = require('../config');

function colIndexToLetter(idx) {
  return String.fromCharCode('A'.charCodeAt(0) + idx);
}

function parseRange(rangeStr) {
  if (!rangeStr || !rangeStr.includes('!') || !rangeStr.includes(':')) {
    throw new Error(`Formato intervallo non valido: '${rangeStr}'. Atteso '<TitoloTab>!A:H'`);
  }
  const [title, cols] = rangeStr.split('!');
  const [startCol, endCol] = cols.split(':');
  return { title, startCol, endCol };
}

function readServiceAccountCredentials() {
  const keyFile = config.google.keyFile || 'credentials.json';
  const exists = fs.existsSync(keyFile);
  if (!exists) {
    throw new Error(`File credenziali non trovato: ${keyFile}`);
  }
  const raw = fs.readFileSync(keyFile, 'utf8');
  let json;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    throw new Error(`JSON credenziali non valido: ${e.message}`);
  }
  const { client_email, private_key } = json || {};
  if (!client_email || !private_key) {
    throw new Error('Credenziali mancanti: assicurati che esistano client_email e private_key');
  }
  return { client_email, private_key, rawJson: json, keyFilePath: path.resolve(keyFile) };
}

async function getSheetsClient(creds) {
  const jwt = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: config.google.scopes,
  });
  await jwt.authorize();
  return google.sheets({ version: 'v4', auth: jwt });
}

async function main() {
  const result = {
    env: {
      GOOGLE_SHEET_ID: Boolean(config.google.sheetId),
      GOOGLE_KEY_FILE: Boolean(config.google.keyFile),
      GOOGLE_SHEET_RANGE: Boolean(config.sheets.range),
    },
    checks: [],
    hints: [],
  };

  // Basic env checks
  if (!config.google.sheetId) result.hints.push('Imposta GOOGLE_SHEET_ID con l\'ID del documento (tra /d/ e /edit nell\'URL).');
  if (!config.sheets.range) result.hints.push("Imposta GOOGLE_SHEET_RANGE nel formato '<TitoloTab>!A:H'.");

  let parsed;
  try {
    parsed = parseRange(config.sheets.range);
    result.checks.push({ name: 'range_format', ok: true, details: parsed });
  } catch (e) {
    result.checks.push({ name: 'range_format', ok: false, error: e.message });
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  // Read credentials
  let creds;
  try {
    creds = readServiceAccountCredentials();
    result.checks.push({ name: 'credentials_file', ok: true, details: { path: creds.keyFilePath, client_email: creds.client_email } });
    // Optional lint: warn strange fields
    const c = creds.rawJson || {};
    ['auth_uri', 'token_uri', 'auth_provider_x509_cert_url', 'client_x509_cert_url'].forEach((k) => {
      const v = c[k];
      if (typeof v === 'string' && (v.includes('`') || v.includes(' '))) {
        result.hints.push(`Campo '${k}' contiene backtick/spazi extra: opzionale ma consigliato pulire l\'URL.`);
      }
    });
  } catch (e) {
    result.checks.push({ name: 'credentials_file', ok: false, error: e.message });
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  // Authenticate and read spreadsheet metadata
  let sheets;
  try {
    sheets = await getSheetsClient(creds);
    result.checks.push({ name: 'google_auth', ok: true });
  } catch (e) {
    result.checks.push({ name: 'google_auth', ok: false, error: e.message });
    result.hints.push('Verifica che il Service Account abbia accesso al documento e che la private_key sia corretta.');
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  // Fetch spreadsheet metadata
  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId: config.google.sheetId });
    const titles = (meta.data.sheets || []).map((s) => s.properties.title);
    const found = titles.includes(parsed.title);
    result.checks.push({ name: 'sheet_access', ok: true, details: { titles } });
    result.checks.push({ name: 'tab_exists', ok: found, details: { expected: parsed.title } });
    if (!found) {
      result.hints.push(`Tab '${parsed.title}' non trovato. Usa uno tra: ${titles.join(', ')}. Aggiorna GOOGLE_SHEET_RANGE.`);
      console.log(JSON.stringify(result, null, 2));
      process.exit(1);
    }
  } catch (e) {
    const status = e?.response?.status || e?.code || 'unknown';
    result.checks.push({ name: 'sheet_access', ok: false, error: e?.message, status });
    if (String(status) === '404') {
      result.hints.push('404 su spreadsheets.get: ID errato o documento non condiviso con il Service Account.');
      result.hints.push(`Condividi il foglio con: ${creds.client_email} (Editor).`);
    }
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  // Try a safe read to validate range parsing on values API
  try {
    const headerRange = `${parsed.title}!${parsed.startCol}1:${parsed.endCol}1`;
    const resp = await sheets.spreadsheets.values.get({ spreadsheetId: config.google.sheetId, range: headerRange });
    result.checks.push({ name: 'values_get_header', ok: true, details: { range: headerRange, sample: resp.data?.values } });
  } catch (e) {
    const msg = e?.response?.data?.error?.message || e.message;
    result.checks.push({ name: 'values_get_header', ok: false, error: msg });
    if (msg?.includes('Unable to parse range')) {
      result.hints.push(`Intervallo non parsabile: controlla GOOGLE_SHEET_RANGE (attuale: ${config.sheets.range}).`);
    }
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  // Final output
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

main();