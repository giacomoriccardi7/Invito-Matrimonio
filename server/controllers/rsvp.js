const { appendRSVPRow } = require('../services/sheets');
const { sendRSVPNotification } = require('../services/email');

function validateBody(body) {
  const errors = [];
  const nomeCognome = String(body?.nomeCognome || '').trim();
  const partecipazione = String(body?.partecipazione || '').trim();
  const messaggio = String(body?.messaggio || '').trim();
  const adulti = Number(body?.adulti ?? 0);
  const bambini = Number(body?.bambini ?? 0);
  const nomiPartecipanti = String(body?.nomiPartecipanti || '').trim();

  if (!nomeCognome) errors.push('nomeCognome è obbligatorio');
  if (!partecipazione) errors.push('partecipazione è obbligatoria');
  if (!messaggio) errors.push('messaggio è obbligatorio');

  if (partecipazione === 'Si') {
    if (!(adulti >= 1)) errors.push('adulti deve essere almeno 1');
    if (!(bambini >= 0)) errors.push('bambini deve essere 0 o superiore');
  }

  return {
    errors,
    data: {
      nomeCognome,
      partecipazione,
      adulti: partecipazione === 'Si' ? adulti : 0,
      bambini: partecipazione === 'Si' ? bambini : 0,
      nomiPartecipanti,
      intolleranze: String(body?.intolleranze || '').trim(),
      messaggio,
    },
  };
}

async function handleRsvp(req, res) {
  const { errors, data } = validateBody(req.body);
  if (errors.length) {
    return res.status(400).json({ error: 'Campi non validi', details: errors });
  }

  try {
    await appendRSVPRow(data);
  } catch (err) {
    console.error('[RSVP] Errore Google Sheets:', err);
    if (err?.type === 'config_error' || err?.type === 'range_error') {
      return res.status(400).json({ error: err.message, hint: err.hint, details: err.details });
    }
    return res.status(500).json({ error: 'Errore salvataggio su Google Sheets', hint: err?.hint, message: err?.message, details: err?.details });
  }

  try {
    await sendRSVPNotification(data);
  } catch (err) {
    console.error('[RSVP] Errore invio email:', err);
    // Non blocchiamo la risposta per errore email: informiamo il client ma manteniamo success
    return res.status(200).json({ success: true, warning: 'RSVP salvato, ma invio email fallito', emailError: err });
  }

  return res.status(200).json({ success: true });
}

module.exports = { handleRsvp };