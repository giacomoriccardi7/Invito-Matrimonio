const nodemailer = require('nodemailer');
const config = require('../config');

function createTransport() {
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
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
  const transporter = createTransport();
  // Verifica la configurazione SMTP prima dell'invio per segnalare errori chiari
  try {
    await transporter.verify();
  } catch (err) {
    const causeMessage = err?.message || String(err);
    throw {
      type: 'email_config',
      message: 'Configurazione SMTP non valida',
      hint: 'Per Gmail usa host smtp.gmail.com, porta 465, secure=true e una App Password.',
      details: { message: causeMessage }
    };
  }

  const mailOptions = createRSVPEmailTemplate(rsvpData);
  await transporter.sendMail(mailOptions);
}

module.exports = { sendRSVPNotification };