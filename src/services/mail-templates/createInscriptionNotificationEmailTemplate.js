const createInscriptionNotificationEmailTemplate = (name, surname, email, subject, message) => {
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
        <h1>${subject}</h1>
        <p>${message}</p>
        <br/>
        <p class='strong'>Usuario:<p/>
        <p>${name} ${surname} -- ${email}</p>
      </body>
    </html>`
  };
  
export default createInscriptionNotificationEmailTemplate;