const nodemailer = require('nodemailer');
const config = require('../config');
let Resend;
try {
  Resend = require('resend').Resend;
} catch (_) {
  Resend = null;
}

function getRecipientsList() {
  const raw = String(config.email.recipient || '').trim();
  if (!raw) return [];
  // Supporta lista separata da virgola, rimuove spazi
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

function createTransport() {
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    // secure true for 465, false for 587; configurable via env
    secure: config.email.secure,
    requireTLS: true,
    // Riduci tempi di attesa per connessioni SMTP su piattaforme che bloccano
    connectionTimeout: 5000, // ms
    socketTimeout: 5000, // ms
    tls: { minVersion: 'TLSv1.2' },
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
}

function createRSVPEmailTemplate({ nomeCognome, partecipazione, intolleranze, messaggio }) {
  return {
    from: `RSVP Wedding <${config.email.user}>`,
    to: config.email.recipient,
    subject: `Nuova conferma presenza - ${nomeCognome}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #8B4513; border-bottom: 2px solid #8B4513; padding-bottom: 10px;">
          Nuova Conferma di Presenza
        </h2>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Nome e Cognome:</strong> ${String(nomeCognome || 'Non specificato')}</p>
          <p><strong>Partecipazione:</strong> ${String(partecipazione || 'Non specificato')}</p>
          <p><strong>Intolleranze/Allergie:</strong> ${String(intolleranze || 'Nessuna')}</p>
          <p><strong>Messaggio:</strong></p>
          <blockquote style="border-left: 4px solid #8B4513; padding-left: 15px; margin: 10px 0; font-style: italic;">
            ${String(messaggio || 'Nessun messaggio')}
          </blockquote>
        </div>
        <div style="background-color: #eef7f1; padding: 16px; border-radius: 8px;">
          <p><strong>Numero di Adulti:</strong> ${String(arguments[0]?.adulti ?? '0')}</p>
          <p><strong>Numero di Bambini:</strong> ${String(arguments[0]?.bambini ?? '0')}</p>
          ${String(arguments[0]?.nomiPartecipanti || '') ? `<p><strong>Nomi Partecipanti:</strong> ${String(arguments[0]?.nomiPartecipanti)}</p>` : ''}
        </div>
        <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
          Email automatica dal sistema RSVP - ${new Date().toLocaleString('it-IT')}
        </p>
      </div>
    `,
  };
}

async function sendRSVPNotification(rsvpData) {
  // Preferisci Resend se configurato: è rapido e non soffre dei timeout SMTP su Render.
  const mailOptions = createRSVPEmailTemplate(rsvpData);
  const hasResend = Boolean(config.email.resendApiKey && Resend);
  const hasSMTP = Boolean(config.email.host && config.email.user && config.email.pass);
  const recipients = getRecipientsList();
  if (!recipients.length) {
    throw { type: 'email_no_recipient', message: 'RECIPIENT_EMAIL mancante o vuoto' };
  }

  if (hasResend) {
    const client = new Resend(config.email.resendApiKey);
    const from = config.email.resendFrom || `RSVP Wedding <${config.email.user || 'no-reply@domain.com'}>`;
    // Invia per destinatario per gestire failure granulari
    const sendPromises = recipients.map((to) =>
      client.emails.send({ from, to, subject: mailOptions.subject, html: mailOptions.html })
        .then((res) => ({ to, ok: !res?.error, error: res?.error }))
        .catch((e) => ({ to, ok: false, error: { message: e?.message || String(e) } }))
    );
    const results = await Promise.allSettled(sendPromises);
    const statuses = results.map(r => r.status === 'fulfilled' ? r.value : r.reason);
    const failures = statuses.filter(s => !s.ok);
    const successes = statuses.filter(s => s.ok);
    if (successes.length === recipients.length) {
      return; // tutte inviate via Resend
    }
    // Se alcune falliscono e SMTP è disponibile, prova fallback su quelle
    if (failures.length && hasSMTP) {
      const transporter = createTransport();
      const failedRecipients = failures.map(f => f.to).filter(Boolean);
      try {
        const smtpOpts = { ...mailOptions, to: failedRecipients.join(', ') };
        await transporter.sendMail(smtpOpts);
        return;
      } catch (err) {
        // Se almeno una era andata con Resend, segnala ma non blocca totalmente
        if (successes.length) {
          throw {
            type: 'email_partial_failure',
            message: 'Alcuni destinatari non hanno ricevuto via Resend e SMTP è fallito',
            details: { failures, smtpError: { message: err?.message || String(err), code: err?.code, command: err?.command } }
          };
        }
        throw {
          type: 'email_smtp_error',
          message: 'Invio email fallito via SMTP (fallback)',
          hint: 'Verifica host, porta, secure e App Password. Su Render considera Resend.',
          details: { message: err?.message || String(err), code: err?.code, command: err?.command }
        };
      }
    }
    // Se non c'è SMTP e ci sono fallimenti, segnala errore
    if (failures.length && !hasSMTP) {
      throw { type: 'email_resend_error', message: 'Invio parziale via Resend: alcuni destinatari falliti', details: { failures } };
    }
    return;
  }

  if (hasSMTP) {
    const transporter = createTransport();
    try {
      const smtpOpts = { ...mailOptions, to: recipients.join(', ') };
      await transporter.sendMail(smtpOpts);
      return;
    } catch (err) {
      throw {
        type: 'email_smtp_error',
        message: 'Invio email fallito via SMTP',
        hint: 'Verifica host, porta, secure e App Password. Su Render considera Resend.',
        details: { message: err?.message || String(err), code: err?.code, command: err?.command }
      };
    }
  }

  throw { type: 'email_no_provider', message: 'Nessun provider email configurato (SMTP o RESEND_API_KEY)' };
}

async function verifySMTP() {
  // Preferisci Resend per una verifica rapida se disponibile
  if (config.email.resendApiKey && Resend) {
    try {
      const client = new Resend(config.email.resendApiKey);
      const recipients = getRecipientsList();
      const testTo = recipients[0] || config.email.user;
      const result = await client.emails.send({
        from: config.email.resendFrom || `RSVP Wedding <${config.email.user || 'no-reply@domain.com'}>`,
        to: testTo,
        subject: 'Verifica Configurazione Email (Resend)',
        html: '<p>Verifica automatica configurazione Resend.</p>'
      });
      if (!result?.error) return { ok: true, via: 'resend' };
      return { ok: false, error: result.error };
    } catch (e) {
      return { ok: false, error: { message: e?.message || String(e) } };
    }
  }

  const transporter = createTransport();
  try {
    await transporter.verify();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: { message: err?.message || String(err), code: err?.code, command: err?.command } };
  }
}

