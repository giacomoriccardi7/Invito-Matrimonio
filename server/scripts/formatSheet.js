const { google } = require('googleapis');
const fs = require('fs');
const config = require('../config');

function colLetterToIndex(letter) {
  const l = letter.toUpperCase();
  return l.charCodeAt(0) - 'A'.charCodeAt(0);
}

function parseRange(rangeStr) {
  // e.g., "Sheet1!A:H"
  const [title, cols] = rangeStr.split('!');
  const [startCol, endCol] = cols.split(':');
  return { title, startIndex: colLetterToIndex(startCol), endIndex: colLetterToIndex(endCol) + 1 };
}

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

async function main() {
  if (!config.google.sheetId) throw new Error('GOOGLE_SHEET_ID mancante');
  const parsed = parseRange(config.sheets.range);
  const sheets = await getSheetsClient();

  // Recupera sheetId dal titolo del tab
  const meta = await sheets.spreadsheets.get({ spreadsheetId: config.google.sheetId });
  const sheet = meta.data.sheets.find((s) => s.properties.title === parsed.title);
  if (!sheet) throw new Error(`Tab con titolo '${parsed.title}' non trovato`);
  const sheetId = sheet.properties.sheetId;

  // Imposta intestazioni (A1:H1)
  const headers = [
    'Data',
    'Nome e Cognome',
    'Partecipazione',
    'Nomi Partecipanti',
    'Intolleranze',
    'Messaggio',
    'Adulti',
    'Bambini',
  ];
  await sheets.spreadsheets.values.update({
    spreadsheetId: config.google.sheetId,
    range: `${parsed.title}!A1:H1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [headers] },
  });

  const requests = [];

  // Congela la prima riga
  requests.push({
    updateSheetProperties: {
      properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
      fields: 'gridProperties.frozenRowCount',
    },
  });

  // Stile intestazioni (riga 1)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 0,
        endRowIndex: 1,
        startColumnIndex: parsed.startIndex,
        endColumnIndex: parsed.endIndex,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 0.86, green: 0.95, blue: 0.90 }, // verde chiaro
          textFormat: { bold: true },
          horizontalAlignment: 'CENTER',
        },
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
    },
  });

  // Allineamento numerico per adulti (G) e bambini (H)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: 1000,
        startColumnIndex: colLetterToIndex('G'),
        endColumnIndex: colLetterToIndex('H') + 1,
      },
      cell: { userEnteredFormat: { horizontalAlignment: 'RIGHT', numberFormat: { type: 'NUMBER', pattern: '0' } } },
      fields: 'userEnteredFormat(horizontalAlignment,numberFormat)',
    },
  });

  // Wrapping per Messaggio (F)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: 1000,
        startColumnIndex: colLetterToIndex('F'),
        endColumnIndex: colLetterToIndex('F') + 1,
      },
      cell: { userEnteredFormat: { wrapStrategy: 'WRAP' } },
      fields: 'userEnteredFormat.wrapStrategy',
    },
  });

  // Bordi tabella (A1:H1000)
  requests.push({
    updateBorders: {
      range: {
        sheetId,
        startRowIndex: 0,
        endRowIndex: 1000,
        startColumnIndex: parsed.startIndex,
        endColumnIndex: parsed.endIndex,
      },
      top: { style: 'SOLID', width: 1, color: { red: 0.75, green: 0.75, blue: 0.75 } },
      bottom: { style: 'SOLID', width: 1, color: { red: 0.75, green: 0.75, blue: 0.75 } },
      left: { style: 'SOLID', width: 1, color: { red: 0.75, green: 0.75, blue: 0.75 } },
      right: { style: 'SOLID', width: 1, color: { red: 0.75, green: 0.75, blue: 0.75 } },
      innerHorizontal: { style: 'SOLID', width: 1, color: { red: 0.9, green: 0.9, blue: 0.9 } },
      innerVertical: { style: 'SOLID', width: 1, color: { red: 0.9, green: 0.9, blue: 0.9 } },
    },
  });

  // Condizionale: Partecipazione = "Si" (verde) e "No" (rosso)
  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [{ sheetId, startRowIndex: 1, startColumnIndex: colLetterToIndex('C'), endColumnIndex: colLetterToIndex('C') + 1 }],
        booleanRule: {
          condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'Si' }] },
          format: { backgroundColor: { red: 0.88, green: 0.97, blue: 0.92 }, textFormat: { foregroundColor: { red: 0.11, green: 0.45, blue: 0.26 }, bold: true } },
        },
      },
      index: 0,
    },
  });
  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [{ sheetId, startRowIndex: 1, startColumnIndex: colLetterToIndex('C'), endColumnIndex: colLetterToIndex('C') + 1 }],
        booleanRule: {
          condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'No' }] },
          format: { backgroundColor: { red: 0.98, green: 0.91, blue: 0.91 }, textFormat: { foregroundColor: { red: 0.69, green: 0.0, blue: 0.12 }, bold: true } },
        },
      },
      index: 0,
    },
  });

  // Condizionale: Intolleranze non vuoto (evidenzia giallo) su colonna E
  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [{ sheetId, startRowIndex: 1, startColumnIndex: colLetterToIndex('E'), endColumnIndex: colLetterToIndex('E') + 1 }],
        booleanRule: {
          condition: { type: 'CUSTOM_FORMULA', values: [{ userEnteredValue: '=LEN($E2)>0' }] },
          format: { backgroundColor: { red: 1.0, green: 0.97, blue: 0.84 } },
        },
      },
      index: 0,
    },
  });

  // Esecuzione batch
  await sheets.spreadsheets.batchUpdate({ spreadsheetId: config.google.sheetId, requestBody: { requests } });

  console.log('[formatSheet] Formattazione applicata con successo su', parsed.title);
}

main().catch((err) => {
  console.error('[formatSheet] Errore:', err?.message || err);
  if (err?.response?.data) console.error(JSON.stringify(err.response.data, null, 2));
  process.exit(1);
});