import nodemailer from 'nodemailer';
import 'dotenv/config';
import { google } from 'googleapis';
import createSupportMessageTemplate from './mail-templates/createSupportMessageTemplate.js';
import createSupportMessageConfirmationTemplate from './mail-templates/createSupportMessageConfirmationTemplate.js';
import createChangePasswordTemplate from './mail-templates/createChangePasswordTemplate.js';
import createVerificationEmailTemplate from './mail-templates/createVerificationEmailTemplate.js';
import createInfoMessageTemplate from './mail-templates/createInfoMessageTemplate.js';
import createInscriptionNotificationEmailTemplate from './mail-templates/createInscriptionNotificationEmailTemplate.js';



const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
  tls: {
    rejectUnauthorized: false,
  },
});

const mailToken = new Promise((resolve, reject) => {
  oauth2Client.getAccessToken((err, tokens) => {
    if (err) reject(err);
    resolve(tokens.access_token);
  });
});

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    type: 'OAuth2',
    user: process.env.USER_EMAIL,
    pass: process.env.EMAIL_PASSWORD,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
    mailToken,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function sendEmailVerification(email, tokenAccess) {
  console.log('Enviando email de verificación');
  return await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verificación de tu cuenta de EduPlat.org',
    html: createVerificationEmailTemplate(tokenAccess),
  });
}

export async function sendNewPassword(email, password) {
  return await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Nueva contraseña de EduPlat.org',
    html: createChangePasswordTemplate(password),
  });
}

export async function sendSupportMail(name, surname, email, subject, message) {
  // TODO: actualizar correo de soporte

  // TODO: no está cogiendo bien los estilos

  return await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: 'eduplat.bienesdar@gmail.com',
    subject: `Mensaje de soporte: ${subject} - ${email}`,
    html: createSupportMessageTemplate(name, surname, email, subject, message),
  });
}

export async function sendSupportMailConfirmation(name, surname, email, subject, message) {
  return await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Su mensaje ha sido enviado correctamente`,
    html: createSupportMessageConfirmationTemplate(name, surname, email, subject, message),
  });
}

export async function sendInfoMail(name, surname, email, subject, message) {
  return await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    html: createInfoMessageTemplate(name, surname, email, subject, message),
  });
}

export async function sendAdminMail(name, surname, email, subject, message) {
  // TODO: actualizar correo de soporte

  return await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: 'eduplat.bienesdar@gmail.com',
    subject: `Atención: ${subject}.`,
    html: createInfoAdminMailTemplate(name, surname, email, subject, message),
  });
}

export async function sendInscriptionNotificationEmail(inscription, eventWithUserInscription, userWithInscription) {
  const { firstname: name, lastname: surname, email } = userWithInscription
  const event = eventWithUserInscription.title;
  const subject = 'Nueva inscripción a procesar';
  const { description } = inscription;
  const message =
    `Nueva inscripción al evento ${event} para su procesamiento
    <br/><br/>
    Mensaje asociado: ${description}
    `

  return await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: 'eduplat.bienesdar@gmail.com',
    subject: subject,
    html: createInscriptionNotificationEmailTemplate(name, surname, email, subject, message),
  });
}
