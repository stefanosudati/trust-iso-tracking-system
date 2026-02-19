/**
 * Email service module.
 * Configures nodemailer from environment variables.
 * If SMTP is not configured, sendMail becomes a no-op.
 */
const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

const isConfigured = !!(SMTP_HOST && SMTP_USER && SMTP_PASS);

let transporter = null;

if (isConfigured) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
  console.log(`Email SMTP configurato: ${SMTP_HOST}:${SMTP_PORT}`);
} else {
  console.warn(
    'SMTP non configurato (SMTP_HOST, SMTP_USER, SMTP_PASS mancanti). Le email non verranno inviate.'
  );
}

/**
 * Send an email. No-op if SMTP is not configured.
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML body
 * @returns {Promise<object|null>} nodemailer info object, or null if not configured
 */
async function sendMail(to, subject, html) {
  if (!transporter) {
    return null;
  }

  try {
    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      html,
    });
    return info;
  } catch (err) {
    console.error(`Errore invio email a ${to}:`, err.message);
    throw err;
  }
}

module.exports = { sendMail, isConfigured };
