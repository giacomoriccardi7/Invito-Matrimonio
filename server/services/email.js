const nodemailer = require('nodemailer');
const config = require('../config');
let Resend;
try {
  Resend = require('resend').Resend;
} catch (_) {
  Resend = null;
}

function createTransport() {
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    // secure true for 465, false for 587; configurable via env
    secure: config.email.secure,
    requireTLS: true,
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
  // Priorità: prova SMTP. Se fallisce con timeout/connessione su Render, usa Resend come fallback se configurato.
  const mailOptions = createRSVPEmailTemplate(rsvpData);
  const useSMTP = Boolean(config.email.host && config.email.user && config.email.pass);

  if (useSMTP) {
    const transporter = createTransport();
    try {
      await transporter.verify();
      await transporter.sendMail(mailOptions);
      return;
    } catch (err) {
      // Se SMTP non va e abbiamo Resend, prosegui con fallback
      const isConnError = ['ETIMEDOUT', 'ECONNREFUSED', 'ENOTFOUND'].includes(err?.code);
      if (!config.email.resendApiKey || !Resend || (!isConnError && err?.code !== 'EAUTH')) {
        throw {
          type: 'email_config',
          message: 'Invio email fallito via SMTP',
          hint: 'Verifica App Password Gmail, porta e secure. In alternativa configura RESEND_API_KEY.',
          details: { message: err?.message || String(err), code: err?.code, command: err?.command }
        };
      }
    }
  }

  // Fallback: Resend API
  if (config.email.resendApiKey && Resend) {
    const client = new Resend(config.email.resendApiKey);
    const from = config.email.resendFrom || `RSVP Wedding <${config.email.user || 'no-reply@domain.com'}>`;
    const payload = {
      from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html,
    };
    const result = await client.emails.send(payload);
    if (result?.error) {
      throw {
        type: 'email_resend_error',
        message: 'Invio email fallito via Resend',
        details: result.error
      };
    }
    return;
  }

  // Nessun provider disponibile
  throw {
    type: 'email_no_provider',
    message: 'Nessun provider email configurato (SMTP o RESEND_API_KEY)'
  };
}

async function verifySMTP() {
  const transporter = createTransport();
  try {
    await transporter.verify();
    return { ok: true };
  } catch (err) {
    // Se SMTP fallisce, prova Resend come verifica alternativa
    if (config.email.resendApiKey && Resend) {
      try {
        const client = new Resend(config.email.resendApiKey);
        // Verifica minimale: chiama API per ottenere un token valido inviando un'email di prova a se stessi con tag
        const result = await client.emails.send({
          from: config.email.resendFrom || `RSVP Wedding <${config.email.user || 'no-reply@domain.com'}>`,
          to: config.email.recipient,
          subject: 'Verifica Configurazione Email (Resend)',
          html: '<p>Verifica automatica configurazione Resend.</p>'
        });
        if (!result?.error) return { ok: true, via: 'resend' };
        return { ok: false, error: result.error };
      } catch (e) {
        return { ok: false, error: { message: e?.message || String(e) } };
      }
    }
    return { ok: false, error: { message: err?.message || String(err), code: err?.code, command: err?.command } };
  }
}

module.exports = { sendRSVPNotification, verifySMTP };