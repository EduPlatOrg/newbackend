import nodemailer from 'nodemailer';
import 'dotenv/config';
import { google } from 'googleapis';

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
    rejectUnauthorized: false
  }
});

export async function sendEmailVerification(email, tokenAccess) {
  console.log('Enviando email de verificación');
  return await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verificación de tu cuenta de EduPlat.org',
    html: createVerificationEmail(tokenAccess),
  });
}

export const createVerificationEmail = (tokenAccess) => {
  return `
  <!DOCTYPE html>
  <html lang="es">
    <style>
    html {
      background-color: #ffffff;
    }
  
    body {
      max-width: 600px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: auto;
      background-color: rgb(229, 255, 246);
      padding: 40px;
      border-radius: 4px;
      margin-top: 10px;
    }
  
    h1 {
      color: #17415f;
      margin-bottom: 20px;
    }
  
    p {
      margin-bottom: 15px;
      color: #17415f;
    }
  
    a {
      color: #17415f;
      text-decoration: none;
      font-style: italic;
      font-weight: bold;
    }
  
    a:hover {
      text-decoration: underline;
    }
  
    strong {
      color: #17415f;
    }
  
    .firma {
      font-weight: bold;
      color: #ff8c00;
    }
    </style>
    <body>
    <h1>Verificando su cuenta de Eduplat.org</h1>
    <p>Se ha creado una cuenta en eduplat.org con este correo electrónico, si usted no ha creado la cuenta, desestime este correo, si usted la creo, entonces verifíquela<a href="http://localhost:5173/verify/${tokenAccess}" target="_blank" rel="noopener noreferrer"> haciendo click en este link</a>. Será redirigido automáticamente al inicio de sesión.</p>
    <br/>
    <p class='firma'>Equipo de EduPlat.</p>
  `;
};

export async function sendNewPassword(email, password) {
  return await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Nueva contraseña de EduPlat.org',
    html: createChangePassword(password),
  });
}

export const createChangePassword = (password) => {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <style>
  html {
    background-color: #ffffff;
  }

  body {
    max-width: 600px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: auto;
    background-color: rgb(229, 255, 246);
    padding: 40px;
    border-radius: 4px;
    margin-top: 10px;
  }

  h1 {
    color: #17415f;
    margin-bottom: 20px;
  }

  p {
    margin-bottom: 15px;
    color: #17415f;
  }

  a {
    color: #17415f;
    text-decoration: none;
    font-style: italic;
    font-weight: bold;
  }

  a:hover {
    text-decoration: underline;
  }

  strong {
    color: #17415f;
  }

  .firma {
    font-weight: bold;
    color: #ff8c00;
  }
</style>
    <body>
    <h1>Tu nueva contraseña de Eduplat.org</h1>
    <p>Esta es tu nueva contraseña para acceder a Eduplat.org:${password} , una vez hayas accedido de nuevo, puedes cambiarla en cualquier momento desde la página de tu perfil.</p>
    <p>Vuelve al inicio de sesión <a href="http://localhost:5173/login-page" target="_blank" rel="noopener noreferrer">haciendo clic aquí</a>.</p>
    <br/>
      <p class='firma'>Equipo de Eduplat.</p>
  </body>
  </html>`;
};
