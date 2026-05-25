import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.email.host,
      port: env.email.port,
      auth: env.email.user && env.email.pass ? { user: env.email.user, pass: env.email.pass } : undefined
    });
  }
  return transporter;
};

export const sendEmail = async ({ to, subject, text, html }) => {
  if (env.email.debug || !env.email.host) {
    console.log('[email][debug]', { to, subject, text });
    return { accepted: [to], rejected: [] };
  }

  const mailer = getTransporter();
  return mailer.sendMail({
    from: env.email.from,
    to,
    subject,
    text,
    html
  });
};