async function sendTestEmail(to, options = {}) {
  const subject = 'Test deliverability RSVP';
  const html = '<p>Test di consegna email dal backend RSVP.</p>';
  const hasResend = Boolean(config.email.resendApiKey && Resend);
  const hasSMTP = Boolean(config.email.host && config.email.user && config.email.pass);
  const wantProvider = String(options.provider || '').toLowerCase();
  const forceResend = wantProvider === 'resend';
  const forceSmtp = wantProvider === 'smtp';

  if (hasResend && !forceSmtp) {
    try {
      const client = new Resend(config.email.resendApiKey);
      const from = config.email.resendFrom || `RSVP Wedding <${config.email.user || 'no-reply@domain.com'}>`;
      const result = await client.emails.send({ from, to, subject, html });
      if (!result?.error) return { ok: true, via: 'resend' };
      if (!hasSMTP || forceResend) return { ok: false, via: 'resend', error: result.error };
      var resendError = result.error;
    } catch (e) {
      if (!hasSMTP || forceResend) return { ok: false, via: 'resend', error: { message: e?.message || String(e) } };
      var resendError = { message: e?.message || String(e) };
    }
  }

  if (hasSMTP && !forceResend) {
    try {
      const transporter = createTransport();
      await transporter.sendMail({ from: `RSVP Wedding <${config.email.user}>`, to, subject, html });
      return { ok: true, via: 'smtp', resendError };
    } catch (err) {
      return { ok: false, via: 'smtp', error: { message: err?.message || String(err), code: err?.code, command: err?.command }, resendError };
    }
  }

  return { ok: false, error: { message: 'Nessun provider email configurato' } };
}

module.exports = { sendRSVPNotification, verifySMTP, sendTestEmail };